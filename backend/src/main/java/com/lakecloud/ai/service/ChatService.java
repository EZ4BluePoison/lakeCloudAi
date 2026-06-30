package com.lakecloud.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lakecloud.ai.config.WuxidataProperties;
import com.lakecloud.ai.util.SslUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.annotation.PostConstruct;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@Service
public class ChatService {

    @Autowired
    private WuxidataProperties wuxidataProperties;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private RestTemplate restTemplate;
    private final ExecutorService sseExecutor = Executors.newCachedThreadPool();

    @PostConstruct
    public void init() {
        CloseableHttpClient httpClient = SslUtils.createHttpClient(wuxidataProperties.isTrustAllSsl());

        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(wuxidataProperties.getTimeout())
                .setSocketTimeout(wuxidataProperties.getTimeout())
                .build();

        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(wuxidataProperties.getTimeout());
        factory.setConnectTimeout(wuxidataProperties.getTimeout());

        this.restTemplate = new RestTemplate(factory);
    }

    public String getModel() {
        return wuxidataProperties.getModel();
    }

    /**
     * 生成 wuxidata 接口所需的 API Key
     * 规则：appId + "&" + MD5(appId + appKey)
     */
    public String generateApiKey() {
        String appId = wuxidataProperties.getAppId();
        String appKey = wuxidataProperties.getAppKey();
        String sign = md5(appId + appKey);
        return appId + "&" + sign;
    }

    private String md5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return String.format("%032x", new BigInteger(1, digest));
        } catch (Exception e) {
            throw new IllegalStateException("MD5 签名失败", e);
        }
    }

    /**
     * 非流式对话：直接转发并返回完整响应
     */
    public Object chatCompletion(Map<String, Object> request) {
        String url = buildChatUrl();
        HttpEntity<Map<String, Object>> entity = buildRequestEntity(request);

        log.debug("转发对话请求到: {}", url);
        return restTemplate.postForObject(url, entity, Object.class);
    }

    /**
     * 流式对话：通过 SSE 逐段返回上游响应
     */
    public SseEmitter streamChatCompletion(Map<String, Object> request) {
        SseEmitter emitter = new SseEmitter(0L);

        sseExecutor.execute(() -> {
            try {
                String url = buildChatUrl();
                Map<String, Object> body = buildRequestBody(request);

                log.debug("转发流式对话请求到: {}", url);

                HttpPost httpPost = new HttpPost(url);
                httpPost.setHeader("Authorization", "Bearer " + generateApiKey());
                httpPost.setHeader("Content-Type", "application/json");
                httpPost.setHeader("Accept", "text/event-stream");
                httpPost.setEntity(new StringEntity(
                        objectMapper.writeValueAsString(body),
                        ContentType.APPLICATION_JSON
                ));

                CloseableHttpClient httpClient = SslUtils.createHttpClient(wuxidataProperties.isTrustAllSsl());
                org.apache.http.client.methods.CloseableHttpResponse response = httpClient.execute(httpPost);

                try (java.io.BufferedReader reader = new java.io.BufferedReader(
                        new java.io.InputStreamReader(response.getEntity().getContent(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith("data:")) {
                            String data = line.substring(5).trim();
                            if ("[DONE]".equals(data)) {
                                emitter.send(SseEmitter.event().name("message").data("[DONE]"));
                                emitter.complete();
                                return;
                            }
                            emitter.send(SseEmitter.event().name("message").data(data));
                        }
                    }
                    emitter.complete();
                }
            } catch (Exception e) {
                log.error("流式对话失败", e);
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    private String buildChatUrl() {
        String baseUrl = wuxidataProperties.getBaseUrl();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl + "/v1/chat/completions";
    }

    private HttpEntity<Map<String, Object>> buildRequestEntity(Map<String, Object> request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(generateApiKey());

        return new HttpEntity<>(buildRequestBody(request), headers);
    }

    private Map<String, Object> buildRequestBody(Map<String, Object> request) {
        Map<String, Object> body = new HashMap<>(request);

        // 如果没有指定 model，使用默认模型
        if (body.get("model") == null || body.get("model").toString().isEmpty()) {
            body.put("model", wuxidataProperties.getModel());
        }

        // 确保 messages 存在
        if (body.get("messages") == null) {
            throw new IllegalArgumentException("messages 不能为空");
        }

        return body;
    }
}
