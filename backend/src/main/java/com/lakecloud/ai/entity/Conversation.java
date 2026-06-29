package com.lakecloud.ai.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Conversation {
    private Long id;
    private Long userId;
    private Long agentId;
    private String title;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
