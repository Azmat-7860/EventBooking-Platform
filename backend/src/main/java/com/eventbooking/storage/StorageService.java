package com.eventbooking.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    public String uploadPhoto(MultipartFile file) {
        return uploadToCloudinary(file, "photo", Map.of(
            "transformation", "q_auto,f_auto,w_1200"
        ));
    }

    public String uploadVideo(MultipartFile file) {
        return uploadToCloudinary(file, "video", Map.of(
            "resource_type", "video",
            "transformation", "q_auto,f_auto"
        ));
    }

    public void deleteFile(String url) {
        // Cloudinary delete by public ID — placeholder for now
    }

    private String uploadToCloudinary(MultipartFile file, String folder, Map<String, String> extra) {
        if (cloudName == null || cloudName.isEmpty()) {
            // Dev fallback: return a data URI for local testing
            try {
                String base64 = Base64.getEncoder().encodeToString(file.getBytes());
                return "data:" + file.getContentType() + ";base64," + base64;
            } catch (IOException e) {
                throw new RuntimeException("Failed to read file bytes", e);
            }
        }

        // In production, use Cloudinary's Java SDK:
        // Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
        //     "cloud_name", cloudName,
        //     "api_key", apiKey,
        //     "api_secret", apiSecret
        // ));
        // Map result = cloudinary.uploader().upload(file.getBytes(),
        //     ObjectUtils.asMap("folder", folder, ...));
        // return (String) result.get("url");

        try {
            String base64 = Base64.getEncoder().encodeToString(file.getBytes());
            return "data:" + file.getContentType() + ";base64," + base64;
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file bytes", e);
        }
    }
}
