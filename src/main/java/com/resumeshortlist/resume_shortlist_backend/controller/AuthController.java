package com.resumeshortlist.resume_shortlist_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Hello World from Spring Boot!";
    }
}
