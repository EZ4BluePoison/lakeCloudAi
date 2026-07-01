package com.lakecloud.ai.service;

import com.lakecloud.ai.dto.ConversationRequest;
import com.lakecloud.ai.dto.ConversationResponse;
import com.lakecloud.ai.entity.Conversation;
import com.lakecloud.ai.mapper.ConversationMapper;
import com.lakecloud.ai.mapper.MessageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConversationService {

    // 临时固定用户 ID，后续接入认证后从 SecurityContext 获取
    private static final Long CURRENT_USER_ID = 1L;

    @Autowired
    private ConversationMapper conversationMapper;

    @Autowired
    private MessageMapper messageMapper;

    public List<ConversationResponse> listConversations(String agentId) {
        List<Conversation> conversations;
        if (agentId != null && !agentId.isEmpty()) {
            conversations = conversationMapper.findByUserIdAndAgentId(CURRENT_USER_ID, agentId);
        } else {
            conversations = conversationMapper.findByUserId(CURRENT_USER_ID);
        }
        return conversations.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ConversationResponse getConversation(Long id) {
        Conversation conversation = conversationMapper.findById(id);
        if (conversation == null) {
            throw new IllegalArgumentException("会话不存在: " + id);
        }
        return toResponse(conversation);
    }

    @Transactional
    public ConversationResponse createConversation(ConversationRequest request) {
        Conversation conversation = new Conversation();
        conversation.setUserId(CURRENT_USER_ID);
        conversation.setAgentId(request.getAgentId());
        conversation.setTitle(request.getTitle());
        conversationMapper.insert(conversation);
        return toResponse(conversation);
    }

    @Transactional
    public ConversationResponse updateConversation(Long id, String title) {
        Conversation conversation = conversationMapper.findById(id);
        if (conversation == null) {
            throw new IllegalArgumentException("会话不存在: " + id);
        }
        conversation.setTitle(title);
        conversationMapper.update(conversation);
        return toResponse(conversation);
    }

    @Transactional
    public void deleteConversation(Long id) {
        messageMapper.deleteByConversationId(id);
        conversationMapper.deleteById(id);
    }

    private ConversationResponse toResponse(Conversation conversation) {
        ConversationResponse response = new ConversationResponse();
        response.setId(conversation.getId());
        response.setUserId(conversation.getUserId());
        response.setAgentId(conversation.getAgentId());
        response.setTitle(conversation.getTitle());
        response.setCreatedAt(conversation.getCreatedAt());
        response.setUpdatedAt(conversation.getUpdatedAt());
        return response;
    }
}
