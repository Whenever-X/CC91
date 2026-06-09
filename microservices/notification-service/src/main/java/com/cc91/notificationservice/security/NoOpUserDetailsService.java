package com.cc91.notificationservice.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

/**
 * No-op UserDetailsService for Notification Service.
 * This service doesn't have a User table, so we create a minimal UserDetails
 * object just for JWT validation purposes.
 */
@Component
public class NoOpUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Since we only validate JWTs (issued by User Service), we trust the token
        // and create a minimal UserDetails object with the username
        return User.withUsername(username)
                .password("") // No password needed for JWT-only auth
                .roles("USER")
                .build();
    }
}
