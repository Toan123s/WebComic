package com.comichub.service;

import com.comichub.dto.notification.NotificationPageResponse;
import com.comichub.dto.notification.NotificationResponse;
import com.comichub.entity.Chapter;
import com.comichub.entity.Notification;
import com.comichub.entity.User;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.FollowRepository;
import com.comichub.repository.NotificationRepository;
import com.comichub.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            FollowRepository followRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.followRepository = followRepository;
        this.userRepository = userRepository;
    }

    public NotificationPageResponse getNotifications(int page, int size) {
        User user = requireReaderRoleAndGetUser();
        validatePage(page, size);
        Page<Notification> notifications = notificationRepository
                .findByUser_IdOrderByCreatedAtDesc(
                        user.getId(), PageRequest.of(page, size));
        return new NotificationPageResponse(
                notifications.getContent().stream().map(this::toResponse).toList(),
                notifications.getNumber(),
                notifications.getSize(),
                notifications.getTotalElements(),
                notifications.getTotalPages(),
                notificationRepository.countByUser_IdAndReadAtIsNull(user.getId()));
    }

    public long getUnreadCount() {
        User user = requireReaderRoleAndGetUser();
        return notificationRepository.countByUser_IdAndReadAtIsNull(user.getId());
    }

    @Transactional
    public NotificationResponse markRead(Long notificationId) {
        User user = requireReaderRoleAndGetUser();
        if (notificationId == null || notificationId <= 0) {
            throw new IllegalArgumentException("ID notification phải là số nguyên dương");
        }
        Notification notification = notificationRepository
                .findByIdAndUser_Id(notificationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy notification"));
        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
        }
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public int markAllRead() {
        User user = requireReaderRoleAndGetUser();
        return notificationRepository.markAllReadByUserId(
                user.getId(), LocalDateTime.now());
    }

    @Transactional
    public void createForPublishedChapter(Chapter chapter) {
        Long comicId = chapter.getComic().getId();
        Long creatorId = chapter.getComic().getAuthor().getId();
        Set<Long> recipientIds = new LinkedHashSet<>(
                followRepository.findActiveComicFollowerIds(comicId));
        recipientIds.addAll(followRepository.findActiveCreatorFollowerIds(creatorId));
        recipientIds.remove(creatorId);
        if (recipientIds.isEmpty()) {
            return;
        }

        LocalDateTime createdAt = LocalDateTime.now();
        List<Notification> notifications = new ArrayList<>(recipientIds.size());
        for (Long recipientId : recipientIds) {
            Notification notification = new Notification();
            notification.setUser(userRepository.getReferenceById(recipientId));
            notification.setChapter(chapter);
            notification.setType("NEW_CHAPTER");
            notification.setCreatedAt(createdAt);
            notifications.add(notification);
        }
        notificationRepository.saveAll(notifications);
    }

    private NotificationResponse toResponse(Notification notification) {
        Chapter chapter = notification.getChapter();
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                chapter.getId(),
                chapter.getTitle(),
                chapter.getComic().getId(),
                chapter.getComic().getTitle(),
                notification.getCreatedAt(),
                notification.getReadAt());
    }

    private User requireReaderRoleAndGetUser() {
        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();
        if (!hasRole(authentication, "USER") && !hasRole(authentication, "AUTHOR")) {
            throw new AccessDeniedException("Chỉ USER hoặc AUTHOR mới được dùng notification");
        }
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AccessDeniedException("Bạn chưa đăng nhập");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản hiện tại"));
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> Objects.equals(
                        authority.getAuthority(), "ROLE_" + role));
    }

    private void validatePage(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("page không được nhỏ hơn 0");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("size phải nằm trong khoảng 1 đến 100");
        }
    }
}
