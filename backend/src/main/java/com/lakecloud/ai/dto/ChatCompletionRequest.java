package com.lakecloud.ai.dto;

import lombok.Data;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Data
public class ChatCompletionRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    private String model;

    @NotEmpty(message = "消息列表不能为空")
    @Valid
    private List<ChatMessageDto> messages;

    private Boolean stream = false;

    private Double temperature;

    private Integer maxTokens;

    private Double topP;

    private Map<String, Object> extraBody;
}
