package com.sms.backend.service;

import java.net.http.HttpClient;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.sms.backend.dto.MlPredictionRequest;
import com.sms.backend.dto.MlPredictionResponse;
import com.sms.backend.exception.ApiException;

@Service
public class MlPredictionService {
    private final RestClient restClient;

    public MlPredictionService(@Value("${ml.service.url}") String serviceUrl) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(10));
        this.restClient = RestClient.builder()
                .baseUrl(serviceUrl.replaceAll("/+$", ""))
                .requestFactory(requestFactory)
                .build();
    }

    public MlPredictionResponse predict(MlPredictionRequest request) {
        try {
            MlPredictionResponse response = restClient.post()
                    .uri("/predict")
                    .body(request)
                    .retrieve()
                    .body(MlPredictionResponse.class);
            if (response == null) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "ML_INVALID_RESPONSE",
                        "The prediction service returned an invalid response");
            }
            return response;
        } catch (ApiException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "ML_SERVICE_UNAVAILABLE",
                    "The prediction service is temporarily unavailable");
        }
    }
}
