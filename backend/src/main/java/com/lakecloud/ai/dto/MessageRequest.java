package com.lakecloud.ai.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class MessageRequest {

    @NotBlank(message = "角色不能为空")
    private String role;

    @NotBlank(message = "消息内容不能为空")
    private String content;
}
