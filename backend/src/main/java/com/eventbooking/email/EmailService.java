package com.eventbooking.email;

import com.eventbooking.booking.Booking;
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

    @Async
    public void sendInquiryToVendor(String vendorEmail, Booking booking, String customerEmail, String itemTitle, String vendorBusinessName) {
        Context ctx = new Context();
        ctx.setVariable("brandName", System.getenv().getOrDefault("NEXT_PUBLIC_BRAND_NAME", "EventPro"));
        ctx.setVariable("itemTitle", itemTitle);
        ctx.setVariable("customerName", booking.getName());
        ctx.setVariable("customerEmail", customerEmail);
        ctx.setVariable("mobile", booking.getMobile());
        ctx.setVariable("preferredDate", booking.getPreferredDate() != null ? booking.getPreferredDate().toString() : "Not specified");
        ctx.setVariable("fromTime", booking.getFromTime() != null ? booking.getFromTime().toString() : "");
        ctx.setVariable("toTime", booking.getToTime() != null ? booking.getToTime().toString() : "");
        ctx.setVariable("fromLocation", booking.getFromLocation() != null ? booking.getFromLocation() : "Not specified");
        ctx.setVariable("toLocation", booking.getToLocation() != null ? booking.getToLocation() : "Not specified");
        ctx.setVariable("message", booking.getMessage() != null ? booking.getMessage() : "No message");
        ctx.setVariable("dashboardUrl", frontendUrl + "/vendor/dashboard");
        sendHtmlEmail(vendorEmail, "New Booking Inquiry - " + itemTitle, "inquiry-vendor", ctx);
    }

    @Async
    public void sendInquiryToCustomer(String customerEmail, Booking booking, String itemTitle, String vendorBusinessName) {
        Context ctx = new Context();
        ctx.setVariable("brandName", System.getenv().getOrDefault("NEXT_PUBLIC_BRAND_NAME", "EventPro"));
        ctx.setVariable("itemTitle", itemTitle);
        ctx.setVariable("vendorBusinessName", vendorBusinessName);
        ctx.setVariable("preferredDate", booking.getPreferredDate() != null ? booking.getPreferredDate().toString() : "Not specified");
        ctx.setVariable("bookingsUrl", frontendUrl + "/bookings");
        sendHtmlEmail(customerEmail, "Inquiry Submitted - " + itemTitle, "inquiry-customer", ctx);
    }

    @Async
    public void sendBookingConfirmedToCustomer(String customerEmail, Booking booking, String itemTitle, String vendorBusinessName) {
        Context ctx = new Context();
        ctx.setVariable("brandName", System.getenv().getOrDefault("NEXT_PUBLIC_BRAND_NAME", "EventPro"));
        ctx.setVariable("itemTitle", itemTitle);
        ctx.setVariable("vendorBusinessName", vendorBusinessName);
        ctx.setVariable("preferredDate", booking.getPreferredDate() != null ? booking.getPreferredDate().toString() : "Not specified");
        ctx.setVariable("bookingsUrl", frontendUrl + "/bookings");
        sendHtmlEmail(customerEmail, "Booking Confirmed - " + itemTitle, "booking-confirmed", ctx);
    }

    @Async
    public void sendBookingCancelledToCustomer(String customerEmail, Booking booking, String itemTitle, String vendorBusinessName) {
        Context ctx = new Context();
        ctx.setVariable("brandName", System.getenv().getOrDefault("NEXT_PUBLIC_BRAND_NAME", "EventPro"));
        ctx.setVariable("itemTitle", itemTitle);
        ctx.setVariable("vendorBusinessName", vendorBusinessName);
        ctx.setVariable("preferredDate", booking.getPreferredDate() != null ? booking.getPreferredDate().toString() : "Not specified");
        ctx.setVariable("frontendUrl", frontendUrl);
        sendHtmlEmail(customerEmail, "Booking Cancelled - " + itemTitle, "booking-cancelled", ctx);
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

    private void sendHtmlEmail(String to, String subject, String template, Context ctx) {
        try {
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
