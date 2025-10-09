package com.diet.hub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "health_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String userId;
    
    private Integer age;
    
    private String gender;
    
    private Double height; // in cm
    
    private Double weight; // in kg
    
    private String activityLevel;
    
    private String healthGoal;
    
    @Column(length = 1000)
    private String dietaryRestrictions;
    
    @Column(length = 1000)
    private String allergies;
    
    private LocalDate createdAt;
    
    private LocalDate updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
        updatedAt = LocalDate.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDate.now();
    }
    
    // Calculate BMI
    public Double calculateBMI() {
        if (height != null && weight != null && height > 0) {
            return weight / Math.pow(height / 100, 2);
        }
        return null;
    }
}
