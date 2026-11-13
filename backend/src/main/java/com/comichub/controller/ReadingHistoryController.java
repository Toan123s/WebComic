package com.comichub.controller;

import com.comichub.dto.history.ReadingHistoryProgressRequest;
import com.comichub.dto.history.ReadingHistoryResponse;
import com.comichub.service.ReadingHistoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reading-history")
@PreAuthorize("hasAnyRole('USER', 'AUTHOR')")
public class ReadingHistoryController {

    private final ReadingHistoryService readingHistoryService;

    public ReadingHistoryController(ReadingHistoryService readingHistoryService) {
        this.readingHistoryService = readingHistoryService;
    }

    @GetMapping
    public ResponseEntity<List<ReadingHistoryResponse>> getHistory() {
        return ResponseEntity.ok(readingHistoryService.getHistory());
    }

    @PutMapping("/progress")
    public ResponseEntity<ReadingHistoryResponse> saveProgress(
            @Valid @RequestBody ReadingHistoryProgressRequest request) {
        return ResponseEntity.ok(readingHistoryService.saveProgress(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long id) {
        readingHistoryService.deleteHistory(id);
        return ResponseEntity.noContent().build();
    }
}
