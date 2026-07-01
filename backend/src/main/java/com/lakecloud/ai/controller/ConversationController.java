package com.lakecloud.ai.controller;

import com.lakecloud.ai.dto.ConversationRequest;
import com.lakecloud.ai.dto.ConversationResponse;
import com.lakecloud.ai.dto.MessageRequest;
import com.lakecloud.ai.dto.MessageResponse;
import com.lakecloud.ai.service.ConversationService;
import com.lakecloud.ai.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/conversations")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private MessageService messageService;

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> listConversations(
            @RequestParam(required = false) String agentId) {
        return ResponseEntity.ok(conversationService.listConversations(agentId));
    }

    @PostMapping
    public ResponseEntity<ConversationResponse> createConversation(
            @Valid @RequestBody ConversationRequest request) {
        return ResponseEntity.ok(conversationService.createConversation(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationResponse> getConversation(@PathVariable Long id) {
        return ResponseEntity.ok(conversationService.getConversation(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConversationResponse> updateConversation(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String title = body.get("title");
        return ResponseEntity.ok(conversationService.updateConversation(id, title));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteConversation(@PathVariable Long id) {
        conversationService.deleteConversation(id);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageResponse>> listMessages(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.listMessages(id));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageResponse> addMessage(
            @PathVariable Long id,
            @Valid @RequestBody MessageRequest request) {
        return ResponseEntity.ok(messageService.addMessage(id, request));
    }
}
