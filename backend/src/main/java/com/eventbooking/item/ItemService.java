package com.eventbooking.item;

import com.eventbooking.common.ApiResponse;
import com.eventbooking.storage.StorageService;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class ItemService {

    private final ItemRepository itemRepo;
    private final ItemPhotoRepository photoRepo;
    private final ItemAvailabilityRepository availRepo;
    private final BundleRepository bundleRepo;
    private final BundleItemRepository bundleItemRepo;
    private final StorageService storageService;

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public ItemService(ItemRepository itemRepo, ItemPhotoRepository photoRepo,
                       ItemAvailabilityRepository availRepo, BundleRepository bundleRepo,
                       BundleItemRepository bundleItemRepo, StorageService storageService) {
        this.itemRepo = itemRepo;
        this.photoRepo = photoRepo;
        this.availRepo = availRepo;
        this.bundleRepo = bundleRepo;
        this.bundleItemRepo = bundleItemRepo;
        this.storageService = storageService;
    }

    public static String toSlug(String input) {
        String noWhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        String slug = NON_LATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
    }

    // ─── Item CRUD ────────────────────────────────────────────────────────

    public ApiResponse<List<Item>> getVendorItems(UUID vendorId) {
        return ApiResponse.ok(itemRepo.findByVendorIdOrderByCreatedAtDesc(vendorId));
    }

    public ApiResponse<Item> getBySlug(String slug) {
        return itemRepo.findBySlug(slug)
            .map(ApiResponse::ok)
            .orElse(ApiResponse.error("Item not found"));
    }

    public ApiResponse<Page<Item>> getPublishedItems(String category, String search, LocalDate date, int page, int size) {
        Specification<Item> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), "published"));
            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(root.get("categoryId"), UUID.fromString(category)));
            }
            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"));
            }
            if (date != null) {
                Subquery<UUID> subquery = query.subquery(UUID.class);
                Root<ItemAvailability> availRoot = subquery.from(ItemAvailability.class);
                subquery.select(availRoot.get("itemId"))
                        .where(cb.equal(availRoot.get("blockedDate"), date));
                predicates.add(cb.not(root.get("id").in(subquery)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponse.ok(itemRepo.findAll(spec, pageRequest));
    }

    public ApiResponse<Item> getById(UUID id) {
        return itemRepo.findById(id)
            .map(ApiResponse::ok)
            .orElse(ApiResponse.error("Item not found"));
    }

    public ApiResponse<Item> create(Item item, UUID vendorId) {
        item.setVendorId(vendorId);
        item.setSlug(generateUniqueSlug(item.getTitle()));
        return ApiResponse.ok(itemRepo.save(item));
    }

    public ApiResponse<Item> update(UUID id, Item updated, UUID vendorId) {
        return itemRepo.findById(id).map(item -> {
            if (!item.getVendorId().equals(vendorId)) {
                return ApiResponse.<Item>error("Not authorized to update this item");
            }
            item.setTitle(updated.getTitle());
            item.setCategoryId(updated.getCategoryId());
            item.setDescription(updated.getDescription());
            item.setStartingFromText(updated.getStartingFromText());
            item.setExternalUrl(updated.getExternalUrl());
            item.setMetaTitle(updated.getMetaTitle());
            item.setMetaDesc(updated.getMetaDesc());
            return ApiResponse.ok(itemRepo.save(item));
        }).orElse(ApiResponse.error("Item not found"));
    }

    public ApiResponse<Void> delete(UUID id, UUID vendorId) {
        return itemRepo.findById(id).map(item -> {
            if (!item.getVendorId().equals(vendorId)) {
                return ApiResponse.<Void>error("Not authorized");
            }
            itemRepo.deleteById(id);
            return ApiResponse.<Void>ok(null);
        }).orElse(ApiResponse.error("Item not found"));
    }

    public ApiResponse<Item> toggleStatus(UUID id, UUID vendorId) {
        return itemRepo.findById(id).map(item -> {
            if (!item.getVendorId().equals(vendorId)) {
                return ApiResponse.<Item>error("Not authorized");
            }
            item.setStatus("published".equals(item.getStatus()) ? "draft" : "published");
            return ApiResponse.ok(itemRepo.save(item));
        }).orElse(ApiResponse.error("Item not found"));
    }

    // ─── Photos ───────────────────────────────────────────────────────────

    public ApiResponse<List<ItemPhoto>> getPhotos(UUID itemId) {
        return ApiResponse.ok(photoRepo.findByItemIdOrderBySortOrder(itemId));
    }

    public ApiResponse<ItemPhoto> uploadPhoto(UUID itemId, MultipartFile file, UUID vendorId) {
        return itemRepo.findById(itemId).map(item -> {
            if (!item.getVendorId().equals(vendorId)) {
                return ApiResponse.<ItemPhoto>error("Not authorized");
            }
            List<ItemPhoto> existing = photoRepo.findByItemIdOrderBySortOrder(itemId);
            if (existing.size() >= 5) {
                return ApiResponse.<ItemPhoto>error("Maximum 5 photos per item");
            }
            String url = storageService.uploadPhoto(file);
            ItemPhoto photo = new ItemPhoto();
            photo.setItemId(itemId);
            photo.setPhotoUrl(url);
            photo.setSortOrder(existing.size());
            return ApiResponse.ok(photoRepo.save(photo));
        }).orElse(ApiResponse.error("Item not found"));
    }

    public ApiResponse<Void> deletePhoto(UUID itemId, UUID photoId, UUID vendorId) {
        return photoRepo.findById(photoId).map(photo -> {
            if (!photo.getItemId().equals(itemId)) {
                return ApiResponse.<Void>error("Photo does not belong to item");
            }
            return itemRepo.findById(itemId).map(item -> {
                if (!item.getVendorId().equals(vendorId)) {
                    return ApiResponse.<Void>error("Not authorized");
                }
                photoRepo.deleteById(photoId);
                return ApiResponse.<Void>ok(null);
            }).orElse(ApiResponse.<Void>error("Item not found"));
        }).orElse(ApiResponse.error("Photo not found"));
    }

    // ─── Video ────────────────────────────────────────────────────────────

    public ApiResponse<Item> uploadVideo(UUID itemId, MultipartFile file, UUID vendorId) {
        return itemRepo.findById(itemId).map(item -> {
            if (!item.getVendorId().equals(vendorId)) {
                return ApiResponse.<Item>error("Not authorized");
            }
            String url = storageService.uploadVideo(file);
            item.setVideoUrl(url);
            return ApiResponse.ok(itemRepo.save(item));
        }).orElse(ApiResponse.error("Item not found"));
    }

    public ApiResponse<Item> deleteVideo(UUID itemId, UUID vendorId) {
        return itemRepo.findById(itemId).map(item -> {
            if (!item.getVendorId().equals(vendorId)) {
                return ApiResponse.<Item>error("Not authorized");
            }
            item.setVideoUrl(null);
            return ApiResponse.ok(itemRepo.save(item));
        }).orElse(ApiResponse.error("Item not found"));
    }

    // ─── Availability ─────────────────────────────────────────────────────

    public ApiResponse<List<ItemAvailability>> getAvailability(UUID itemId) {
        return ApiResponse.ok(availRepo.findByItemId(itemId));
    }

    public ApiResponse<ItemAvailability> blockDate(UUID itemId, ItemAvailability avail, UUID vendorId) {
        return itemRepo.findById(itemId).map(item -> {
            if (!item.getVendorId().equals(vendorId)) {
                return ApiResponse.<ItemAvailability>error("Not authorized");
            }
            if (availRepo.existsByItemIdAndBlockedDate(itemId, avail.getBlockedDate())) {
                return ApiResponse.<ItemAvailability>error("Date already blocked");
            }
            avail.setItemId(itemId);
            return ApiResponse.ok(availRepo.save(avail));
        }).orElse(ApiResponse.error("Item not found"));
    }

    public ApiResponse<Void> unblockDate(UUID itemId, UUID dateId, UUID vendorId) {
        return availRepo.findById(dateId).map(avail -> {
            if (!avail.getItemId().equals(itemId)) {
                return ApiResponse.<Void>error("Availability does not belong to item");
            }
            return itemRepo.findById(itemId).map(item -> {
                if (!item.getVendorId().equals(vendorId)) {
                    return ApiResponse.<Void>error("Not authorized");
                }
                availRepo.deleteById(dateId);
                return ApiResponse.<Void>ok(null);
            }).orElse(ApiResponse.<Void>error("Item not found"));
        }).orElse(ApiResponse.error("Availability record not found"));
    }

    // ─── Bundles ──────────────────────────────────────────────────────────

    public ApiResponse<List<Bundle>> getBundles(UUID vendorId) {
        return ApiResponse.ok(bundleRepo.findByVendorId(vendorId));
    }

    public ApiResponse<Bundle> createBundle(Bundle bundle, UUID vendorId) {
        bundle.setVendorId(vendorId);
        return ApiResponse.ok(bundleRepo.save(bundle));
    }

    public ApiResponse<Bundle> getBundle(UUID bundleId, UUID vendorId) {
        return bundleRepo.findById(bundleId)
            .filter(b -> b.getVendorId().equals(vendorId))
            .map(ApiResponse::ok)
            .orElse(ApiResponse.error("Bundle not found"));
    }

    public ApiResponse<Bundle> updateBundle(UUID bundleId, Bundle updated, UUID vendorId) {
        return bundleRepo.findById(bundleId).map(b -> {
            if (!b.getVendorId().equals(vendorId)) {
                return ApiResponse.<Bundle>error("Not authorized");
            }
            b.setName(updated.getName());
            b.setDescription(updated.getDescription());
            return ApiResponse.ok(bundleRepo.save(b));
        }).orElse(ApiResponse.error("Bundle not found"));
    }

    public ApiResponse<List<BundleItem>> getBundleItems(UUID bundleId, UUID vendorId) {
        return bundleRepo.findById(bundleId)
            .filter(b -> b.getVendorId().equals(vendorId))
            .map(b -> ApiResponse.<List<BundleItem>>ok(bundleItemRepo.findByBundleId(bundleId)))
            .orElse(ApiResponse.error("Bundle not found"));
    }

    public ApiResponse<BundleItem> addBundleItem(UUID bundleId, UUID itemId, UUID vendorId) {
        return bundleRepo.findById(bundleId).map(b -> {
            if (!b.getVendorId().equals(vendorId)) {
                return ApiResponse.<BundleItem>error("Not authorized");
            }
            BundleItem bi = new BundleItem();
            bi.setBundleId(bundleId);
            bi.setItemId(itemId);
            return ApiResponse.ok(bundleItemRepo.save(bi));
        }).orElse(ApiResponse.error("Bundle not found"));
    }

    public ApiResponse<Void> removeBundleItem(UUID bundleId, UUID itemId, UUID vendorId) {
        return bundleRepo.findById(bundleId).map(b -> {
            if (!b.getVendorId().equals(vendorId)) {
                return ApiResponse.<Void>error("Not authorized");
            }
            bundleItemRepo.findByBundleId(bundleId).stream()
                .filter(bi -> bi.getItemId().equals(itemId))
                .findFirst()
                .ifPresent(bi -> bundleItemRepo.deleteById(bi.getId()));
            return ApiResponse.<Void>ok(null);
        }).orElse(ApiResponse.error("Bundle not found"));
    }

    public ApiResponse<Void> deleteBundle(UUID bundleId, UUID vendorId) {
        return bundleRepo.findById(bundleId).map(b -> {
            if (!b.getVendorId().equals(vendorId)) {
                return ApiResponse.<Void>error("Not authorized");
            }
            bundleItemRepo.deleteByBundleId(bundleId);
            bundleRepo.deleteById(bundleId);
            return ApiResponse.<Void>ok(null);
        }).orElse(ApiResponse.error("Bundle not found"));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private String generateUniqueSlug(String title) {
        String base = toSlug(title);
        String slug = base;
        int counter = 1;
        while (itemRepo.findBySlug(slug).isPresent()) {
            slug = base + "-" + counter++;
        }
        return slug;
    }
}
