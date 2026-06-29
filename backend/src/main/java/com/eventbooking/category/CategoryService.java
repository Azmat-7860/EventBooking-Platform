package com.eventbooking.category;

import com.eventbooking.common.ApiResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository repo;

    public CategoryService(CategoryRepository repo) {
        this.repo = repo;
    }

    public ApiResponse<List<Category>> getAll() {
        return ApiResponse.ok(repo.findAll());
    }

    public ApiResponse<Category> getById(UUID id) {
        return repo.findById(id)
            .map(ApiResponse::ok)
            .orElse(ApiResponse.error("Category not found"));
    }

    public ApiResponse<Category> create(Category category) {
        return ApiResponse.ok(repo.save(category));
    }

    public ApiResponse<Category> update(UUID id, Category updated) {
        return repo.findById(id).map(cat -> {
            cat.setName(updated.getName());
            cat.setIcon(updated.getIcon());
            cat.setImageUrl(updated.getImageUrl());
            cat.setSortOrder(updated.getSortOrder());
            return ApiResponse.ok(repo.save(cat));
        }).orElse(ApiResponse.error("Category not found"));
    }

    public ApiResponse<Void> delete(UUID id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return ApiResponse.ok(null);
        }
        return ApiResponse.error("Category not found");
    }
}
