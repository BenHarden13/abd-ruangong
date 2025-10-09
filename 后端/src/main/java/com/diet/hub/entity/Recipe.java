package com.diet.hub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "recipes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recipe {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 2000)
    private String description;
    
    @Column(length = 5000)
    private String ingredients;
    
    @Column(length = 5000)
    private String instructions;
    
    private Integer calories;
    
    private Double protein;
    
    private Double carbohydrates;
    
    private Double fat;
    
    private Integer preparationTime; // in minutes
    
    private String difficulty;
    
    private String category;
    
    @Column(length = 1000)
    private String tags;
    
    private String imageUrl;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
