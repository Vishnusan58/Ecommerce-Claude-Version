package com.ecommerce.ecommerce_backend.config;

import com.ecommerce.ecommerce_backend.enums.UserRole;
import com.ecommerce.ecommerce_backend.model.Category;
import com.ecommerce.ecommerce_backend.model.Product;
import com.ecommerce.ecommerce_backend.model.User;
import com.ecommerce.ecommerce_backend.repository.CategoryRepository;
import com.ecommerce.ecommerce_backend.repository.ProductRepository;
import com.ecommerce.ecommerce_backend.repository.UserRepository;
import com.ecommerce.ecommerce_backend.util.PasswordUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public DataInitializer(UserRepository userRepository, CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        createUsers();
        createCategories();
        createProducts();
    }

    private void createUsers() {
        // Admin
        if (!userRepository.existsByEmail("admin@ecommerce.com")) {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail("admin@ecommerce.com");
            admin.setPassword(PasswordUtil.hashPassword("admin123"));
            admin.setPhone("9876543210");
            admin.setRole(UserRole.ADMIN);
            admin.setSellerVerified(true);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            System.out.println("✅ Admin created: admin@ecommerce.com / admin123");
        }

        // Sellers
        if (!userRepository.existsByEmail("seller@ecommerce.com")) {
            User seller = new User();
            seller.setName("Tech Store");
            seller.setEmail("seller@ecommerce.com");
            seller.setPassword(PasswordUtil.hashPassword("seller123"));
            seller.setPhone("9876543211");
            seller.setRole(UserRole.SELLER);
            seller.setSellerVerified(true);
            seller.setCreatedAt(LocalDateTime.now());
            userRepository.save(seller);
            System.out.println("✅ Seller created: seller@ecommerce.com / seller123");
        }

        if (!userRepository.existsByEmail("fashion@ecommerce.com")) {
            User seller2 = new User();
            seller2.setName("Fashion Hub");
            seller2.setEmail("fashion@ecommerce.com");
            seller2.setPassword(PasswordUtil.hashPassword("seller123"));
            seller2.setPhone("9876543212");
            seller2.setRole(UserRole.SELLER);
            seller2.setSellerVerified(true);
            seller2.setCreatedAt(LocalDateTime.now());
            userRepository.save(seller2);
            System.out.println("✅ Seller created: fashion@ecommerce.com / seller123");
        }

        // Customers
        if (!userRepository.existsByEmail("john@example.com")) {
            User customer = new User();
            customer.setName("John Doe");
            customer.setEmail("john@example.com");
            customer.setPassword(PasswordUtil.hashPassword("password123"));
            customer.setPhone("9876543213");
            customer.setRole(UserRole.CUSTOMER);
            customer.setCreatedAt(LocalDateTime.now());
            userRepository.save(customer);
            System.out.println("✅ Customer created: john@example.com / password123");
        }

        if (!userRepository.existsByEmail("jane@example.com")) {
            User customer2 = new User();
            customer2.setName("Jane Smith");
            customer2.setEmail("jane@example.com");
            customer2.setPassword(PasswordUtil.hashPassword("password123"));
            customer2.setPhone("9876543214");
            customer2.setRole(UserRole.CUSTOMER);
            customer2.setCreatedAt(LocalDateTime.now());
            userRepository.save(customer2);
            System.out.println("✅ Customer created: jane@example.com / password123");
        }
    }

    private void createCategories() {
        String[][] categories = {
            {"Electronics", "Smartphones, Laptops, Gadgets and more"},
            {"Fashion", "Clothing, Shoes, Accessories"},
            {"Home & Living", "Furniture, Decor, Kitchen items"},
            {"Sports", "Sports equipment and fitness gear"},
            {"Books", "Fiction, Non-fiction, Educational"},
            {"Beauty", "Skincare, Makeup, Personal care"}
        };

        for (String[] cat : categories) {
            if (!categoryRepository.existsByName(cat[0])) {
                Category category = new Category();
                category.setName(cat[0]);
                category.setDescription(cat[1]);
                categoryRepository.save(category);
                System.out.println("✅ Category created: " + cat[0]);
            }
        }
    }

    private void createProducts() {
        if (productRepository.count() > 0) {
            return; // Products already exist
        }

        User seller = userRepository.findByEmail("seller@ecommerce.com").orElse(null);
        User fashionSeller = userRepository.findByEmail("fashion@ecommerce.com").orElse(null);

        Category electronics = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Electronics")).findFirst().orElse(null);
        Category fashion = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Fashion")).findFirst().orElse(null);
        Category sports = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Sports")).findFirst().orElse(null);
        Category home = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Home & Living")).findFirst().orElse(null);

        if (seller == null || electronics == null) {
            System.out.println("⚠️ Cannot create products - missing seller or categories");
            return;
        }

        // Electronics Products
        createProduct("iPhone 15 Pro", "Latest Apple iPhone with A17 Pro chip, 48MP camera", "Apple",
                134900, 10, seller, electronics, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500", 4.8, 5);

        createProduct("Samsung Galaxy S24 Ultra", "Premium Android phone with S Pen and AI features", "Samsung",
                129999, 15, seller, electronics, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500", 4.7, 8);

        createProduct("MacBook Air M3", "Thin and light laptop with Apple M3 chip", "Apple",
                114900, 8, seller, electronics, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500", 4.9, 0);

        createProduct("Sony WH-1000XM5", "Premium noise cancelling wireless headphones", "Sony",
                29990, 25, seller, electronics, "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500", 4.6, 15);

        createProduct("iPad Pro 12.9\"", "Powerful tablet with M2 chip and Liquid Retina XDR display", "Apple",
                112900, 12, seller, electronics, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500", 4.8, 10);

        createProduct("Dell XPS 15", "Premium Windows laptop with OLED display", "Dell",
                189990, 6, seller, electronics, "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500", 4.5, 12);

        // Fashion Products
        if (fashionSeller != null && fashion != null) {
            createProduct("Premium Cotton T-Shirt", "Comfortable 100% cotton crew neck t-shirt", "Levis",
                    999, 100, fashionSeller, fashion, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", 4.3, 20);

            createProduct("Slim Fit Jeans", "Classic blue denim jeans with stretch", "Levis",
                    2499, 50, fashionSeller, fashion, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500", 4.4, 25);

            createProduct("Running Shoes", "Lightweight sports shoes with cushioned sole", "Nike",
                    4999, 30, fashionSeller, fashion, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", 4.6, 30);

            createProduct("Leather Wallet", "Genuine leather bifold wallet", "Tommy Hilfiger",
                    1299, 45, fashionSeller, fashion, "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500", 4.2, 15);
        }

        // Sports Products
        if (sports != null) {
            createProduct("Cricket Bat - English Willow", "Professional grade cricket bat", "MRF",
                    8999, 20, seller, sports, "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500", 4.7, 10);

            createProduct("Yoga Mat Premium", "Non-slip exercise mat with carrying strap", "Boldfit",
                    1499, 40, seller, sports, "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500", 4.5, 20);

            createProduct("Dumbbell Set 20kg", "Adjustable dumbbell set for home gym", "Decathlon",
                    3999, 15, seller, sports, "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500", 4.4, 0);
        }

        // Home & Living Products
        if (home != null) {
            createProduct("Ergonomic Office Chair", "Adjustable lumbar support and armrests", "IKEA",
                    12999, 10, seller, home, "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500", 4.6, 18);

            createProduct("LED Desk Lamp", "Dimmable desk lamp with USB charging port", "Philips",
                    1999, 35, seller, home, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500", 4.3, 25);

            createProduct("Coffee Maker", "Programmable drip coffee maker 12 cups", "Morphy Richards",
                    4499, 20, seller, home, "https://images.unsplash.com/photo-1459755486867-b55449bb39ff?w=500", 4.5, 15);
        }

        System.out.println("✅ All products created successfully!");
    }

    private void createProduct(String name, String description, String brand, double price, int stock,
                               User seller, Category category, String imageUrl, double rating, double discount) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setBrand(brand);
        product.setPrice(price);
        product.setStockQuantity(stock);
        product.setSeller(seller);
        product.setCategory(category);
        product.setImageUrl(imageUrl);
        product.setAverageRating(rating);
        product.setDiscountPercent(discount);
        product.setCreatedAt(LocalDateTime.now());
        productRepository.save(product);
    }
}
