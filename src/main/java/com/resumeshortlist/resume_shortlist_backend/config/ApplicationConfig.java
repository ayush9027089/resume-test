package com.resumeshortlist.resume_shortlist_backend.config;

import com.resumeshortlist.resume_shortlist_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User;
import java.util.ArrayList;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .map(user -> new User(
                        user.getEmail(),
                        user.getPassword(),
                        new ArrayList<>() // Authorities/Roles can be added here
                ))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}