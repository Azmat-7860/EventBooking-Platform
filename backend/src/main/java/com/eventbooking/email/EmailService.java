package com.eventbooking.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final String frontendUrl;

    public EmailService(JavaMailSender mailSender,
                        TemplateEngine templateEngine,
                        @Value("${app.frontend-url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.frontendUrl = frontendUrl;
    }

    @Async
    public void sendVerificationEmail(String to, String token) {
        String link = frontendUrl + "/auth/verify?token=" + token;
        sendHtmlEmail(to, "Verify your email address", "verify-email", "link", link);
    }

    @Async
    public void sendPasswordResetEmail(String to, String token) {
        String link = frontendUrl + "/auth/reset-password?token=" + token;
        sendHtmlEmail(to, "Reset your password", "reset-password", "link", link);
    }

    private void sendHtmlEmail(String to, String subject, String template, String varName, String varValue) {
        try {
            Context ctx = new Context();
            ctx.setVariable(varName, varValue);
            ctx.setVariable("brandName", System.getenv().getOrDefault("NEXT_PUBLIC_BRAND_NAME", "EventPro"));
            String html = templateEngine.process(template, ctx);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
