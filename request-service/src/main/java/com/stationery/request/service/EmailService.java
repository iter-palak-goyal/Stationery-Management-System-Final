package com.stationery.request.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends an email notification to the student.
     * Logs the notification to the audit logs and attempts to send a real email
     * if the JavaMailSender bean is present and configured.
     *
     * @param toEmail the recipient email address
     * @param subject the email subject
     * @param body    the email body
     */
    public void sendNotification(String toEmail, String subject, String body) {
        log.info("AUDIT EMAIL NOTIFICATION [SIMULATED]:\n" +
                 "--------------------------------------------------\n" +
                 "To: {}\n" +
                 "Subject: {}\n" +
                 "Body: {}\n" +
                 "--------------------------------------------------", toEmail, subject, body);

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(body);
                message.setFrom("no-reply@stationery.com");
                mailSender.send(message);
                log.info("AUDIT EMAIL NOTIFICATION: Actual email sent successfully to {}", toEmail);
            } catch (Exception e) {
                log.error("Failed to send actual email to {}: {}", toEmail, e.getMessage());
            }
        } else {
            log.info("AUDIT EMAIL NOTIFICATION: JavaMailSender not configured. Real email skipped.");
        }
    }
}
