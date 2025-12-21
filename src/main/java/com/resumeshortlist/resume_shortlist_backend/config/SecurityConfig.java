package com.resumeshortlist.resume_shortlist_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.resumeshortlist.resume_shortlist_backend.filter.JwtAuthenticationFilter;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/api/auth/**", "/api/register", "/api/login").permitAll()// allow login/register
                        .requestMatchers("/api/resumes/upload/**").permitAll()
                        .requestMatchers("/api/resumes/analyze/all/**").permitAll()
                        .requestMatchers("api/job-postings/upload/**").permitAll()
                        .requestMatchers("api/job-postings/save-requirements/**").permitAll()
                        .requestMatchers("/api/score/**").permitAll()
                        .requestMatchers("/api/dashboard/**").permitAll()  // ← ADD THIS LINE
//                        .requestMatchers("/api/**").authenticated()
//                        .requestMatchers("/api/resumes/upload/**").authenticated()  // or .hasRole("RECRUITER")
//                        .requestMatchers("/api/resumes/analyze/all/**").authenticated()
//                        .requestMatchers("/api/job-postings/upload/**").authenticated()
//                        .requestMatchers("/api/job-postings/save-requirements/**").authenticated()
//                        .requestMatchers("/api/score/**").authenticated()
//                        .requestMatchers("/api/dashboard/**").authenticated()// protect your API
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 2. Split the string into a list and use it
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
