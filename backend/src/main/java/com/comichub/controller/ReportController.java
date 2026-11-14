package com.comichub.controller;

import com.comichub.dto.report.ReportCreateRequest;
import com.comichub.dto.report.ReportPageResponse;
import com.comichub.dto.report.ReportResponse;
import com.comichub.dto.report.ReportUpdateRequest;
import com.comichub.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/reports")
    @PreAuthorize("hasAnyRole('USER', 'AUTHOR')")
    public ResponseEntity<ReportResponse> createReport(
            @Valid @RequestBody ReportCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reportService.createReport(request));
    }

    @GetMapping("/admin/reports")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ReportPageResponse> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String targetType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(reportService.getReports(status, targetType, page, size));
    }

    @PatchMapping("/admin/reports/{reportId}")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ReportResponse> updateReport(
            @PathVariable Long reportId,
            @Valid @RequestBody ReportUpdateRequest request) {
        return ResponseEntity.ok(reportService.updateReport(reportId, request));
    }
}

