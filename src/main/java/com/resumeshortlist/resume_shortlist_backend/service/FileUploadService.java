// src/main/java/com/resumeshortlist/resume_shortlist_backend/service/FileUploadService.java
package com.resumeshortlist.resume_shortlist_backend.service;

import com.resumeshortlist.resume_shortlist_backend.entity.Resume;
import com.resumeshortlist.resume_shortlist_backend.entity.User;
import com.resumeshortlist.resume_shortlist_backend.repository.ResumeRepository;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileUploadService {

    private final ResumeRepository resumeRepository;
    private final Tika tika = new Tika();

    @Value("${file.upload-dir}")
    private String uploadDir;

    public FileUploadService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    public Resume uploadResume(MultipartFile file, User uploadedBy) throws IOException {
        // 1. Validate file
        if (file.isEmpty()) throw new IllegalArgumentException("File is empty");

        String fileType = tika.detect(file.getInputStream());
        if (!fileType.equals("application/pdf") && !fileType.contains("officedocument.wordprocessingml")) {
            throw new IllegalArgumentException("Only PDF and DOCX allowed");
        }

        // 2. Save file to disk
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, file.getBytes());

        // 3. Extract text
        //String extractedText = tika.parseToString(file.getInputStream());

        // 4. Save to DB
        Resume resume = new Resume();
        resume.setFileName(file.getOriginalFilename());
        resume.setFilePath(filePath.toString());
        resume.setFileType(fileType);
        resume.setUploadedBy(uploadedBy);

        return resumeRepository.save(resume);
    }
}