package com.lakecloud.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lakecloud.ai.config.VoiceProperties;
import com.lakecloud.ai.util.SslUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpEntity;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class AudioService {

    @Autowired
    private VoiceProperties voiceProperties;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private CloseableHttpClient httpClient;

    @PostConstruct
    public void init() {
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(voiceProperties.getTimeout())
                .setSocketTimeout(voiceProperties.getTimeout())
                .build();

        this.httpClient = HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .setSSLSocketFactory(SslUtils.createSslSocketFactory(voiceProperties.isTrustAllSsl()))
                .build();
    }

    /**
     * 保存用户上传的音频文件到本地，并通过 /v1/chat/completions 的多模态 audio_url 调用语音模型。
     *
     * @param audioFile 录音文件
     * @param language  语言代码，如 zh/en
     * @param prompt    可选提示词
     * @return 模型返回的文本（转写结果）
     */
    public String transcribe(MultipartFile audioFile, String language, String prompt) throws IOException {
        // 1. 保存到本地 runtime/audio-uploads/（已加入 .gitignore，不会进入版本控制）
        Path savedFile = saveAudioFile(audioFile);
        log.debug("音频文件已保存到: {}", savedFile);

        // 2. 构造 Base64 data URL
        String dataUrl = buildDataUrl(savedFile);

        // 3. 调用上游 /v1/chat/completions
        String response = callChatCompletion(dataUrl, normalizeLanguage(language), prompt);

        // 4. 提取文本
        return extractText(response);
    }

    private Path saveAudioFile(MultipartFile audioFile) throws IOException {
        String projectRoot = System.getProperty("user.dir");
        Path uploadDir = Paths.get(projectRoot, "runtime", "audio-uploads");
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss-SSS"));
        String originalFilename = audioFile.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String filename = timestamp + "_" + (originalFilename != null ? originalFilename : "recording" + extension);

        // 防止文件名过长或包含非法字符
        filename = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (filename.length() > 200) {
            filename = filename.substring(0, 200);
        }

        Path targetPath = uploadDir.resolve(filename);
        Files.copy(audioFile.getInputStream(), targetPath);
        return targetPath;
    }

    private String buildDataUrl(Path file) throws IOException {
        String mimeType = Files.probeContentType(file);
        if (mimeType == null || mimeType.isEmpty()) {
            mimeType = "audio/webm";
        }
        byte[] bytes = Files.readAllBytes(file);
        String base64 = Base64.getEncoder().encodeToString(bytes);
        return "data:" + mimeType + ";base64," + base64;
    }

    private String callChatCompletion(String dataUrl, String language, String prompt) throws IOException {
        String baseUrl = voiceProperties.getBaseUrl();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        String url = baseUrl + "/v1/chat/completions";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", resolveModel());
        requestBody.put("stream", false);

        // 构造多模态消息内容
        java.util.List<Map<String, Object>> content = new java.util.ArrayList<>();

        // 可选文本提示
        String textPrompt = (prompt != null && !prompt.isEmpty())
                ? prompt
                : "请识别这段音频的内容并输出文字。";
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("type", "text");
        textPart.put("text", textPrompt);
        content.add(textPart);

        Map<String, Object> audioUrl = new HashMap<>();
        audioUrl.put("url", dataUrl);
        Map<String, Object> audioPart = new HashMap<>();
        audioPart.put("type", "audio_url");
        audioPart.put("audio_url", audioUrl);
        content.add(audioPart);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", content);

        requestBody.put("messages", java.util.Collections.singletonList(message));

        // 部分模型支持 language 提示，放在 extra_body 或顶层
        if (language != null && !language.isEmpty()) {
            Map<String, Object> extraBody = new HashMap<>();
            extraBody.put("language", language);
            requestBody.put("extra_body", extraBody);
        }

        String jsonBody = objectMapper.writeValueAsString(requestBody);
        log.debug("调用语音模型: {}, 请求体大小: {} bytes", url, jsonBody.getBytes(StandardCharsets.UTF_8).length);

        HttpPost httpPost = new HttpPost(url);
        httpPost.setHeader("Content-Type", "application/json");
        httpPost.setEntity(new StringEntity(jsonBody, ContentType.APPLICATION_JSON));

        try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
            String responseBody = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode < 200 || statusCode >= 300) {
                log.error("语音模型调用失败，状态码: {}，响应: {}", statusCode, responseBody);
                throw new RuntimeException("语音模型返回错误: " + statusCode + "|" + responseBody);
            }
            return responseBody;
        }
    }

    private String extractText(String response) throws IOException {
        JsonNode root = objectMapper.readTree(response);
        if (root.has("choices") && root.get("choices").isArray() && root.get("choices").size() > 0) {
            JsonNode message = root.get("choices").get(0).get("message");
            if (message != null && message.has("content")) {
                return message.get("content").asText();
            }
        }
        log.warn("无法从响应中提取文本: {}", response);
        return "";
    }

    private String resolveModel() {
        String model = voiceProperties.getModel();
        return (model != null && !model.isEmpty()) ? model : "/model";
    }

    private String normalizeLanguage(String language) {
        if (language == null || language.isEmpty()) {
            return "zh";
        }
        switch (language.toLowerCase()) {
            case "chinese":
            case "zh-cn":
            case "zh-tw":
            case "zh-hk":
                return "zh";
            case "english":
            case "en-us":
            case "en-gb":
                return "en";
            case "japanese":
                return "ja";
            case "korean":
                return "ko";
            case "french":
                return "fr";
            case "german":
                return "de";
            case "spanish":
                return "es";
            case "russian":
                return "ru";
            default:
                return language;
        }
    }

    private String getExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') < 0) {
            return ".webm";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}
