package com.comichub.backend;

import com.comichub.entity.Chapter;
import com.comichub.entity.ChapterPage;
import com.comichub.entity.Comic;
import com.comichub.entity.Follow;
import com.comichub.entity.Role;
import com.comichub.entity.User;
import com.comichub.entity.UserRole;
import com.comichub.repository.ChapterPageRepository;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.FollowRepository;
import com.comichub.repository.NotificationRepository;
import com.comichub.repository.RatingRepository;
import com.comichub.repository.RoleRepository;
import com.comichub.repository.UserRepository;
import com.comichub.repository.UserRoleRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@SpringBootTest
class FollowRatingNotificationIntegrationTest {

    @Autowired
    private WebApplicationContext applicationContext;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserRoleRepository userRoleRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private ComicRepository comicRepository;
    @Autowired
    private FollowRepository followRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private RatingRepository ratingRepository;
    @Autowired
    private ChapterRepository chapterRepository;
    @Autowired
    private ChapterPageRepository chapterPageRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = webAppContextSetup(applicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    @Transactional
    void followsCreatorsAndComicsWithPaginationAndNotificationPreference() throws Exception {
        User reader = saveUser("follow-reader");
        User creator = saveUser("follow-creator");
        assignAuthorRole(creator);
        Comic comic = savePublishedComic(creator);

        long comicFollowId = createFollow(reader, "COMIC", comic.getId());
        long creatorFollowId = createFollow(reader, "CREATOR", creator.getId());

        mockMvc.perform(get("/api/follows")
                        .param("page", "0")
                        .param("size", "1")
                        .with(user(reader.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(2));

        mockMvc.perform(get("/api/follows")
                        .param("targetType", "CREATOR")
                        .with(user(reader.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].targetType").value("CREATOR"));

        mockMvc.perform(post("/api/follows")
                        .with(user(reader.getUsername()).roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "targetType", "COMIC",
                                "targetId", comic.getId()))))
                .andExpect(status().isConflict());

        mockMvc.perform(patch("/api/follows/{followId}", comicFollowId)
                        .with(user(reader.getUsername()).roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"notifyEnabled\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notifyEnabled").value(false));

        mockMvc.perform(delete("/api/follows/{followId}", creatorFollowId)
                        .with(user(reader.getUsername()).roles("USER"))
                        .with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/follows")
                        .param("targetType", "CREATOR")
                        .with(user(reader.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @Transactional
    void publishingChapterNotifiesOnceWhenReaderFollowsBothTargets() throws Exception {
        User creator = saveUser("notification-creator");
        User reader = saveUser("notification-reader");
        User admin = saveUser("notification-admin");
        Comic comic = savePublishedComic(creator);
        long comicFollowId = saveFollow(reader, "COMIC", comic, null);
        long creatorFollowId = saveFollow(reader, "CREATOR", null, creator);

        Chapter chapter = saveApprovedChapter(comic, "1.0");
        long chapterId = chapter.getId();

        publishChapter(admin, chapterId);

        String pageResponse = mockMvc.perform(get("/api/notifications")
                        .with(user(reader.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].type").value("NEW_CHAPTER"))
                .andExpect(jsonPath("$.content[0].chapterId").value(chapterId))
                .andExpect(jsonPath("$.unreadCount").value(1))
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertEquals(1L, notificationRepository.countByUser_IdAndReadAtIsNull(reader.getId()));
        long notificationId = objectMapper.readTree(pageResponse)
                .path("content").get(0).path("id").asLong();
        mockMvc.perform(get("/api/notifications/unread-count")
                        .with(user(reader.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(1));
        mockMvc.perform(patch("/api/notifications/{notificationId}/read", notificationId)
                        .with(user(reader.getUsername()).roles("USER"))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.readAt").isNotEmpty());
        assertEquals(0L, notificationRepository.countByUser_IdAndReadAtIsNull(reader.getId()));

        Chapter secondChapter = saveApprovedChapter(comic, "2.0");
        publishChapter(admin, secondChapter.getId());
        assertEquals(1L, notificationRepository.countByUser_IdAndReadAtIsNull(reader.getId()));
        mockMvc.perform(patch("/api/notifications/read-all")
                        .with(user(reader.getUsername()).roles("USER"))
                        .with(csrf()))
                .andExpect(status().isNoContent());
        assertEquals(0L, notificationRepository.countByUser_IdAndReadAtIsNull(reader.getId()));

        mockMvc.perform(patch("/api/follows/{followId}", comicFollowId)
                        .with(user(reader.getUsername()).roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"notifyEnabled\":false}"))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/follows/{followId}", creatorFollowId)
                        .with(user(reader.getUsername()).roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"notifyEnabled\":false}"))
                .andExpect(status().isOk());
        Chapter thirdChapter = saveApprovedChapter(comic, "3.0");
        publishChapter(admin, thirdChapter.getId());
        mockMvc.perform(get("/api/notifications")
                        .with(user(reader.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @Transactional
    void ratingCanBeUpdatedAndReviewIsLimitedTo300Characters() throws Exception {
        User creator = saveUser("rating-creator");
        User reader = saveUser("rating-reader");
        Comic comic = savePublishedComic(creator);

        mockMvc.perform(get("/api/comics/{comicId}/rating", comic.getId())
                        .with(user(reader.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ratingCount").value(0));

        mockMvc.perform(put("/api/comics/{comicId}/rating", comic.getId())
                        .with(user(reader.getUsername()).roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("score", 4, "review", "x".repeat(300)))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.review").value("x".repeat(300)));

        mockMvc.perform(put("/api/comics/{comicId}/rating", comic.getId())
                        .with(user(reader.getUsername()).roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("score", 4, "review", "x".repeat(301)))))
                .andExpect(status().isBadRequest());

        mockMvc.perform(put("/api/comics/{comicId}/rating", comic.getId())
                        .with(user(reader.getUsername()).roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("score", 4, "review", "  hay lắm  "))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(4))
                .andExpect(jsonPath("$.review").value("hay lắm"))
                .andExpect(jsonPath("$.ratingAvg").value(4.0))
                .andExpect(jsonPath("$.ratingCount").value(1));

        mockMvc.perform(put("/api/comics/{comicId}/rating", comic.getId())
                        .with(user(reader.getUsername()).roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("score", 5))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(5))
                .andExpect(jsonPath("$.ratingAvg").value(5.0))
                .andExpect(jsonPath("$.ratingCount").value(1));

        mockMvc.perform(get("/api/comics/{comicId}/rating", comic.getId())
                        .with(user(reader.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(5));

        assertTrue(ratingRepository.findByUser_IdAndComic_Id(
                reader.getId(), comic.getId()).isPresent());
    }

    private User saveUser(String prefix) {
        String suffix = UUID.randomUUID().toString();
        User user = new User();
        user.setUsername(prefix + "-" + suffix.substring(0, 10));
        user.setEmail(prefix + "-" + suffix + "@example.test");
        user.setPasswordHash("test-hash");
        user.setStatus("ACTIVE");
        return userRepository.saveAndFlush(user);
    }

    private void assignAuthorRole(User user) {
        Role role = roleRepository.findByName("AUTHOR").orElseThrow();
        UserRole assignment = new UserRole();
        assignment.setUser(user);
        assignment.setRole(role);
        userRoleRepository.saveAndFlush(assignment);
    }

    private Comic savePublishedComic(User author) {
        String suffix = UUID.randomUUID().toString();
        Comic comic = new Comic();
        comic.setAuthor(author);
        comic.setTitle("Integration comic");
        comic.setSlug("integration-" + suffix);
        comic.setModerationStatus("PUBLISHED");
        comic.setPublicationStatus("ONGOING");
        comic.setViewCount(0L);
        comic.setRatingAvg(BigDecimal.ZERO);
        comic.setRatingCount(0);
        comic.setIsDeleted(false);
        return comicRepository.saveAndFlush(comic);
    }

    private long createFollow(User reader, String targetType, Long targetId)
            throws Exception {
        String response = mockMvc.perform(post("/api/follows")
                        .with(user(reader.getUsername()).roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "targetType", targetType,
                                "targetId", targetId))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).path("id").asLong();
    }

    private long saveFollow(User reader, String targetType, Comic comic, User creator) {
        Follow follow = new Follow();
        follow.setUser(reader);
        follow.setTargetType(targetType);
        follow.setComic(comic);
        follow.setCreator(creator);
        follow.setNotifyEnabled(true);
        follow.setCreatedAt(java.time.LocalDateTime.now());
        return followRepository.saveAndFlush(follow).getId();
    }

    private Chapter saveApprovedChapter(Comic comic, String chapterNumber) {
        Chapter chapter = new Chapter();
        chapter.setComic(comic);
        chapter.setChapterNumber(new BigDecimal(chapterNumber));
        chapter.setTitle("Notification chapter " + chapterNumber);
        chapter.setStatus("APPROVED");
        chapter.setPageCount(1);
        chapter.setViewCount(0L);
        chapter.setIsDeleted(false);
        chapter = chapterRepository.saveAndFlush(chapter);

        ChapterPage page = new ChapterPage();
        page.setChapter(chapter);
        page.setPageNumber(1);
        page.setImageUrl("integration/notification-page-" + chapterNumber + ".png");
        page.setWidth(100);
        page.setHeight(100);
        page.setFileSize(100L);
        chapterPageRepository.saveAndFlush(page);
        return chapter;
    }

    private void publishChapter(User admin, Long chapterId) throws Exception {
        mockMvc.perform(post("/api/chapters/{id}/publish", chapterId)
                        .with(user(admin.getUsername()).roles("ADMIN"))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));
    }

    private String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }
}
