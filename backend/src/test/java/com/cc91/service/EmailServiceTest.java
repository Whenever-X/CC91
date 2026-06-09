package com.cc91.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * EmailService 业务逻辑测试
 * 使用 Mockito 进行单元测试（不启动 Spring 上下文）
 */
@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    // ==================== consoleLogOnly=true 时仅打印日志 ====================

    @Test
    void sendVerificationCode_ConsoleLogOnly_LogsOnlyWithoutSending() {
        // Arrange: 启用 console-only 模式
        ReflectionTestUtils.setField(emailService, "consoleLogOnly", true);
        ReflectionTestUtils.setField(emailService, "fromAddress", "noreply@cc91.com");

        // Act & Assert: 不抛异常，不调用 mailSender
        assertDoesNotThrow(() -> emailService.sendVerificationCode("test@example.com", "123456", 600));
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendPasswordResetCode_ConsoleLogOnly_LogsOnlyWithoutSending() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "consoleLogOnly", true);
        ReflectionTestUtils.setField(emailService, "fromAddress", "noreply@cc91.com");

        // Act & Assert
        assertDoesNotThrow(() -> emailService.sendPasswordResetCode("test@example.com", "654321", 600));
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendVerificationCode_NullMailSender_LogsOnlyWithoutSending() {
        // Arrange: mailSender 为 null 时也应安全
        ReflectionTestUtils.setField(emailService, "consoleLogOnly", false);
        ReflectionTestUtils.setField(emailService, "mailSender", (JavaMailSender) null);
        ReflectionTestUtils.setField(emailService, "fromAddress", "noreply@cc91.com");

        // Act & Assert: 不抛出 NullPointerException
        assertDoesNotThrow(() -> emailService.sendVerificationCode("test@example.com", "123456", 600));
    }

    // ==================== 发送邮件成功 ====================

    @Test
    void sendVerificationCode_MailSenderActive_SendsEmail() {
        // Arrange: 关闭 console-only 模式
        ReflectionTestUtils.setField(emailService, "consoleLogOnly", false);
        ReflectionTestUtils.setField(emailService, "fromAddress", "noreply@cc91.com");

        // Act
        emailService.sendVerificationCode("test@example.com", "123456", 600);

        // Assert: mailSender.send 被调用一次
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendPasswordResetCode_MailSenderActive_SendsEmail() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "consoleLogOnly", false);
        ReflectionTestUtils.setField(emailService, "fromAddress", "noreply@cc91.com");

        // Act
        emailService.sendPasswordResetCode("test@example.com", "654321", 600);

        // Assert
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    // ==================== MailException 时优雅处理 ====================

    @Test
    void sendVerificationCode_MailException_HandledGracefully() {
        // Arrange: mailSender 抛出 MailException
        ReflectionTestUtils.setField(emailService, "consoleLogOnly", false);
        ReflectionTestUtils.setField(emailService, "fromAddress", "noreply@cc91.com");

        doThrow(new MailException("SMTP connection failed") {})
                .when(mailSender).send(any(SimpleMailMessage.class));

        // Act & Assert: 不抛出异常，优雅处理
        assertDoesNotThrow(() -> emailService.sendVerificationCode("test@example.com", "123456", 600));
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendPasswordResetCode_MailException_HandledGracefully() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "consoleLogOnly", false);
        ReflectionTestUtils.setField(emailService, "fromAddress", "noreply@cc91.com");

        doThrow(new MailException("SMTP connection failed") {})
                .when(mailSender).send(any(SimpleMailMessage.class));

        // Act & Assert
        assertDoesNotThrow(() -> emailService.sendPasswordResetCode("test@example.com", "654321", 600));
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}
