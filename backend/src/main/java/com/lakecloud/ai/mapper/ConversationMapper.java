package com.lakecloud.ai.mapper;

import com.lakecloud.ai.entity.Conversation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ConversationMapper {

    List<Conversation> findByUserId(@Param("userId") Long userId);

    Conversation findById(@Param("id") Long id);

    void insert(Conversation conversation);

    void update(Conversation conversation);

    void deleteById(@Param("id") Long id);

}
