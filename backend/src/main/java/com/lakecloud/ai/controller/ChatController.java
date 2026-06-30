package com.lakecloud.ai.controller;

import com.lakecloud.ai.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    /**
     * 代理健康检查
     */
    @GetMapping("/chat/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "ok");
        result.put("provider", "wuxidata");
        result.put("model", chatService.getModel());
        return result;
    }

    /**
     * 非流式对话
     */
    @PostMapping(value = "/chat/completions", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Object chatCompletion(@RequestBody Map<String, Object> request) {
        return chatService.chatCompletion(request);
    }

    /**
     * 流式对话（SSE）
     */
    @PostMapping(value = "/chat/completions/stream", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SseEmitter streamChatCompletion(@RequestBody Map<String, Object> request) {
        request.put("stream", true);
        return chatService.streamChatCompletion(request);
    }
}
