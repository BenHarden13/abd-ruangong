package com.diet.hub.repository;

import com.diet.hub.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    
    List<Recipe> findByCategory(String category);
    
    @Query("SELECT r FROM Recipe r WHERE r.calories BETWEEN :minCalories AND :maxCalories")
    List<Recipe> findByCaloriesRange(@Param("minCalories") Integer minCalories, 
                                     @Param("maxCalories") Integer maxCalories);
    
    @Query("SELECT r FROM Recipe r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Recipe> searchRecipes(@Param("keyword") String keyword);
}
