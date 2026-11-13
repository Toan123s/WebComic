package com.comichub.service;

import com.comichub.dto.category.CategoryCreateRequest;
import com.comichub.dto.category.CategoryResponse;
import com.comichub.dto.category.CategoryUpdateRequest;
import com.comichub.entity.Category;
import com.comichub.entity.Comic;
import com.comichub.entity.ComicCategory;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.CategoryRepository;
import com.comichub.repository.ComicCategoryRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private static final String PUBLISHED = "PUBLISHED";
    private final CategoryRepository categoryRepository;
    private final ComicCategoryRepository comicCategoryRepository;
    private final ComicRepository comicRepository;
    private final UserRepository userRepository;

    public CategoryService(
            CategoryRepository categoryRepository,
            ComicCategoryRepository comicCategoryRepository,
            ComicRepository comicRepository,
            UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.comicCategoryRepository = comicCategoryRepository;
        this.comicRepository = comicRepository;
        this.userRepository = userRepository;
    }

    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAllByOrderByNameAsc()
                .stream().map(this::toResponse).toList();
    }

    public CategoryResponse getCategory(Integer id) {
        return toResponse(findCategory(id));
    }

    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        requireAdmin();
        String name = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Tên thể loại đã tồn tại");
        }

        Category category = new Category();
        category.setName(name);
        category.setSlug(generateSlug(name));
        category.setDescription(normalizeDescription(request.description()));
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Integer id, CategoryUpdateRequest request) {
        requireAdmin();
        if (request.name() == null && request.description() == null) {
            throw new IllegalArgumentException(
                    "Cần cung cấp tên hoặc mô tả để cập nhật thể loại");
        }
        Category category = findCategory(id);
        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new IllegalArgumentException("Tên thể loại không được để trống");
            }
            String name = request.name().trim();
            if (!name.equalsIgnoreCase(category.getName())
                    && categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
                throw new DuplicateResourceException("Tên thể loại đã tồn tại");
            }
            category.setName(name);
        }
        if (request.description() != null) {
            category.setDescription(normalizeDescription(request.description()));
        }
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Integer id) {
        requireAdmin();
        Category category = findCategory(id);
        if (comicCategoryRepository.existsById_CategoryId(id)) {
            throw new DuplicateResourceException(
                    "Không thể xóa thể loại đang được gắn với truyện");
        }
        categoryRepository.delete(category);
    }

    public List<CategoryResponse> getComicCategories(Long comicId) {
        Comic comic = findComic(comicId);
        if (!isPublicComic(comic) && !canManage(comic, currentAuthentication())) {
            throw new ResourceNotFoundException("Không tìm thấy truyện");
        }
        return comicCategoryRepository.findAllById_ComicId(comicId).stream()
                .map(ComicCategory::getCategory)
                .sorted((left, right) -> left.getName().compareToIgnoreCase(right.getName()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<CategoryResponse> setComicCategories(
            Long comicId, List<Integer> categoryIds) {
        requireRole("AUTHOR");
        Comic comic = findComic(comicId);
        validateOwner(comic);
        if (!"DRAFT".equals(comic.getModerationStatus())
                && !"REJECTED".equals(comic.getModerationStatus())) {
            throw new DuplicateResourceException(
                    "Chỉ có thể đổi thể loại khi truyện ở DRAFT hoặc REJECTED");
        }
        if (categoryIds == null) {
            throw new IllegalArgumentException("Danh sách categoryIds không được để trống");
        }
        Set<Integer> uniqueIds = new HashSet<>(categoryIds);
        if (uniqueIds.size() != categoryIds.size()) {
            throw new IllegalArgumentException("Danh sách thể loại không được chứa ID trùng");
        }

        List<Category> categories = new ArrayList<>();
        for (Integer categoryId : categoryIds) {
            categories.add(findCategory(categoryId));
        }

        comicCategoryRepository.deleteAllById_ComicId(comicId);
        comicCategoryRepository.saveAll(
                categories.stream()
                        .map(category -> new ComicCategory(comic, category))
                        .toList());
        return categories.stream()
                .sorted((left, right) -> left.getName().compareToIgnoreCase(right.getName()))
                .map(this::toResponse)
                .toList();
    }

    private String generateSlug(String name) {
        String base = Normalizer.normalize(name.toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");
        if (base.isBlank()) {
            base = "category";
        }

        String candidate = limitSlug(base, "");
        int suffix = 2;
        while (categoryRepository.existsBySlug(candidate)) {
            String suffixText = "-" + suffix++;
            candidate = limitSlug(base, suffixText) + suffixText;
        }
        return candidate;
    }

    private String limitSlug(String slug, String suffix) {
        int maxBaseLength = 60 - suffix.length();
        String truncated = slug.length() > maxBaseLength
                ? slug.substring(0, maxBaseLength)
                : slug;
        return truncated.replaceAll("-+$", "");
    }

    private Category findCategory(Integer id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID thể loại phải là số nguyên dương");
        }
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy thể loại có ID: " + id));
    }

    private Comic findComic(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID truyện phải là số nguyên dương");
        }
        Comic comic = comicRepository.findWithAuthorById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy truyện có ID: " + id));
        if (Boolean.TRUE.equals(comic.getIsDeleted())) {
            throw new ResourceNotFoundException("Không tìm thấy truyện");
        }
        return comic;
    }

    private void validateOwner(Comic comic) {
        User user = getCurrentUser();
        if (!Objects.equals(comic.getAuthor().getId(), user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền quản lý truyện này");
        }
    }

    private boolean canManage(Comic comic, Authentication authentication) {
        if (hasRole(authentication, "MODERATOR") || hasRole(authentication, "ADMIN")) {
            return true;
        }
        if (!isAuthenticated(authentication)) {
            return false;
        }
        return userRepository.findByUsername(authentication.getName())
                .map(user -> Objects.equals(comic.getAuthor().getId(), user.getId()))
                .orElse(false);
    }

    private void requireAdmin() {
        requireRole("ADMIN");
    }

    private void requireRole(String role) {
        if (!hasRole(currentAuthentication(), role)) {
            throw new AccessDeniedException("Bạn không có quyền thực hiện thao tác này");
        }
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> Objects.equals(
                        authority.getAuthority(), "ROLE_" + role));
    }

    private boolean isAuthenticated(Authentication authentication) {
        return authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
    }

    private User getCurrentUser() {
        Authentication authentication = currentAuthentication();
        if (!isAuthenticated(authentication)) {
            throw new AccessDeniedException("Bạn chưa đăng nhập");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản: " + authentication.getName()));
    }

    private Authentication currentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private boolean isPublicComic(Comic comic) {
        return PUBLISHED.equals(comic.getModerationStatus())
                && !Boolean.TRUE.equals(comic.getIsDeleted());
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }
        return description.isBlank() ? null : description.trim();
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getCreatedAt());
    }
}

