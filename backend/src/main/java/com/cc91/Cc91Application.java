package com.cc91;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

/**
 * CC91 Forum System - Main Application
 * Spring Boot 应用程序入口
 */
@SpringBootApplication
public class Cc91Application {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Shanghai"));
        SpringApplication.run(Cc91Application.class, args);
        System.out.println("CC91 Forum Backend is running on http://localhost:8080");
    }
}
