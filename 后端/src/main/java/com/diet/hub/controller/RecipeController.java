package com.diet.hub.controller;

import com.diet.hub.entity.Recipe;
import com.diet.hub.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@CrossOrigin(origins = "*")
public class RecipeController {
    
    @Autowired
    private RecipeService recipeService;
    
    @PostMapping
    public ResponseEntity<Recipe> createRecipe(@RequestBody Recipe recipe) {
        Recipe created = recipeService.createRecipe(recipe);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable Long id) {
        return recipeService.getRecipeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    public ResponseEntity<List<Recipe>> getAllRecipes() {
        List<Recipe> recipes = recipeService.getAllRecipes();
        return ResponseEntity.ok(recipes);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Recipe>> getRecipesByCategory(@PathVariable String category) {
        List<Recipe> recipes = recipeService.getRecipesByCategory(category);
        return ResponseEntity.ok(recipes);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Recipe>> searchRecipes(@RequestParam String keyword) {
        List<Recipe> recipes = recipeService.searchRecipes(keyword);
        return ResponseEntity.ok(recipes);
    }
    
    @GetMapping("/calories")
    public ResponseEntity<List<Recipe>> getRecipesByCaloriesRange(
            @RequestParam Integer min,
            @RequestParam Integer max) {
        List<Recipe> recipes = recipeService.getRecipesByCaloriesRange(min, max);
        return ResponseEntity.ok(recipes);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Recipe> updateRecipe(@PathVariable Long id, @RequestBody Recipe recipe) {
        Recipe updated = recipeService.updateRecipe(id, recipe);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }
}
