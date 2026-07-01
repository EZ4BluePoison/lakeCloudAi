package com.lakecloud.ai.service;

import com.lakecloud.ai.dto.MessageRequest;
import com.lakecloud.ai.dto.MessageResponse;
import com.lakecloud.ai.entity.Conversation;
import com.lakecloud.ai.entity.Message;
import com.lakecloud.ai.mapper.ConversationMapper;
import com.lakecloud.ai.mapper.MessageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageMapper messageMapper;

    @Autowired
    private ConversationMapper conversationMapper;

    public List<MessageResponse> listMessages(Long conversationId) {
        Conversation conversation = conversationMapper.findById(conversationId);
        if (conversation == null) {
            throw new IllegalArgumentException("会话不存在: " + conversationId);
        }
        List<Message> messages = messageMapper.findByConversationId(conversationId);
        return messages.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MessageResponse addMessage(Long conversationId, MessageRequest request) {
        Conversation conversation = conversationMapper.findById(conversationId);
        if (conversation == null) {
            throw new IllegalArgumentException("会话不存在: " + conversationId);
        }
        Message message = new Message();
        message.setConversationId(conversationId);
        message.setRole(request.getRole());
        message.setContent(request.getContent());
        messageMapper.insert(message);
        return toResponse(message);
    }

    private MessageResponse toResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setConversationId(message.getConversationId());
        response.setRole(message.getRole());
        response.setContent(message.getContent());
        response.setCreatedAt(message.getCreatedAt());
        return response;
    }
}
