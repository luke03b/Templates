package com.example.javatemplate.application;

import com.example.javatemplate.api.dto.HealthResponse;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

    public HealthResponse getHealth() {
        return new HealthResponse("UP", "Java backend template is running");
    }
}
