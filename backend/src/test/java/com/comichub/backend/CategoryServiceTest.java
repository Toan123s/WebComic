package com.comichub.backend;

import com.comichub.dto.category.CategoryCreateRequest;
import com.comichub.dto.category.CategoryUpdateRequest;
import com.comichub.entity.Category;
import com.comichub.entity.Comic;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.repository.CategoryRepository;
import com.comichub.repository.ComicCategoryRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.UserRepository;
import com.comichub.service.CategoryService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private ComicCategoryRepository comicCategoryRepository;
    @Mock
    private ComicRepository comicRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CategoryService categoryService;

    @BeforeEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void adminCreatesCategoryWithNormalizedSlug() {
        setAuthentication("admin", "ADMIN");
        when(categoryRepository.existsByNameIgnoreCase("Thể loại")).thenReturn(false);
        when(categoryRepository.existsBySlug("the-loai")).thenReturn(false);
        when(categoryRepository.save(any(Category.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var result = categoryService.createCategory(
                new CategoryCreateRequest(" Thể loại ", " Mô tả "));

        assertEquals("Thể loại", result.name());
        assertEquals("the-loai", result.slug());
        assertEquals("Mô tả", result.description());
    }

    @Test
    void nonAdminCannotCreateCategory() {
        setAuthentication("author", "AUTHOR");

        assertThrows(AccessDeniedException.class,
                () -> categoryService.createCategory(
                        new CategoryCreateRequest("Fantasy", null)));
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void categoryInUseCannotBeDeleted() {
        setAuthentication("admin", "ADMIN");
        Category category = category(4, "Fantasy", "fantasy");
        when(categoryRepository.findById(4)).thenReturn(Optional.of(category));
        when(comicCategoryRepository.existsById_CategoryId(4)).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> categoryService.deleteCategory(4));
        verify(categoryRepository, never()).delete(any(Category.class));
    }

    @Test
    void categoriesCanOnlyBeAssignedToOwnedDraftComics() {
        User author = new User();
        author.setId(7L);
        author.setUsername("author");
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setModerationStatus("DRAFT");
        comic.setIsDeleted(false);
        Category category = category(4, "Fantasy", "fantasy");
        setAuthentication("author", "AUTHOR");
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        when(categoryRepository.findById(4)).thenReturn(Optional.of(category));
        when(comicCategoryRepository.saveAll(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var result = categoryService.setComicCategories(12L, List.of(4));

        assertEquals(1, result.size());
        assertEquals("Fantasy", result.get(0).name());
        verify(comicCategoryRepository).deleteAllById_ComicId(12L);
    }

    @Test
    void categoryAssignmentCannotChangePublishedComicMetadataDirectly() {
        User author = new User();
        author.setId(7L);
        author.setUsername("author");
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setModerationStatus("PUBLISHED");
        comic.setIsDeleted(false);
        setAuthentication("author", "AUTHOR");
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));

        assertThrows(DuplicateResourceException.class,
                () -> categoryService.setComicCategories(12L, List.of()));
        verify(comicCategoryRepository, never()).deleteAllById_ComicId(12L);
    }

    private Category category(Integer id, String name, String slug) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        category.setSlug(slug);
        return category;
    }

    private void setAuthentication(String username, String role) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        username,
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }
}
