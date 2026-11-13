package com.comichub.backend;

import com.comichub.entity.Chapter;
import com.comichub.entity.Comic;
import com.comichub.entity.User;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
class SecurityAuthorizationIntegrationTest {

    @Autowired
    private WebApplicationContext applicationContext;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ComicRepository comicRepository;
    @Autowired
    private ChapterRepository chapterRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = webAppContextSetup(applicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void anonymousCanReadPublicCategories() throws Exception {
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk());
    }

    @Test
    void anonymousCannotReadUserAdministration() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidBearerTokenCannotReadUserAdministration() throws Exception {
        mockMvc.perform(get("/api/users").header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void ordinaryUserCannotReadUserAdministration() throws Exception {
        mockMvc.perform(get("/api/users").with(user("reader").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void authenticatedUserWithoutRoleCannotReadUserAdministration() throws Exception {
        mockMvc.perform(get("/api/users").with(user("unassigned")))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanReadUserAdministration() throws Exception {
        mockMvc.perform(get("/api/users").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk());
    }

    @Test
    void userCannotReadModerationQueue() throws Exception {
        mockMvc.perform(get("/api/moderation/comics/pending")
                        .with(user("reader").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void moderatorCannotAccessAdminUserList() throws Exception {
        mockMvc.perform(get("/api/users")
                        .with(user("moderator").roles("MODERATOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanReadModerationQueue() throws Exception {
        mockMvc.perform(get("/api/moderation/comics/pending")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk());
    }

    @Test
    void ordinaryUserCannotCreateComic() throws Exception {
        mockMvc.perform(post("/api/comics")
                        .with(user("reader").roles("USER"))
                        .with(csrf())
                        .contentType("application/json")
                        .content("""
                                {
                                  "title": "test",
                                  "description": "test",
                                  "coverUrl": "https://example.test/cover.png"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void authorCannotCallComicPublishEndpoint() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .patch("/api/comics/999/publish")
                        .with(user("author").roles("AUTHOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void authorCannotCallChapterPublishEndpoint() throws Exception {
        mockMvc.perform(post("/api/chapters/999/publish")
                        .with(user("author").roles("AUTHOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    @Transactional
    void authorCannotSubmitAnotherAuthorsComic() throws Exception {
        User authorA = saveUser("owner-a");
        User authorB = saveUser("owner-b");
        Comic comic = saveComic(authorB);

        mockMvc.perform(post("/api/comics/" + comic.getId() + "/submit")
                        .with(user(authorA.getUsername()).roles("AUTHOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    @Transactional
    void authorCanSubmitOwnComic() throws Exception {
        User author = saveUser("owner");
        Comic comic = saveComic(author);

        mockMvc.perform(post("/api/comics/" + comic.getId() + "/submit")
                        .with(user(author.getUsername()).roles("AUTHOR")))
                .andExpect(status().isOk());
    }

    @Test
    @Transactional
    void authorCannotEditAnotherAuthorsChapter() throws Exception {
        User authorA = saveUser("chapter-owner-a");
        User authorB = saveUser("chapter-owner-b");
        Comic comic = saveComic(authorB);
        Chapter chapter = new Chapter();
        chapter.setComic(comic);
        chapter.setChapterNumber(new BigDecimal("1.0"));
        chapter.setTitle("Original");
        chapter.setStatus("DRAFT");
        chapter.setPageCount(0);
        chapter.setViewCount(0L);
        chapter.setIsDeleted(false);
        chapter = chapterRepository.saveAndFlush(chapter);

        mockMvc.perform(patch("/api/chapters/" + chapter.getId())
                        .with(user(authorA.getUsername()).roles("AUTHOR"))
                        .contentType("application/json")
                        .content("{\"title\":\"Unauthorized edit\"}"))
                .andExpect(status().isForbidden());
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

    private Comic saveComic(User author) {
        String suffix = UUID.randomUUID().toString();
        Comic comic = new Comic();
        comic.setAuthor(author);
        comic.setTitle("RBAC test comic");
        comic.setSlug("rbac-test-" + suffix);
        comic.setModerationStatus("DRAFT");
        comic.setPublicationStatus("ONGOING");
        comic.setViewCount(0L);
        comic.setIsDeleted(false);
        return comicRepository.saveAndFlush(comic);
    }
}
