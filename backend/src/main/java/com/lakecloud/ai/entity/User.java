package com.lakecloud.ai.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private Long id;
    private String username;
    private String password;
    private String email;
    private String avatar;
    private String department;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
