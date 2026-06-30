package com.lakecloud.ai.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.io.Serializable;

@Data
public class ChatMessageDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "角色不能为空")
    private String role;

    @NotBlank(message = "消息内容不能为空")
    private String content;
}
