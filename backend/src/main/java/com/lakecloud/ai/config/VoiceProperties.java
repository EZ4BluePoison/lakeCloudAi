package com.lakecloud.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "ai.voice")
public class VoiceProperties {

    /**
     * 语音模型服务基地址。
     */
    private String baseUrl = "http://192.168.20.235:9100";

    /**
     * 默认使用的转写模型。
     */
    private String model = "/model";

    /**
     * 请求超时时间（毫秒）。
     */
    private Integer timeout = 60000;

    /**
     * 是否信任所有 SSL 证书（仅用于内部自签名环境）。
     */
    private boolean trustAllSsl = false;
}
