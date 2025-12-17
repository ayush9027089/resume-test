package com.resumeshortlist.resume_shortlist_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeshortlist.resume_shortlist_backend.entity.*;
import com.resumeshortlist.resume_shortlist_backend.repository.*;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.HashMap;

import java.util.Map;

@Service
public class ResumeParsingService {

    @Autowired private ResumeRepository resumeRepository;
    @Autowired private CandidateRepository candidateRepository;
    @Autowired private EducationRepository educationRepository;
    @Autowired private WorkExperienceRepository workExperienceRepository;
    @Autowired private ProjectRepository projectRepository;

    @Value("${gemini.api.key}") // You must add this to application.properties
    private String geminiApiKey;

    private final Tika tika = new Tika();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public void parseAndSaveResume(Long resumeId) throws Exception {
        // 1. Fetch Resume Record
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        // 2. Extract Text from File
        File file = new File(resume.getFilePath());
        if (!file.exists()) throw new RuntimeException("File not found on server: " + resume.getFilePath());
        
        String resumeText = tika.parseToString(file);
        
        // 3. Call Gemini to Structure Data
        String jsonResponse = callGeminiApi(resumeText);
        
        // 4. Parse JSON Response
        JsonNode rootNode = objectMapper.readTree(jsonResponse);
        
        // 5. Save Candidate
        Candidate candidate = new Candidate();
        candidate.setResume(resume);
        candidate.setName(getText(rootNode, "name"));
        candidate.setEmail(getText(rootNode, "email"));
        candidate.setPhone(getText(rootNode, "phone"));
        candidate.setLinkedinUrl(getText(rootNode, "linkedinUrl"));
        candidate.setGithubUrl(getText(rootNode, "githubUrl"));
        candidate.setPortfolioUrl(getText(rootNode, "portfolioUrl"));
        candidate.setExtractedAt(LocalDateTime.now());
        
        candidate = candidateRepository.save(candidate);

        // 6. Save Education
        if (rootNode.has("education")) {
            for (JsonNode node : rootNode.get("education")) {
                Education edu = new Education();
                edu.setCandidate(candidate);
                edu.setDegree(getText(node, "degree"));
                edu.setInstitution(getText(node, "institution"));
                edu.setFieldOfStudy(getText(node, "fieldOfStudy"));
                edu.setStartYear(getInt(node, "startYear"));
                edu.setEndYear(getInt(node, "endYear"));
                edu.setGpa(getFloat(node, "gpa"));
                educationRepository.save(edu);
            }
        }

        // 7. Save Work Experience
        if (rootNode.has("workExperience")) {
            for (JsonNode node : rootNode.get("workExperience")) {
                WorkExperience work = new WorkExperience();
                work.setCandidate(candidate);
                work.setJobTitle(getText(node, "jobTitle"));
                work.setCompany(getText(node, "company"));
                work.setDescription(getText(node, "description"));
                work.setStartDate(getDate(node, "startDate"));
                work.setEndDate(getDate(node, "endDate"));
                work.setIsCurrent(getBool(node, "isCurrent"));
                workExperienceRepository.save(work);
            }
        }

        // 8. Save Projects
        if (rootNode.has("projects")) {
            for (JsonNode node : rootNode.get("projects")) {
                Project proj = new Project();
                proj.setCandidate(candidate);
                proj.setTitle(getText(node, "title"));
                proj.setDescription(getText(node, "description"));
                proj.setTechStack(getText(node, "techStack"));
                proj.setGithubLink(getText(node, "githubLink"));
                proj.setLiveLink(getText(node, "liveLink"));
                projectRepository.save(proj);
            }
        }
    }

    // --- GEMINI API CALLER ---
    private String callGeminiApi(String resumeText) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        // Strict JSON Schema Prompt
        String prompt = "You are a Resume Parser. Extract data from the following resume text into strict JSON format. " +
                "Use EXACTLY these keys: " +
                "{ 'name': '', 'email': '', 'phone': '', 'linkedinUrl': '', 'githubUrl': '', 'portfolioUrl': '', " +
                "'education': [{ 'degree': '', 'institution': '', 'fieldOfStudy': '', 'startYear': int, 'endYear': int, 'gpa': float }], " +
                "'workExperience': [{ 'jobTitle': '', 'company': '', 'description': '', 'startDate': 'YYYY-MM-DD', 'endDate': 'YYYY-MM-DD', 'isCurrent': boolean }], " +
                "'projects': [{ 'title': '', 'description': '', 'techStack': '', 'githubLink': '', 'liveLink': '' }] " +
                "} " +
                "If a field is missing, use null. Dates must be YYYY-MM-DD. " +
                "RESUME TEXT: " + resumeText;

        // Construct Request Body
        Map<String, Object> content = new HashMap<>();
        content.put("parts", new Object[]{ new HashMap<String, String>() {{ put("text", prompt); }} });
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", new Object[]{ content });

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            // Extract the actual text from Gemini's nested response structure
            String rawJson = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            // Clean markdown code blocks if Gemini adds them (```json ... ```)
            return rawJson.replace("```json", "").replace("```", "").trim();
            
        } catch (Exception e) {
            throw new RuntimeException("Gemini Parsing Failed: " + e.getMessage());
        }
    }

    // --- Helper Methods to safely extract JSON fields ---
    private String getText(JsonNode node, String key) {
        return node.has(key) && !node.get(key).isNull() ? node.get(key).asText() : null;
    }
    private Integer getInt(JsonNode node, String key) {
        return node.has(key) && !node.get(key).isNull() ? node.get(key).asInt() : null;
    }
    private Float getFloat(JsonNode node, String key) {
        return node.has(key) && !node.get(key).isNull() ? (float) node.get(key).asDouble() : null;
    }
    private Boolean getBool(JsonNode node, String key) {
        return node.has(key) && !node.get(key).isNull() && node.get(key).asBoolean();
    }
    private LocalDate getDate(JsonNode node, String key) {
        try {
            String dateStr = getText(node, key);
            return dateStr != null ? LocalDate.parse(dateStr) : null;
        } catch (Exception e) { return null; }
    }
}