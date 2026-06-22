package com.stationery.request.dto;

import java.time.LocalDateTime;

public class AuditLogRequest {
    private String username;
    private String role;
    private String action;
    private String requestId;
    private String details;
    private String reason;

    public AuditLogRequest() {}

    public AuditLogRequest(String username, String role, String action, String requestId, String details, String reason) {
        this.username = username;
        this.role = role;
        this.action = action;
        this.requestId = requestId;
        this.details = details;
        this.reason = reason;
    }

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

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
