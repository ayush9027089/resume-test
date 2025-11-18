package com.resumeshortlist.resume_shortlist_backend.dto;

public record RegisterRequest (String name,
                               String email,
                               String password ) {
}
