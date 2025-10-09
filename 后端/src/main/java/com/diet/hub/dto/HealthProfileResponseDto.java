package com.diet.hub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthProfileResponseDto {
    
    private Long id;
    private String userId;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private String activityLevel;
    private String healthGoal;
    private String dietaryRestrictions;
    private String allergies;
    private Double bmi;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
