package com.diet.hub.service;

import com.diet.hub.dto.HealthProfileRequestDto;
import com.diet.hub.dto.HealthProfileResponseDto;
import com.diet.hub.entity.HealthProfile;
import com.diet.hub.repository.HealthProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HealthProfileService {
    
    @Autowired
    private HealthProfileRepository healthProfileRepository;
    
    public HealthProfileResponseDto createOrUpdateProfile(HealthProfileRequestDto dto) {
        HealthProfile profile = healthProfileRepository.findByUserId(dto.getUserId())
                .orElse(new HealthProfile());
        
        profile.setUserId(dto.getUserId());
        profile.setAge(dto.getAge());
        profile.setGender(dto.getGender());
        profile.setHeight(dto.getHeight());
        profile.setWeight(dto.getWeight());
        profile.setActivityLevel(dto.getActivityLevel());
        profile.setHealthGoal(dto.getHealthGoal());
        profile.setDietaryRestrictions(dto.getDietaryRestrictions());
        profile.setAllergies(dto.getAllergies());
        
        HealthProfile saved = healthProfileRepository.save(profile);
        return convertToDto(saved);
    }
    
    public HealthProfileResponseDto getProfileByUserId(String userId) {
        return healthProfileRepository.findByUserId(userId)
                .map(this::convertToDto)
                .orElse(null);
    }
    
    public List<HealthProfileResponseDto> getAllProfiles() {
        return healthProfileRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public void deleteProfile(Long id) {
        healthProfileRepository.deleteById(id);
    }
    
    private HealthProfileResponseDto convertToDto(HealthProfile profile) {
        HealthProfileResponseDto dto = new HealthProfileResponseDto();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUserId());
        dto.setAge(profile.getAge());
        dto.setGender(profile.getGender());
        dto.setHeight(profile.getHeight());
        dto.setWeight(profile.getWeight());
        dto.setActivityLevel(profile.getActivityLevel());
        dto.setHealthGoal(profile.getHealthGoal());
        dto.setDietaryRestrictions(profile.getDietaryRestrictions());
        dto.setAllergies(profile.getAllergies());
        dto.setBmi(profile.calculateBMI());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        return dto;
    }
}
