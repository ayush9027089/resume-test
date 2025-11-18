package com.resumeshortlist.resume_shortlist_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.resumeshortlist.resume_shortlist_backend")
public class ResumeShortlistBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(ResumeShortlistBackendApplication.class, args);
    }
}
