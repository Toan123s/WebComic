/**
 * DỰ ÁN: ComicHub
 * FILE: BackendApplicationTests.java
 * PHỤ TRÁCH: TV1; TV3 phối hợp kiểm thử
 * MỤC ĐÍCH: Kiểm thử khởi động ứng dụng.
 * TRẠNG THÁI: CHƯA XÁC MINH.
 * CÒN THIẾU: Chạy test thực tế và ghi nhận pass/fail; không xem tên test là bằng chứng đã chạy.
 * LƯU Ý: Header mô tả trạng thái đọc từ mã nguồn; không thay thế review hoặc bằng chứng kiểm thử.
 */

package com.comichub.backend;

import com.comichub.repository.BookmarkRepository;
import com.comichub.repository.CategoryRepository;
import com.comichub.repository.ComicCategoryRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.ChapterRevisionRepository;
import com.comichub.repository.ChapterRevisionPageRepository;
import com.comichub.repository.ModerationLogRepository;
import com.comichub.repository.RoleRepository;
import com.comichub.repository.UserRepository;
import com.comichub.repository.UserRoleRepository;
import com.comichub.security.CustomUserDetailsService;
import org.springframework.transaction.annotation.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@SpringBootTest
class BackendApplicationTests {

	@Autowired
	private ComicRepository comicRepository;
	@Autowired
	private BookmarkRepository bookmarkRepository;
	@Autowired
	private RoleRepository roleRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private UserRoleRepository userRoleRepository;
	@Autowired
	private CustomUserDetailsService userDetailsService;
	@Autowired
	private CategoryRepository categoryRepository;
	@Autowired
	private ComicCategoryRepository comicCategoryRepository;
	@Autowired
	private ChapterRevisionRepository chapterRevisionRepository;
	@Autowired
	private ChapterRevisionPageRepository chapterRevisionPageRepository;
	@Autowired
	private ModerationLogRepository moderationLogRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void categoryAndSearchQueriesRunAgainstConfiguredSqlServer() {
		var result = comicRepository.searchPublished(
				"PUBLISHED",
				null,
				1,
				null,
				PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "publishedAt")));

		Assertions.assertNotNull(result);
		categoryRepository.findAllByOrderByNameAsc();
		categoryRepository.existsByNameIgnoreCase("category-query-smoke-test");
		comicCategoryRepository.findAllById_ComicId(-1L);
		comicCategoryRepository.existsById_CategoryId(-1);
		comicCategoryRepository.deleteAllById_ComicId(-1L);
		bookmarkRepository.findByUser_IdOrderByCreatedAtDesc(-1L);
		bookmarkRepository.existsByUser_IdAndComic_Id(-1L, -1L);
		userRoleRepository.findRoleNamesByUserId(-1L);
		userRoleRepository.findAssignmentsByUserId(-1L);
		userRoleRepository.countByRole_NameAndUser_Status("ADMIN", "ACTIVE");
		chapterRevisionRepository.existsByChapter_IdAndStatusIn(
				-1L, java.util.List.of("DRAFT", "PENDING"));
		chapterRevisionRepository.findByStatusOrderBySubmittedAtAsc("PENDING");
		chapterRevisionPageRepository.findByRevision_IdOrderByPageNumberAsc(-1L);
		chapterRevisionPageRepository.existsByImageUrlAndRevision_IdNot("missing", -1L);
		moderationLogRepository.searchLogs(
				null, null, null, null,
				PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")));
		roleRepository.findByName("USER");
	}

	@Test
	@Transactional
	void authoritiesAreLoadedFromTheSqlServerUserRoleRelations() {
		var user = new com.comichub.entity.User();
		String suffix = java.util.UUID.randomUUID().toString();
		user.setUsername("rbac-" + suffix.substring(0, 12));
		user.setEmail("rbac-" + suffix + "@example.test");
		user.setPasswordHash("test-hash");
		user.setStatus("ACTIVE");
		user = userRepository.saveAndFlush(user);

		var userRole = roleRepository.findByName("USER").orElseThrow();
		var authorRole = roleRepository.findByName("AUTHOR").orElseThrow();
		var userAssignment = new com.comichub.entity.UserRole();
		userAssignment.setUser(user);
		userAssignment.setRole(userRole);
		var authorAssignment = new com.comichub.entity.UserRole();
		authorAssignment.setUser(user);
		authorAssignment.setRole(authorRole);
		userRoleRepository.saveAllAndFlush(java.util.List.of(userAssignment, authorAssignment));

		var details = userDetailsService.loadUserByUsername(user.getUsername());

		Assertions.assertTrue(details.getAuthorities().stream()
				.anyMatch(authority -> authority.getAuthority().equals("ROLE_USER")));
		Assertions.assertTrue(details.getAuthorities().stream()
				.anyMatch(authority -> authority.getAuthority().equals("ROLE_AUTHOR")));
		Assertions.assertFalse(details.getAuthorities().stream()
				.anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")));
	}

}
