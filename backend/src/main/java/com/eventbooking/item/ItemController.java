package com.eventbooking.item;

import com.eventbooking.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/items")
public class ItemController {

    private final ItemService service;

    public ItemController(ItemService service) {
        this.service = service;
    }

    private UUID getUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    // ─── Public ───────────────────────────────────────────────────────────

    @GetMapping("/{slugOrId}")
    public ResponseEntity<ApiResponse<Item>> getBySlug(@PathVariable String slugOrId) {
        try {
            UUID id = UUID.fromString(slugOrId);
            return ResponseEntity.ok(service.getById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(service.getBySlug(slugOrId));
        }
    }

    // ─── Vendor Items ─────────────────────────────────────────────────────

    @GetMapping("/vendor/mine")
    public ResponseEntity<ApiResponse<List<Item>>> getMyItems(Authentication auth) {
        return ResponseEntity.ok(service.getVendorItems(getUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Item>> create(@RequestBody Item item, Authentication auth) {
        return ResponseEntity.ok(service.create(item, getUserId(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Item>> update(@PathVariable UUID id, @RequestBody Item item, Authentication auth) {
        return ResponseEntity.ok(service.update(id, item, getUserId(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(service.delete(id, getUserId(auth)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Item>> toggleStatus(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(service.toggleStatus(id, getUserId(auth)));
    }

    // ─── Photos ───────────────────────────────────────────────────────────

    @GetMapping("/{id}/photos")
    public ResponseEntity<ApiResponse<List<ItemPhoto>>> getPhotos(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getPhotos(id));
    }

    @PostMapping("/{id}/photos")
    public ResponseEntity<ApiResponse<ItemPhoto>> uploadPhoto(
            @PathVariable UUID id, @RequestParam("file") MultipartFile file, Authentication auth) {
        return ResponseEntity.ok(service.uploadPhoto(id, file, getUserId(auth)));
    }

    @DeleteMapping("/{id}/photos/{photoId}")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(
            @PathVariable UUID id, @PathVariable UUID photoId, Authentication auth) {
        return ResponseEntity.ok(service.deletePhoto(id, photoId, getUserId(auth)));
    }

    // ─── Video ────────────────────────────────────────────────────────────

    @PostMapping("/{id}/video")
    public ResponseEntity<ApiResponse<Item>> uploadVideo(
            @PathVariable UUID id, @RequestParam("file") MultipartFile file, Authentication auth) {
        return ResponseEntity.ok(service.uploadVideo(id, file, getUserId(auth)));
    }

    // ─── Availability ─────────────────────────────────────────────────────

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<List<ItemAvailability>>> getAvailability(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getAvailability(id));
    }

    @PostMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<ItemAvailability>> blockDate(
            @PathVariable UUID id, @RequestBody ItemAvailability avail, Authentication auth) {
        return ResponseEntity.ok(service.blockDate(id, avail, getUserId(auth)));
    }

    @DeleteMapping("/{id}/availability/{dateId}")
    public ResponseEntity<ApiResponse<Void>> unblockDate(
            @PathVariable UUID id, @PathVariable UUID dateId, Authentication auth) {
        return ResponseEntity.ok(service.unblockDate(id, dateId, getUserId(auth)));
    }
}
