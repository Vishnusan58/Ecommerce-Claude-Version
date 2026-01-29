package com.ecommerce.ecommerce_backend.controller.user;

import com.ecommerce.ecommerce_backend.dto.wishlist.WishlistItemDTO;
import com.ecommerce.ecommerce_backend.dto.wishlist.WishlistResponseDTO;
import com.ecommerce.ecommerce_backend.model.Product;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.service.auth.AuthService;
import com.ecommerce.ecommerce_backend.service.user.WishlistService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;
    private final AuthService authService;

    public WishlistController(WishlistService wishlistService,
                              AuthService authService) {
        this.wishlistService = wishlistService;
        this.authService = authService;
    }

    @PostMapping("/{productId}")
    public void addToWishlist(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long productId) {

        User user = authService.getUserById(userId);

        Product product = new Product();
        product.setId(productId);

        wishlistService.addToWishlist(user, product);
    }

    @DeleteMapping("/{productId}")
    public void removeFromWishlist(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long productId) {

        User user = authService.getUserById(userId);

        Product product = new Product();
        product.setId(productId);

        wishlistService.removeFromWishlist(user, product);
    }

    @GetMapping
    public WishlistResponseDTO getWishlist(
            @RequestHeader("X-USER-ID") Long userId) {

        User user = authService.getUserById(userId);

        List<WishlistItemDTO> items = wishlistService.getWishlist(user)
                .stream()
                .map(w -> {
                    Product product = w.getProduct();
                    WishlistItemDTO dto = new WishlistItemDTO();
                    dto.setProductId(product.getId());
                    dto.setProductName(product.getName());
                    dto.setDescription(product.getDescription());
                    dto.setPrice(product.getPrice());
                    dto.setOriginalPrice(product.getOriginalPrice());
                    dto.setRating(product.getAverageRating());
                    dto.setImageUrl(product.getImageUrl());
                    dto.setStockQuantity(product.getStockQuantity());
                    dto.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
                    dto.setDiscountPercent(product.getDiscountPercent());
                    dto.setPremiumEarlyAccess(product.getPremiumEarlyAccess());
                    return dto;
                }).collect(Collectors.toList());

        WishlistResponseDTO response = new WishlistResponseDTO();
        response.setItems(items);
        return response;
    }
}
