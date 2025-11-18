// src/main/java/com/resumeshortlist/resume_shortlist_backend/service/FileUploadService.java
package com.resumeshortlist.resume_shortlist_backend.service;

import com.resumeshortlist.resume_shortlist_backend.entity.Resume;
import com.resumeshortlist.resume_shortlist_backend.entity.User;
import com.resumeshortlist.resume_shortlist_backend.repository.ResumeRepository;
import com.resumeshortlist.resume_shortlist_backend.repository.UserRepository;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    private final Tika tika = new Tika();
    private final String uploadDir = "uploads/resumes/";

    public FileUploadService(ResumeRepository resumeRepository, UserRepository userRepository) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
    }

    public List<Resume> uploadMultipleResumes(Long userId, MultipartFile[] files) throws Exception {
        List<Resume> savedResumes = new ArrayList<>();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Invalid user ID"));

        for (MultipartFile file : files) {

            // 1️⃣ Save file physically
            File savedFile = saveFileToLocal(file);

            // 2️⃣ Create Resume record
            Resume resume = new Resume();
            resume.setFileName(file.getOriginalFilename());
            resume.setFilePath(savedFile.getAbsolutePath());
            resume.setFileType(file.getContentType());
            resume.setUploadedAt(LocalDateTime.now());
            resume.setUploadedBy(user);

            savedResumes.add(resumeRepository.save(resume));
        }

        return savedResumes;
    }

    public List<Resume> getAllResumesByUser(Long userId) {
        return resumeRepository.findByUploadedById(userId);
    }

    /* Helpers */
    private File saveFileToLocal(MultipartFile multipartFile) throws Exception {
        File folder = new File(uploadDir);
        if (!folder.exists()) folder.mkdirs();

        File dest = new File(uploadDir + UUID.randomUUID() + "_" + multipartFile.getOriginalFilename());
        try (FileOutputStream fos = new FileOutputStream(dest)) {
            fos.write(multipartFile.getBytes());
        }
        return dest;
    }
}