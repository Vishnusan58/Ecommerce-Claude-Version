package com.ecommerce.ecommerce_backend.controller.product;

import com.ecommerce.ecommerce_backend.dto.product.ProductComparisonDTO;
import com.ecommerce.ecommerce_backend.dto.product.ProductResponseDTO;
import com.ecommerce.ecommerce_backend.dto.product.ProductSearchDTO;
import com.ecommerce.ecommerce_backend.model.Product;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.service.auth.AuthService;
import com.ecommerce.ecommerce_backend.service.product.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;
    private final AuthService authService;

    public ProductController(ProductService productService,
                             AuthService authService) {
        this.productService = productService;
        this.authService = authService;
    }



    // =========================
    // 2️⃣ GET PRODUCT BY ID
    // =========================
    @GetMapping("/{productId}")
    public ProductResponseDTO getProductById(
            @PathVariable Long productId,
            @RequestHeader(value = "X-USER-ID", required = false) Long userId) {

        // user fetched only for validation / future use (optional for guest browsing)
        if (userId != null) {
            authService.getUserById(userId);
        }

        Product product = productService.getProductById(productId);
        return mapToResponse(product);
    }

    // =========================
    // 3️⃣ SEARCH PRODUCTS
    // =========================
    @PostMapping("/search")
    public List<ProductResponseDTO> searchProducts(
            @RequestBody ProductSearchDTO dto,
            @RequestHeader("X-USER-ID") Long userId) {

        authService.getUserById(userId);

        return productService.searchProducts(dto.getKeyword())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================
    // 4️⃣ COMPARE PRODUCTS
    // =========================
    @PostMapping("/compare")
    public List<ProductComparisonDTO> compareProducts(
            @RequestBody List<Long> productIds,
            @RequestHeader("X-USER-ID") Long userId) {

        authService.getUserById(userId);

        return productService.compareProducts(productIds)
                .stream()
                .map(p -> {
                    ProductComparisonDTO dto = new ProductComparisonDTO();
                    dto.setProductId(p.getId());
                    dto.setName(p.getName());
                    dto.setPrice(p.getPrice());
                    dto.setDescription(p.getDescription());
                    dto.setRating(p.getAverageRating());
                    dto.setStock(p.getStockQuantity());
                    return dto;
                }).collect(Collectors.toList());
    }

    // =========================
    // MAPPER METHOD
    // =========================
    private ProductResponseDTO mapToResponse(Product product) {

        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setProductId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setBrand(product.getBrand());
        dto.setPrice(product.getPrice());
        dto.setDiscountPercent(product.getDiscountPercent());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setAverageRating(product.getAverageRating());
        dto.setImageUrl(product.getImageUrl());
        dto.setCreatedAt(product.getCreatedAt());

        return dto;
    }

    @GetMapping
    public Page<Product> getProducts(
            @RequestHeader(value = "X-USER-ID", required = false) Long userId,

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,

            // 🔍 Search & filters (optional)
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating
    ) {

        // 👇 GUEST USER (NO LOGIN)
        User user = null;
        if (userId != null) {
            user = authService.getUserById(userId);
        }

        return productService.getProducts(
                user,
                page,
                size,
                sortBy,
                direction,
                keyword,
                categoryId,
                minPrice,
                maxPrice,
                minRating
        );
    }
}

