package com.comichub.service;

import com.comichub.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Iterator;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final String PNG = "image/png";
    private static final String JPEG = "image/jpeg";
    private static final String WEBP = "image/webp";

    private final Path uploadRoot;
    private final long maxFileSize;

    public FileStorageService(
            @Value("${app.upload.dir:../uploads}") String uploadDirectory,
            @Value("${spring.servlet.multipart.max-file-size:10MB}") DataSize maxFileSize) {
        this.uploadRoot = Path.of(uploadDirectory).toAbsolutePath().normalize();
        this.maxFileSize = maxFileSize.toBytes();
    }

    public StoredImage storeChapterPage(MultipartFile file, Long comicId, Long chapterId) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Ảnh trang truyện không được để trống");
        }
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("Ảnh vượt quá giới hạn "
                    + DataSize.ofBytes(maxFileSize).toMegabytes() + " MB");
        }

        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException exception) {
            throw new IllegalStateException("Không thể đọc ảnh tải lên", exception);
        }

        ImageInfo imageInfo = inspect(content);
        String fileName = UUID.randomUUID() + imageInfo.extension();
        Path directory = uploadRoot.resolve("chapters")
                .resolve(comicId.toString())
                .resolve(chapterId.toString())
                .normalize();
        Path target = directory.resolve(fileName).normalize();
        if (!target.startsWith(uploadRoot)) {
            throw new IllegalStateException("Đường dẫn lưu ảnh không hợp lệ");
        }

        try {
            Files.createDirectories(directory);
            Files.write(target, content, StandardOpenOption.CREATE_NEW);
        } catch (IOException exception) {
            try {
                Files.deleteIfExists(target);
            } catch (IOException cleanupException) {
                exception.addSuppressed(cleanupException);
            }
            throw new IllegalStateException("Không thể lưu ảnh tải lên", exception);
        }

        String relativePath = uploadRoot.relativize(target).toString();
        return new StoredImage(
                relativePath,
                imageInfo.contentType(),
                imageInfo.width(),
                imageInfo.height(),
                content.length);
    }

    public Path resolveStoredFile(String relativePath) {
        Path file = uploadRoot.resolve(relativePath).normalize();
        if (!file.startsWith(uploadRoot)) {
            throw new IllegalArgumentException("Đường dẫn ảnh không hợp lệ");
        }
        if (!Files.isRegularFile(file)) {
            throw new ResourceNotFoundException("Không tìm thấy tệp ảnh");
        }
        return file;
    }

    public String contentType(String relativePath) {
        if (relativePath.endsWith(".png")) {
            return PNG;
        }
        if (relativePath.endsWith(".jpg")) {
            return JPEG;
        }
        if (relativePath.endsWith(".webp")) {
            return WEBP;
        }
        throw new IllegalArgumentException("Định dạng ảnh không được hỗ trợ");
    }

    public void delete(String relativePath) {
        Path file = uploadRoot.resolve(relativePath).normalize();
        if (!file.startsWith(uploadRoot)) {
            throw new IllegalArgumentException("Đường dẫn xóa ảnh không hợp lệ");
        }
        try {
            Files.deleteIfExists(file);
        } catch (IOException exception) {
            throw new IllegalStateException("Không thể xóa ảnh khỏi ổ đĩa", exception);
        }
    }

    private ImageInfo inspect(byte[] content) {
        if (isPng(content)) {
            return inspectRaster(content, PNG, ".png");
        }
        if (isJpeg(content)) {
            return inspectRaster(content, JPEG, ".jpg");
        }
        if (isWebp(content)) {
            return new ImageInfo(WEBP, ".webp", null, null);
        }
        throw new IllegalArgumentException("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP");
    }

    private ImageInfo inspectRaster(
            byte[] content, String contentType, String extension) {
        try (ImageInputStream input = ImageIO.createImageInputStream(
                new ByteArrayInputStream(content))) {
            if (input == null) {
                throw new IllegalArgumentException("Tệp tải lên không phải ảnh hợp lệ");
            }
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                throw new IllegalArgumentException("Tệp tải lên không phải ảnh hợp lệ");
            }

            ImageReader reader = readers.next();
            try {
                reader.setInput(input, true, true);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (width <= 0 || height <= 0 || (long) width * height > 100_000_000L) {
                    throw new IllegalArgumentException("Kích thước ảnh không hợp lệ");
                }
                return new ImageInfo(contentType, extension, width, height);
            } finally {
                reader.dispose();
            }
        } catch (IOException exception) {
            throw new IllegalArgumentException("Tệp tải lên không phải ảnh hợp lệ", exception);
        }
    }

    private boolean isPng(byte[] bytes) {
        return bytes.length >= 8
                && (bytes[0] & 0xFF) == 0x89
                && bytes[1] == 'P'
                && bytes[2] == 'N'
                && bytes[3] == 'G'
                && bytes[4] == 0x0D
                && bytes[5] == 0x0A
                && bytes[6] == 0x1A
                && bytes[7] == 0x0A;
    }

    private boolean isJpeg(byte[] bytes) {
        return bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF;
    }

    private boolean isWebp(byte[] bytes) {
        if (bytes.length < 25
                || bytes[0] != 'R' || bytes[1] != 'I'
                || bytes[2] != 'F' || bytes[3] != 'F'
                || bytes[8] != 'W' || bytes[9] != 'E'
                || bytes[10] != 'B' || bytes[11] != 'P') {
            return false;
        }
        long riffSize = (bytes[4] & 0xFFL)
                | ((bytes[5] & 0xFFL) << 8)
                | ((bytes[6] & 0xFFL) << 16)
                | ((bytes[7] & 0xFFL) << 24);
        long chunkSize = (bytes[16] & 0xFFL)
                | ((bytes[17] & 0xFFL) << 8)
                | ((bytes[18] & 0xFFL) << 16)
                | ((bytes[19] & 0xFFL) << 24);
        boolean imageChunk = bytes[12] == 'V'
                && bytes[13] == 'P'
                && bytes[14] == '8'
                && (bytes[15] == ' ' || bytes[15] == 'L' || bytes[15] == 'X');
        return riffSize == bytes.length - 8L
                && imageChunk
                && chunkSize <= bytes.length - 20L
                && chunkSize >= (bytes[15] == 'X' ? 10 : bytes[15] == 'L' ? 5 : 10);
    }

    public record StoredImage(
            String relativePath,
            String contentType,
            Integer width,
            Integer height,
            long fileSize) {
    }

    private record ImageInfo(
            String contentType,
            String extension,
            Integer width,
            Integer height) {
    }
}

