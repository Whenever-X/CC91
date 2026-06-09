package com.cc91.forumservice.security;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Resolves UserDetails directly from the JWT token claims.
 * Avoids a Feign round-trip to User Service on every authenticated request.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    private final JwtUtil jwtUtil;

    public UserDetailsServiceImpl(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String token = extractCurrentToken();
        if (token != null) {
            Long userId = jwtUtil.getUserIdFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            if (userId != null && role != null) {
                return org.springframework.security.core.userdetails.User.builder()
                        .username(username)
                        .password("")
                        .roles(role)
                        .build();
            }
        }
        // Fallback: return minimal UserDetails with just the username
        return org.springframework.security.core.userdetails.User.builder()
                .username(username)
                .password("")
                .roles("USER")
                .build();
    }

    private String extractCurrentToken() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletAttrs) {
            HttpServletRequest request = servletAttrs.getRequest();
            String bearer = request.getHeader("Authorization");
            if (bearer != null && bearer.startsWith("Bearer ")) {
                return bearer.substring(7);
            }
        }
        return null;
    }
}
