package com.diet.hub.controller;

import com.diet.hub.dto.HealthProfileRequestDto;
import com.diet.hub.dto.HealthProfileResponseDto;
import com.diet.hub.service.HealthProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-profiles")
@CrossOrigin(origins = "*")
public class HealthProfileController {
    
    @Autowired
    private HealthProfileService healthProfileService;
    
    @PostMapping
    public ResponseEntity<HealthProfileResponseDto> createOrUpdateProfile(
            @Valid @RequestBody HealthProfileRequestDto dto) {
        HealthProfileResponseDto response = healthProfileService.createOrUpdateProfile(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<HealthProfileResponseDto> getProfileByUserId(@PathVariable String userId) {
        HealthProfileResponseDto profile = healthProfileService.getProfileByUserId(userId);
        if (profile != null) {
            return ResponseEntity.ok(profile);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping
    public ResponseEntity<List<HealthProfileResponseDto>> getAllProfiles() {
        List<HealthProfileResponseDto> profiles = healthProfileService.getAllProfiles();
        return ResponseEntity.ok(profiles);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(@PathVariable Long id) {
        healthProfileService.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }
}
