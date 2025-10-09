package com.diet.hub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "health_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String userId;
    
    private LocalDate recordDate;
    
    private Double weight;
    
    private Double bloodPressureSystolic;
    
    private Double bloodPressureDiastolic;
    
    private Double bloodSugar;
    
    private Integer heartRate;
    
    @Column(length = 500)
    private String notes;
    
    private LocalDate createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (recordDate == null) {
            recordDate = LocalDate.now();
        }
        createdAt = LocalDate.now();
    }
}
