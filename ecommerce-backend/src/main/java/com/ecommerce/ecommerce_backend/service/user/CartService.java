package com.ecommerce.ecommerce_backend.service.user;

import com.ecommerce.ecommerce_backend.model.*;
import com.ecommerce.ecommerce_backend.repository.CartItemRepository;
import com.ecommerce.ecommerce_backend.repository.CartRepository;
import com.ecommerce.ecommerce_backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    public Cart getCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    cart.setCreatedAt(LocalDateTime.now());
                    return cartRepository.save(cart);
                });
    }

    public CartItem addItem(User user, Long productId, int quantity) {
        Cart cart = getCart(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(product);
        item.setQuantity(quantity);

        return cartItemRepository.save(item);
    }

    public List<CartItem> getCartItems(User user) {
        Cart cart = getCart(user);
        return cartItemRepository.findByCart(cart);
    }

    public void clearCart(User user) {
        Cart cart = getCart(user);
        cartItemRepository.deleteByCart(cart);
    }

    public CartItem updateItemQuantity(User user, Long cartItemId, int quantity) {
        Cart cart = getCart(user);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Verify item belongs to user's cart
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to user");
        }

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    public void removeItem(User user, Long cartItemId) {
        Cart cart = getCart(user);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Verify item belongs to user's cart
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to user");
        }

        cartItemRepository.delete(item);
    }
}
