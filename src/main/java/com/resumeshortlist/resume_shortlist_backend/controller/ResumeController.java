package com.resumeshortlist.resume_shortlist_backend.controller;

import com.resumeshortlist.resume_shortlist_backend.entity.Resume;
import com.resumeshortlist.resume_shortlist_backend.entity.User;
import com.resumeshortlist.resume_shortlist_backend.service.FileUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final FileUploadService fileUploadService;

    public ResumeController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {  // Temp: pass user ID

        try {
            User mockUser = new User();
            mockUser.setId(userId);

            Resume saved = fileUploadService.uploadResume(file, mockUser);
            return ResponseEntity.ok("Resume uploaded! ID: " + saved.getId() +
                    "\nText length: " + saved.getFilePath());
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        }
    }
}