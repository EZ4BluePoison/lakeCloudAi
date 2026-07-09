package com.lakecloud.ai.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lakecloud.ai.service.AudioService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class AudioController {

    @Autowired
    private AudioService audioService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping(value = "/audio/transcriptions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> transcribe(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "model", required = false) String model,
            @RequestParam(value = "language", required = false, defaultValue = "zh") String language,
            @RequestParam(value = "prompt", required = false) String prompt) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\":\"音频文件不能为空\"}");
        }

        try {
            String text = audioService.transcribe(file, language, prompt);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"text\":\"" + escapeJson(text) + "\"}");
        } catch (Exception e) {
            log.error("语音转写失败", e);
            String message = e.getMessage();
            String upstreamError = extractUpstreamError(message);
            if (upstreamError != null) {
                message = upstreamError;
            }
            return ResponseEntity.status(500)
                    .body("{\"error\":\"" + escapeJson(message) + "\"}");
        }
    }

    private String extractUpstreamError(String message) {
        if (message == null) {
            return null;
        }
        int split = message.indexOf("|");
        if (split > 0 && message.length() > split + 1) {
            String body = message.substring(split + 1);
            try {
                JsonNode root = objectMapper.readTree(body);
                if (root.has("error") && root.get("error").has("message")) {
                    return root.get("error").get("message").asText();
                }
                if (root.has("message")) {
                    return root.get("message").asText();
                }
            } catch (Exception ignored) {
                return body;
            }
        }
        return null;
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
