package com.lakecloud.ai.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Agent {
    private Long id;
    private String name;
    private String description;
    private String avatar;
    private String prompt;
    private Long createdBy;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
