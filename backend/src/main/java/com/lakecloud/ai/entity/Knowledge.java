package com.lakecloud.ai.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Knowledge {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String fileUrl;
    private String fileType;
    private LocalDateTime createdAt;
}
