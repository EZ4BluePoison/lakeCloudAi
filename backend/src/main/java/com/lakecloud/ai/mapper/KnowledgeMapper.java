package com.lakecloud.ai.mapper;

import com.lakecloud.ai.entity.Knowledge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface KnowledgeMapper {

    List<Knowledge> findByUserId(@Param("userId") Long userId);

    Knowledge findById(@Param("id") Long id);

    void insert(Knowledge knowledge);

    void deleteById(@Param("id") Long id);

}
