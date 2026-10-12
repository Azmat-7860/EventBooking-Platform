package com.eventbooking.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Page<User> findByRole(String role, Pageable pageable);
    java.util.List<User> findByRole(String role);
    Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);
    Page<User> findByRoleAndEmailContainingIgnoreCase(String role, String email, Pageable pageable);
    long countByRole(String role);
}
