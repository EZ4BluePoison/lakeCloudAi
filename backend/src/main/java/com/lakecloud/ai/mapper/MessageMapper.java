package com.lakecloud.ai.mapper;

import com.lakecloud.ai.entity.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MessageMapper {

    List<Message> findByConversationId(@Param("conversationId") Long conversationId);

    void insert(Message message);

    void deleteByConversationId(@Param("conversationId") Long conversationId);

}
