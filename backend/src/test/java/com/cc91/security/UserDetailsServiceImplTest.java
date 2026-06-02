package com.cc91.security;

import com.cc91.entity.User;
import com.cc91.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:userdetails-test;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.flyway.enabled=false",
        "app.dev-data.enabled=false"
})
@ActiveProfiles("test")
@Transactional
class UserDetailsServiceImplTest {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser", "test@example.com", "$2a$10$hashedpassword");
        testUser.setRole("USER");
        testUser = userRepository.save(testUser);
    }

    @Test
    void loadUserByUsername_found_returnsCorrectUserDetails() {
        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");

        assertEquals("testuser", userDetails.getUsername());
        assertEquals("$2a$10$hashedpassword", userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
    }

    @Test
    void loadUserByUsername_adminRole_mapsCorrectly() {
        User admin = new User("adminuser", "admin@example.com", "$2a$10$adminhash");
        admin.setRole("ADMIN");
        userRepository.save(admin);

        UserDetails userDetails = userDetailsService.loadUserByUsername("adminuser");

        assertEquals("adminuser", userDetails.getUsername());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    void loadUserByUsername_notFound_throwsException() {
        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("nonexistent"));
    }

    @Test
    void loadUserByUsername_lockedAccount_accountLockedFlagSet() {
        testUser.setIsLocked(true);
        testUser.setLockUntil(null);
        userRepository.save(testUser);

        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");
        assertFalse(userDetails.isAccountNonLocked());
    }

    @Test
    void loadUserByUsername_unlockedAccount_accountNonLocked() {
        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");
        assertTrue(userDetails.isAccountNonLocked());
    }
}
