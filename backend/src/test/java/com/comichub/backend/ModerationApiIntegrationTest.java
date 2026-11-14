package com.comichub.backend;

import com.comichub.entity.Comic;
import com.comichub.entity.User;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@SpringBootTest
class ModerationApiIntegrationTest {

    @Autowired
    private WebApplicationContext applicationContext;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ComicRepository comicRepository;
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
    void commentApiSubmitsPendingCommentAndPublishesOnlyAfterApproval() throws Exception {
        User author = saveUser("moderation-comment-author");
        User reader = saveUser("moderation-comment-reader");
        User moderator = saveUser("moderation-comment-mod");
        Comic comic = savePublishedComic(author);
        String content = "moderation-integration-" + UUID.randomUUID();

        String createResponse = mockMvc.perform(post("/api/comics/{comicId}/comments", comic.getId())
                        .with(user(reader.getUsername()).roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("content", content))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.content").value(content))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long commentId = objectMapper.readTree(createResponse).path("id").asLong();

        mockMvc.perform(get("/api/comics/{comicId}/comments", comic.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.content == '" + content + "')]").isEmpty());

        String ownerCommentsResponse = mockMvc.perform(get("/api/comics/{comicId}/comments", comic.getId())
                        .with(user(reader.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        boolean ownerCanSeePendingComment = false;
        for (JsonNode comment : objectMapper.readTree(ownerCommentsResponse)) {
            if (content.equals(comment.path("content").asText())
                    && "PENDING".equals(comment.path("status").asText())) {
                ownerCanSeePendingComment = true;
                break;
            }
        }
        Assertions.assertTrue(ownerCanSeePendingComment, ownerCommentsResponse);

        mockMvc.perform(get("/api/moderation/comments/pending")
                        .with(user(moderator.getUsername()).roles("MODERATOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.content == '" + content + "')]")
                        .value(hasSize(1)));

        mockMvc.perform(post("/api/moderation/comments/{commentId}/approve", commentId)
                        .with(user(moderator.getUsername()).roles("MODERATOR"))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("VISIBLE"));

        mockMvc.perform(get("/api/comics/{comicId}/comments", comic.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.content == '" + content + "')]")
                        .value(hasSize(1)));
    }

    @Test
    @Transactional
    void reportApiEnforcesWorkflowAndDashboardRole() throws Exception {
        User author = saveUser("moderation-report-author");
        User reporter = saveUser("moderation-report-reader");
        User moderator = saveUser("moderation-report-mod");
        User admin = saveUser("moderation-report-admin");
        Comic comic = savePublishedComic(author);

        String createResponse = mockMvc.perform(post("/api/reports")
                        .with(user(reporter.getUsername()).roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "targetType", "COMIC",
                                "targetId", comic.getId(),
                                "reason", "SPAM",
                                "description", "integration test"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode createdReport = objectMapper.readTree(createResponse);
        long reportId = createdReport.path("id").asLong();

        mockMvc.perform(get("/api/admin/reports")
                        .with(user(reporter.getUsername()).roles("USER")))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/reports")
                        .param("status", "OPEN")
                        .param("targetType", "COMIC")
                        .param("page", "0")
                        .param("size", "10")
                        .with(user(moderator.getUsername()).roles("MODERATOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].status").value("OPEN"));

        mockMvc.perform(patch("/api/admin/reports/{reportId}", reportId)
                        .with(user(reporter.getUsername()).roles("MODERATOR"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(patch("/api/admin/reports/{reportId}", reportId)
                        .with(user(moderator.getUsername()).roles("MODERATOR"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"RESOLVED\",\"resolutionNote\":\"handled\"}"))
                .andExpect(status().isConflict());

        mockMvc.perform(patch("/api/admin/reports/{reportId}", reportId)
                        .with(user(moderator.getUsername()).roles("MODERATOR"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        mockMvc.perform(patch("/api/admin/reports/{reportId}", reportId)
                        .with(user(moderator.getUsername()).roles("MODERATOR"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"RESOLVED\"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(patch("/api/admin/reports/{reportId}", reportId)
                        .with(user(moderator.getUsername()).roles("MODERATOR"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"RESOLVED\",\"resolutionNote\":\"handled\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"))
                .andExpect(jsonPath("$.handledByUsername").value(moderator.getUsername()))
                .andExpect(jsonPath("$.resolutionNote").value("handled"));

        mockMvc.perform(patch("/api/admin/reports/{reportId}", reportId)
                        .with(user(moderator.getUsername()).roles("MODERATOR"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"REJECTED\",\"resolutionNote\":\"too late\"}"))
                .andExpect(status().isConflict());

        mockMvc.perform(get("/api/admin/dashboard")
                        .with(user(moderator.getUsername()).roles("MODERATOR")))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/dashboard")
                        .with(user(admin.getUsername()).roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openReports").exists());
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

    private Comic savePublishedComic(User author) {
        String suffix = UUID.randomUUID().toString();
        Comic comic = new Comic();
        comic.setAuthor(author);
        comic.setTitle("Moderation integration comic");
        comic.setSlug("moderation-integration-" + suffix);
        comic.setModerationStatus("PUBLISHED");
        comic.setPublicationStatus("ONGOING");
        comic.setViewCount(0L);
        comic.setRatingAvg(java.math.BigDecimal.ZERO);
        comic.setRatingCount(0);
        comic.setIsDeleted(false);
        return comicRepository.saveAndFlush(comic);
    }

}
