package com.diet.hub.service;

import com.diet.hub.entity.Recipe;
import com.diet.hub.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RecipeService {
    
    @Autowired
    private RecipeRepository recipeRepository;
    
    public Recipe createRecipe(Recipe recipe) {
        return recipeRepository.save(recipe);
    }
    
    public Optional<Recipe> getRecipeById(Long id) {
        return recipeRepository.findById(id);
    }
    
    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }
    
    public List<Recipe> getRecipesByCategory(String category) {
        return recipeRepository.findByCategory(category);
    }
    
    public List<Recipe> searchRecipes(String keyword) {
        return recipeRepository.searchRecipes(keyword);
    }
    
    public List<Recipe> getRecipesByCaloriesRange(Integer minCalories, Integer maxCalories) {
        return recipeRepository.findByCaloriesRange(minCalories, maxCalories);
    }
    
    public Recipe updateRecipe(Long id, Recipe recipeDetails) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));
        
        recipe.setName(recipeDetails.getName());
        recipe.setDescription(recipeDetails.getDescription());
        recipe.setIngredients(recipeDetails.getIngredients());
        recipe.setInstructions(recipeDetails.getInstructions());
        recipe.setCalories(recipeDetails.getCalories());
        recipe.setProtein(recipeDetails.getProtein());
        recipe.setCarbohydrates(recipeDetails.getCarbohydrates());
        recipe.setFat(recipeDetails.getFat());
        recipe.setPreparationTime(recipeDetails.getPreparationTime());
        recipe.setDifficulty(recipeDetails.getDifficulty());
        recipe.setCategory(recipeDetails.getCategory());
        recipe.setTags(recipeDetails.getTags());
        recipe.setImageUrl(recipeDetails.getImageUrl());
        
        return recipeRepository.save(recipe);
    }
    
    public void deleteRecipe(Long id) {
        recipeRepository.deleteById(id);
    }
}
