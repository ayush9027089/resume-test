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
    @Autowired private CertificationRepository certificationRepository;
    @Autowired private ExtractedSkillRepository extractedSkillRepository;

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

        // 9. Save Certifications (if provided by Gemini)
        if (rootNode.has("certifications")) {
            for (JsonNode node : rootNode.get("certifications")) {
                Certification cert = new Certification();
                cert.setCandidate(candidate);
                cert.setName(getText(node, "name"));
                cert.setIssuer(getText(node, "issuer"));
                cert.setIssueDate(getDate(node, "issueDate"));
                cert.setCertificateLink(getText(node, "certificateLink"));
                certificationRepository.save(cert);
            }
        }

        // 10. Save Extracted Skills (normalized, confidence-scored)
        if (rootNode.has("skills")) {
            for (JsonNode node : rootNode.get("skills")) {
                String skillName = getText(node, "skillName");
                if (skillName == null || skillName.isBlank()) continue;

                ExtractedSkill es = new ExtractedSkill();
                es.setCandidate(candidate);
                es.setSkillName(skillName);
                es.setCategory(getText(node, "category"));
                es.setConfidenceScore(getFloat(node, "confidenceScore"));
                extractedSkillRepository.save(es);
            }
        }
    }

    // --- GEMINI API CALLER ---
    private String callGeminiApi(String resumeText) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        // Strict JSON Schema Prompt (extended with certifications + skills)
        String prompt =
                "You are a resume parser. Extract structured data from the resume text into STRICT JSON.\n" +
                "Rules:\n" +
                "- Output ONLY JSON. No markdown, no comments.\n" +
                "- Use EXACTLY these top-level keys: name, email, phone, linkedinUrl, githubUrl, portfolioUrl, " +
                "education, workExperience, projects, certifications, skills.\n" +
                "- Use ONLY information explicitly present in the resume; if a value is missing, use null (for scalars) " +
                "or an empty array [] (for lists).\n" +
                "- Dates must be in 'YYYY-MM-DD' format when possible.\n" +
                "\n" +
                "Expected JSON shape:\n" +
                "{\n" +
                "  \"name\": string | null,\n" +
                "  \"email\": string | null,\n" +
                "  \"phone\": string | null,\n" +
                "  \"linkedinUrl\": string | null,\n" +
                "  \"githubUrl\": string | null,\n" +
                "  \"portfolioUrl\": string | null,\n" +
                "  \"education\": [\n" +
                "    {\n" +
                "      \"degree\": string | null,\n" +
                "      \"institution\": string | null,\n" +
                "      \"fieldOfStudy\": string | null,\n" +
                "      \"startYear\": number | null,\n" +
                "      \"endYear\": number | null,\n" +
                "      \"gpa\": number | null\n" +
                "    }\n" +
                "  ],\n" +
                "  \"workExperience\": [\n" +
                "    {\n" +
                "      \"jobTitle\": string | null,\n" +
                "      \"company\": string | null,\n" +
                "      \"description\": string | null,\n" +
                "      \"startDate\": string | null,\n" +
                "      \"endDate\": string | null,\n" +
                "      \"isCurrent\": boolean | null\n" +
                "    }\n" +
                "  ],\n" +
                "  \"projects\": [\n" +
                "    {\n" +
                "      \"title\": string | null,\n" +
                "      \"description\": string | null,\n" +
                "      \"techStack\": string | null,\n" +
                "      \"githubLink\": string | null,\n" +
                "      \"liveLink\": string | null\n" +
                "    }\n" +
                "  ],\n" +
                "  \"certifications\": [\n" +
                "    {\n" +
                "      \"name\": string | null,\n" +
                "      \"issuer\": string | null,\n" +
                "      \"issueDate\": string | null,\n" +
                "      \"certificateLink\": string | null\n" +
                "    }\n" +
                "  ],\n" +
                "  \"skills\": [\n" +
                "    {\n" +
                "      \"skillName\": string,\n" +
                "      \"category\": string | null,\n" +
                "      \"confidenceScore\": number | null\n" +
                "    }\n" +
                "  ]\n" +
                "}\n" +
                "\n" +
                "If you are unsure about a field, set it to null or []. Do NOT invent data.\n" +
                "RESUME TEXT:\n" + resumeText;

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