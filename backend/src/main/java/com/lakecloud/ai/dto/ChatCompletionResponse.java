package com.lakecloud.ai.dto;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class ChatCompletionResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private String id;

    private String object;

    private Long created;

    private String model;

    private List<ChoiceDto> choices;

    private UsageDto usage;

    @Data
    public static class ChoiceDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private Integer index;
        private ChatMessageDto message;
        private String finishReason;
        private DeltaDto delta;
    }

    @Data
    public static class DeltaDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private String role;
        private String content;
    }

    @Data
    public static class UsageDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private Integer promptTokens;
        private Integer completionTokens;
        private Integer totalTokens;
    }
}
