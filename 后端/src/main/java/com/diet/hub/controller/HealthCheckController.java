package com.diet.hub.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 * 提供简单的API来测试后端服务是否正常运行
 */
@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class HealthCheckController {

    /**
     * 健康检查端点
     * @return 包含状态和版本信息的响应
     */
    @GetMapping("/health-check")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "DietHub API is running");
        response.put("version", "1.0.0");
        response.put("timestamp", System.currentTimeMillis());
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * 测试连接端点
     * @return 简单的连接成功信息
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return new ResponseEntity<>("pong", HttpStatus.OK);
    }
}