package com.lakecloud.ai.util;

import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;

public final class SslUtils {

    private SslUtils() {
    }

    /**
     * 创建 HttpClient。
     * 当 trustAll 为 true 时信任所有证书并跳过主机名校验，仅用于本地开发或对接内部自签名证书接口；
     * 生产环境必须传入 false，使用 JVM 默认信任库进行正常的 TLS 校验。
     */
    public static CloseableHttpClient createHttpClient(boolean trustAll) {
        if (trustAll) {
            return createTrustAllHttpClient();
        }
        return HttpClients.custom().build();
    }

    private static CloseableHttpClient createTrustAllHttpClient() {
        try {
            X509TrustManager trustManager = new X509TrustManager() {
                @Override
                public void checkClientTrusted(X509Certificate[] chain, String authType) {
                }

                @Override
                public void checkServerTrusted(X509Certificate[] chain, String authType) {
                }

                @Override
                public X509Certificate[] getAcceptedIssuers() {
                    return new X509Certificate[0];
                }
            };

            TrustManager[] trustManagers = new TrustManager[]{trustManager};
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustManagers, new java.security.SecureRandom());

            SSLConnectionSocketFactory socketFactory = new SSLConnectionSocketFactory(
                    sslContext,
                    NoopHostnameVerifier.INSTANCE
            );

            return HttpClients.custom()
                    .setSSLSocketFactory(socketFactory)
                    .build();
        } catch (Exception e) {
            throw new IllegalStateException("创建信任所有证书的 HttpClient 失败", e);
        }
    }
}
