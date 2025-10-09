package com.diet.hub.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthProfileRequestDto {
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @Min(value = 1, message = "Age must be positive")
    private Integer age;
    
    private String gender;
    
    @Min(value = 1, message = "Height must be positive")
    private Double height;
    
    @Min(value = 1, message = "Weight must be positive")
    private Double weight;
    
    private String activityLevel;
    
    private String healthGoal;
    
    private String dietaryRestrictions;
    
    private String allergies;
}
