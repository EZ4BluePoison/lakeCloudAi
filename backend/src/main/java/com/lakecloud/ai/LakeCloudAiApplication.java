package com.lakecloud.ai;

import com.lakecloud.ai.config.WuxidataProperties;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@MapperScan("com.lakecloud.ai.mapper")
@EnableConfigurationProperties(WuxidataProperties.class)
public class LakeCloudAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(LakeCloudAiApplication.class, args);
    }

}
