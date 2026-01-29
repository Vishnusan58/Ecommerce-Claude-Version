package com.ecommerce.ecommerce_backend.repository;

import com.ecommerce.ecommerce_backend.model.PremiumSubscription;
import com.ecommerce.ecommerce_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PremiumSubscriptionRepository extends JpaRepository<PremiumSubscription, Long> {

    Optional<PremiumSubscription> findByUser(User user);

    Optional<PremiumSubscription> findByUserAndActiveTrue(User user);

    boolean existsByUserAndActiveTrue(User user);
}
