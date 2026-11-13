package com.comichub.controller;

import com.comichub.dto.role.RoleResponse;
import com.comichub.dto.role.UserRolesResponse;
import com.comichub.dto.role.UserRolesUpdateRequest;
import com.comichub.service.RoleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping("/roles")
    public ResponseEntity<List<RoleResponse>> getRoles() {
        return ResponseEntity.ok(roleService.getRoles());
    }

    @GetMapping("/users/{userId}/roles")
    public ResponseEntity<UserRolesResponse> getUserRoles(
            @PathVariable Long userId) {
        return ResponseEntity.ok(roleService.getUserRoles(userId));
    }

    @PutMapping("/users/{userId}/roles")
    public ResponseEntity<UserRolesResponse> replaceUserRoles(
            @PathVariable Long userId,
            @Valid @RequestBody UserRolesUpdateRequest request) {
        return ResponseEntity.ok(roleService.replaceUserRoles(userId, request));
    }
}
