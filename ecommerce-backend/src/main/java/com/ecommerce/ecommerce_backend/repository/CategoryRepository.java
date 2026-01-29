package com.ecommerce.ecommerce_backend.repository;

import com.ecommerce.ecommerce_backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByParentCategory(Category parentCategory);

    boolean existsByName(String name);
}
