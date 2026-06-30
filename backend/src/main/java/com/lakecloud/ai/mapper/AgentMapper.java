package com.lakecloud.ai.mapper;

import com.lakecloud.ai.entity.Agent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AgentMapper {

    List<Agent> findAll();

    Agent findById(@Param("id") Long id);

    List<Agent> findByCreatedBy(@Param("createdBy") Long createdBy);

    List<Agent> findPublicAgents();

    void insert(Agent agent);

    void update(Agent agent);

    void deleteById(@Param("id") Long id);

}
