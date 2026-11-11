package com.comichub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
public class Role {

    @Id
    private Integer id;

    @Column(nullable = false, unique = true, length = 30, columnDefinition = "VARCHAR(30)")
    private String name;

    @Column(length = 200, columnDefinition = "NVARCHAR(200)")
    private String description;
}