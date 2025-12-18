package com.resumeshortlist.resume_shortlist_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.resumeshortlist.resume_shortlist_backend.entity.JobPosting;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.core.type.TypeReference;

@Service
public class JobDescriptionParsingService {

    @Autowired
    private Client geminiClient;

    private final Tika tika = new Tika();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JobPosting parseJobDescription(File file) {
        JobPosting extractedData = new JobPosting();
        try {
            // 1. Extract Text
            String text = tika.parseToString(file);

            // 2. Call Gemini
            String jsonResponse = callGeminiApi(text);

            // 3. Map to Entity
            JsonNode root = objectMapper.readTree(jsonResponse);

            extractedData.setTitle(getText(root, "title"));
            extractedData.setDepartment(getText(root, "department"));
            extractedData.setDescription(getText(root, "description")); // Summary or full text
            extractedData.setMinExperienceYears(getInt(root, "minExperienceYears"));
            extractedData.setEducationLevel(getText(root, "educationLevel"));

        } catch (Exception e) {
            System.err.println("JD Parsing Failed: " + e.getMessage());
            // Fallback defaults if AI fails
            extractedData.setTitle(file.getName());
            extractedData.setDescription("Uploaded via file. Parsing failed.");
        }
        return extractedData;
    }

    public Map<String, String> categorizeSkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) return new HashMap<>();

        try {
            String skillsString = String.join(", ", skills);
            String prompt = "Classify the following skills into exactly one of these three categories: 'TECHNICAL', 'TOOL', 'SOFT'.\n" +
                    "Skills: " + skillsString + "\n" +
                    "Return ONLY valid JSON format mapping skill name to category. Example:\n" +
                    "{ \"Java\": \"TECHNICAL\", \"JIRA\": \"TOOL\", \"Communication\": \"SOFT\" }";

            GenerateContentConfig config = GenerateContentConfig.builder()
                    .responseMimeType("application/json")
                    .temperature(0.0f)
                    .build();

            GenerateContentResponse response = geminiClient.models.generateContent(
                    "gemini-2.5-flash",
                    prompt,
                    config
            );

            String rawJson = response.text().replaceAll("(?i)^\\s*```json\\s*", "")
                    .replaceAll("\\s*```\\s*$", "").trim();

            return objectMapper.readValue(rawJson, new TypeReference<Map<String, String>>() {});

        } catch (Exception e) {
            System.err.println("Skill Categorization Failed: " + e.getMessage());
            // Fallback: Default all to TECHNICAL if AI fails
            Map<String, String> fallback = new HashMap<>();
            for (String s : skills) fallback.put(s, "TECHNICAL");
            return fallback;
        }
    }

    private String callGeminiApi(String text) {
        GenerateContentConfig config = GenerateContentConfig.builder()
                .responseMimeType("application/json")
                .temperature(0.0f)
                .build();

        String prompt = "Extract structured data from this Job Description into STRICT JSON.\n" +
                "Keys: title, department, description (summarized, max 500 chars), minExperienceYears (integer), educationLevel.\n" +
                "JSON Structure:\n" +
                "{ \"title\": \"\", \"department\": \"\", \"description\": \"\", \"minExperienceYears\": 0, \"educationLevel\": \"\" }\n" +
                "JOB DESCRIPTION TEXT:\n" + text;

        try {
            // 3. Call Model using the injected Client bean
            // Using 'gemini-1.5-flash' as it is the stable model currently.
            GenerateContentResponse response = geminiClient.models.generateContent(
                    "gemini-2.5-flash",
                    prompt,
                    config
            );

            // 4. Clean Response
            String rawJson = response.text();
            return rawJson.replaceAll("(?i)^\\s*```json\\s*", "")
                    .replaceAll("\\s*```\\s*$", "")
                    .trim();

        } catch (Exception e) {
            throw new RuntimeException("Gemini SDK Error: " + e.getMessage(), e);
        }
    }

    private String getText(JsonNode node, String key) { return node.has(key) && !node.get(key).isNull() ? node.get(key).asText() : null; }
    private Integer getInt(JsonNode node, String key) { return node.has(key) && !node.get(key).isNull() ? node.get(key).asInt() : null; }
}