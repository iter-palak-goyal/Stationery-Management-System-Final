package com.stationery.request.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String action;

    @Column(name = "request_id")
    private String requestId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "action_date", nullable = false)
    private LocalDateTime actionDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(columnDefinition = "TEXT")
    private String reason;

    public AuditLog() {}

    public AuditLog(Long id, String username, String role, String action, String requestId, String details, LocalDateTime actionDate, LocalDateTime updatedDate, String reason) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.action = action;
        this.requestId = requestId;
        this.details = details;
        this.actionDate = actionDate;
        this.updatedDate = updatedDate;
        this.reason = reason;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getActionDate() { return actionDate; }
    public void setActionDate(LocalDateTime actionDate) { this.actionDate = actionDate; }

    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    @PrePersist
    protected void onCreate() {
        this.actionDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedDate = LocalDateTime.now();
    }

    public static AuditLogBuilder builder() { return new AuditLogBuilder(); }

    public static class AuditLogBuilder {
        private Long id;
        private String username;
        private String role;
        private String action;
        private String requestId;
        private String details;
        private LocalDateTime actionDate;
        private LocalDateTime updatedDate;
        private String reason;

        public AuditLogBuilder id(Long id) { this.id = id; return this; }
        public AuditLogBuilder username(String username) { this.username = username; return this; }
        public AuditLogBuilder role(String role) { this.role = role; return this; }
        public AuditLogBuilder action(String action) { this.action = action; return this; }
        public AuditLogBuilder requestId(String requestId) { this.requestId = requestId; return this; }
        public AuditLogBuilder details(String details) { this.details = details; return this; }
        public AuditLogBuilder actionDate(LocalDateTime actionDate) { this.actionDate = actionDate; return this; }
        public AuditLogBuilder updatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; return this; }
        public AuditLogBuilder reason(String reason) { this.reason = reason; return this; }

        public AuditLog build() {
            return new AuditLog(id, username, role, action, requestId, details, actionDate, updatedDate, reason);
        }
    }
}
