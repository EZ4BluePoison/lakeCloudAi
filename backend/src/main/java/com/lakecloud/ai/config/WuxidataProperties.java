package com.lakecloud.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "ai.wuxidata")
public class WuxidataProperties {

    private String appId;

    private String appKey;

    private String baseUrl;

    private String model;

    private Integer timeout = 60000;

    private boolean trustAllSsl = false;
}
