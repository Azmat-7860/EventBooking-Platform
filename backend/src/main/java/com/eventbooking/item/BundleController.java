package com.eventbooking.item;

import com.eventbooking.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bundles")
@PreAuthorize("hasRole('VENDOR')")
public class BundleController {

    private final ItemService service;

    public BundleController(ItemService service) {
        this.service = service;
    }

    private UUID getUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Bundle>>> getBundles(Authentication auth) {
        return ResponseEntity.ok(service.getBundles(getUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Bundle>> getBundle(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(service.getBundle(id, getUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Bundle>> create(@RequestBody Bundle bundle, Authentication auth) {
        return ResponseEntity.ok(service.createBundle(bundle, getUserId(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Bundle>> update(@PathVariable UUID id, @RequestBody Bundle bundle, Authentication auth) {
        return ResponseEntity.ok(service.updateBundle(id, bundle, getUserId(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(service.deleteBundle(id, getUserId(auth)));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<ApiResponse<List<BundleItem>>> getItems(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(service.getBundleItems(id, getUserId(auth)));
    }

    @PostMapping("/{id}/items/{itemId}")
    public ResponseEntity<ApiResponse<BundleItem>> addItem(@PathVariable UUID id, @PathVariable UUID itemId, Authentication auth) {
        return ResponseEntity.ok(service.addBundleItem(id, itemId, getUserId(auth)));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> removeItem(@PathVariable UUID id, @PathVariable UUID itemId, Authentication auth) {
        return ResponseEntity.ok(service.removeBundleItem(id, itemId, getUserId(auth)));
    }
}
