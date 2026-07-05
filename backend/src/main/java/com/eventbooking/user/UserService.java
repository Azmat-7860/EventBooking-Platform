package com.eventbooking.user;

import com.eventbooking.common.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepo;

    public UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    public ApiResponse<Page<User>> getAllUsers(int page, int size, String role, String search) {
        PageRequest pr = PageRequest.of(page, size);
        if (role != null && !role.isBlank() && search != null && !search.isBlank()) {
            return ApiResponse.ok(userRepo.findByRoleAndEmailContainingIgnoreCase(role, search, pr));
        }
        if (role != null && !role.isBlank()) {
            return ApiResponse.ok(userRepo.findByRole(role, pr));
        }
        if (search != null && !search.isBlank()) {
            return ApiResponse.ok(userRepo.findByEmailContainingIgnoreCase(search, pr));
        }
        return ApiResponse.ok(userRepo.findAll(pr));
    }

    public ApiResponse<User> suspendUser(UUID id) {
        return userRepo.findById(id).map(user -> {
            user.setSuspended(true);
            return ApiResponse.ok(userRepo.save(user), "User suspended");
        }).orElse(ApiResponse.error("User not found"));
    }

    public ApiResponse<User> reinstateUser(UUID id) {
        return userRepo.findById(id).map(user -> {
            user.setSuspended(false);
            return ApiResponse.ok(userRepo.save(user), "User reinstated");
        }).orElse(ApiResponse.error("User not found"));
    }

    public long countByRole(String role) {
        return userRepo.countByRole(role);
    }
}
