package com.resumeshortlist.resume_shortlist_backend.config;


import com.google.genai.Client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api.key:}") // Fallback to empty if not set
    private String apiKey;

    @Bean
    public Client geminiClient() {
        if (apiKey.isEmpty()) {
            // Fallback to env var or throw a clearer exception
            apiKey = System.getenv("GEMINI_API_KEY");
            if (apiKey == null || apiKey.isEmpty()) {
                throw new IllegalStateException("Gemini API key is missing. Set GEMINI_API_KEY environment variable.");
            }
        }
        return new Client.Builder().apiKey(apiKey).build(); // Adjust based on actual SDK constructor
    }

    // @Bean
    // public Client geminiClient(){
    //     return new Client();
    // }


}
