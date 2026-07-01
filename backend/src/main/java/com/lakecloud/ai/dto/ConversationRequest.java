package com.lakecloud.ai.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class ConversationRequest {

    @NotBlank(message = "智能体 ID 不能为空")
    private String agentId;

    @NotBlank(message = "会话标题不能为空")
    private String title;
}
