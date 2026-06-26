package com.eventbooking.auth;

import com.eventbooking.user.User;
import java.util.UUID;

public class AuthResponse {

    private UUID id;
    private String email;
    private String role;
    private boolean isVerified;
    private boolean isSuspended;
    private String themePreference;
    private String accessToken;
    private String refreshToken;

    public static AuthResponse from(User user, String accessToken, String refreshToken) {
        var resp = new AuthResponse();
        resp.id = user.getId();
        resp.email = user.getEmail();
        resp.role = user.getRole();
        resp.isVerified = user.isVerified();
        resp.isSuspended = user.isSuspended();
        resp.themePreference = user.getThemePreference();
        resp.accessToken = accessToken;
        resp.refreshToken = refreshToken;
        return resp;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }
    public boolean isSuspended() { return isSuspended; }
    public void setSuspended(boolean suspended) { isSuspended = suspended; }
    public String getThemePreference() { return themePreference; }
    public void setThemePreference(String themePreference) { this.themePreference = themePreference; }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
}
