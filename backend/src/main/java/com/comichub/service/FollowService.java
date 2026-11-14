package com.comichub.service;

import com.comichub.dto.follow.FollowNotificationRequest;
import com.comichub.dto.follow.FollowPageResponse;
import com.comichub.dto.follow.FollowRequest;
import com.comichub.dto.follow.FollowResponse;
import com.comichub.entity.Comic;
import com.comichub.entity.Follow;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.FollowRepository;
import com.comichub.repository.UserRepository;
import com.comichub.repository.UserRoleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class FollowService {

    private static final String COMIC = "COMIC";
    private static final String CREATOR = "CREATOR";
    private static final String PUBLISHED = "PUBLISHED";
    private static final Set<String> TARGET_TYPES = Set.of(COMIC, CREATOR);

    private final FollowRepository followRepository;
    private final ComicRepository comicRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    public FollowService(
            FollowRepository followRepository,
            ComicRepository comicRepository,
            UserRepository userRepository,
            UserRoleRepository userRoleRepository) {
        this.followRepository = followRepository;
        this.comicRepository = comicRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
    }

    public FollowPageResponse getFollows(String targetType, int page, int size) {
        User user = requireReaderRoleAndGetUser();
        validatePage(page, size);
        String normalizedType = normalizeTargetType(targetType, true);

        Page<Follow> follows = normalizedType == null
                ? followRepository.findByUser_IdOrderByCreatedAtDesc(
                        user.getId(), PageRequest.of(page, size))
                : followRepository.findByUser_IdAndTargetTypeOrderByCreatedAtDesc(
                        user.getId(), normalizedType, PageRequest.of(page, size));

        return new FollowPageResponse(
                follows.getContent().stream().map(this::toResponse).toList(),
                follows.getNumber(),
                follows.getSize(),
                follows.getTotalElements(),
                follows.getTotalPages());
    }

    @Transactional
    public FollowResponse createFollow(FollowRequest request) {
        User follower = requireReaderRoleAndGetUser();
        String targetType = normalizeTargetType(request.targetType(), false);
        validateId(request.targetId(), "targetId");

        Follow follow = new Follow();
        follow.setUser(follower);
        follow.setTargetType(targetType);
        follow.setNotifyEnabled(
                request.notifyEnabled() == null || request.notifyEnabled());
        follow.setCreatedAt(LocalDateTime.now());

        if (COMIC.equals(targetType)) {
            Comic comic = comicRepository.findWithAuthorById(request.targetId())
                    .filter(value -> PUBLISHED.equals(value.getModerationStatus())
                            && !Boolean.TRUE.equals(value.getIsDeleted()))
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy truyện công khai"));
            if (followRepository.existsByUser_IdAndTargetTypeAndComic_Id(
                    follower.getId(), COMIC, comic.getId())) {
                throw new DuplicateResourceException("Bạn đã theo dõi truyện này");
            }
            follow.setComic(comic);
        } else {
            User creator = userRepository.findById(request.targetId())
                    .filter(value -> "ACTIVE".equals(value.getStatus())
                            && userRoleRepository.findRoleNamesByUserId(value.getId())
                                    .contains("AUTHOR"))
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy creator đang hoạt động"));
            if (Objects.equals(follower.getId(), creator.getId())) {
                throw new AccessDeniedException("Không thể tự theo dõi chính mình");
            }
            if (followRepository.existsByUser_IdAndTargetTypeAndCreator_Id(
                    follower.getId(), CREATOR, creator.getId())) {
                throw new DuplicateResourceException("Bạn đã theo dõi creator này");
            }
            follow.setCreator(creator);
        }

        return toResponse(followRepository.save(follow));
    }

    @Transactional
    public FollowResponse updateNotifications(
            Long followId, FollowNotificationRequest request) {
        User user = requireReaderRoleAndGetUser();
        Follow follow = findOwnedFollow(followId, user.getId());
        follow.setNotifyEnabled(request.notifyEnabled());
        return toResponse(followRepository.save(follow));
    }

    @Transactional
    public void deleteFollow(Long followId) {
        User user = requireReaderRoleAndGetUser();
        Follow follow = findOwnedFollow(followId, user.getId());
        followRepository.delete(follow);
    }

    private Follow findOwnedFollow(Long followId, Long userId) {
        validateId(followId, "ID follow");
        return followRepository.findByIdAndUser_Id(followId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy follow"));
    }

    private FollowResponse toResponse(Follow follow) {
        if (COMIC.equals(follow.getTargetType())) {
            Comic comic = follow.getComic();
            return new FollowResponse(
                    follow.getId(),
                    follow.getTargetType(),
                    comic.getId(),
                    comic.getTitle(),
                    comic.getCoverUrl(),
                    follow.getNotifyEnabled(),
                    follow.getCreatedAt());
        }

        User creator = follow.getCreator();
        String name = creator.getDisplayName() == null
                || creator.getDisplayName().isBlank()
                ? creator.getUsername()
                : creator.getDisplayName();
        return new FollowResponse(
                follow.getId(),
                follow.getTargetType(),
                creator.getId(),
                name,
                creator.getAvatarUrl(),
                follow.getNotifyEnabled(),
                follow.getCreatedAt());
    }

    private User requireReaderRoleAndGetUser() {
        Authentication authentication = currentAuthentication();
        if (!hasRole(authentication, "USER") && !hasRole(authentication, "AUTHOR")) {
            throw new AccessDeniedException("Chỉ USER hoặc AUTHOR mới được dùng follow");
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

    private Authentication currentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private String normalizeTargetType(String targetType, boolean allowNull) {
        if ((targetType == null || targetType.isBlank()) && allowNull) {
            return null;
        }
        if (targetType == null || targetType.isBlank()) {
            throw new IllegalArgumentException("targetType không được để trống");
        }
        String normalized = targetType.trim().toUpperCase(Locale.ROOT);
        if (!TARGET_TYPES.contains(normalized)) {
            throw new IllegalArgumentException("targetType phải là COMIC hoặc CREATOR");
        }
        return normalized;
    }

    private void validatePage(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("page không được nhỏ hơn 0");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("size phải nằm trong khoảng 1 đến 100");
        }
    }

    private void validateId(Long id, String label) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(label + " phải là số nguyên dương");
        }
    }
}
