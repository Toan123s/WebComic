package com.comichub.backend;

import com.comichub.service.FileStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.unit.DataSize;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FileStorageServiceTest {

    @TempDir
    Path uploadDirectory;

    @Test
    void storesImageWithGeneratedNameAndReturnsImageMetadata() throws Exception {
        FileStorageService service = new FileStorageService(
                uploadDirectory.toString(), DataSize.ofMegabytes(10));
        MockMultipartFile file = new MockMultipartFile(
                "files", "user-supplied-name.png", "image/png", createPng());

        FileStorageService.StoredImage stored = service.storeChapterPage(file, 3L, 7L);

        assertTrue(stored.relativePath().startsWith(
                "chapters" + java.io.File.separator + "3"
                        + java.io.File.separator + "7"));
        assertTrue(stored.relativePath().endsWith(".png"));
        assertEquals("image/png", stored.contentType());
        assertEquals(1, stored.width());
        assertEquals(1, stored.height());
        assertTrue(Files.isRegularFile(service.resolveStoredFile(stored.relativePath())));
        assertFalse(stored.relativePath().contains("user-supplied-name"));
    }

    @Test
    void rejectsNonImageContentEvenWhenFileNameLooksLikeImage() {
        FileStorageService service = new FileStorageService(
                uploadDirectory.toString(), DataSize.ofMegabytes(10));
        MockMultipartFile file = new MockMultipartFile(
                "files", "fake.png", "image/png", "not an image".getBytes());

        assertThrows(IllegalArgumentException.class,
                () -> service.storeChapterPage(file, 3L, 7L));
    }

    private byte[] createPng() throws Exception {
        BufferedImage image = new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }
}
