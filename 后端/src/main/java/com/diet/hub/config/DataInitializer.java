package com.diet.hub.config;

import com.diet.hub.entity.Recipe;
import com.diet.hub.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private RecipeRepository recipeRepository;
    
    @Override
    public void run(String... args) throws Exception {
        if (recipeRepository.count() == 0) {
            initializeRecipes();
        }
    }
    
    private void initializeRecipes() {
        Recipe recipe1 = new Recipe();
        recipe1.setName("Grilled Chicken Salad");
        recipe1.setDescription("A healthy and protein-rich salad with grilled chicken breast");
        recipe1.setIngredients("Chicken breast 200g, Mixed greens 100g, Cherry tomatoes 50g, Cucumber 50g, Olive oil 1 tbsp, Lemon juice 1 tbsp");
        recipe1.setInstructions("1. Grill chicken breast until cooked through. 2. Chop vegetables. 3. Mix greens, vegetables in a bowl. 4. Slice chicken and add to salad. 5. Drizzle with olive oil and lemon juice.");
        recipe1.setCalories(350);
        recipe1.setProtein(35.0);
        recipe1.setCarbohydrates(15.0);
        recipe1.setFat(18.0);
        recipe1.setPreparationTime(25);
        recipe1.setDifficulty("Easy");
        recipe1.setCategory("Salad");
        recipe1.setTags("high-protein,low-carb,gluten-free");
        recipeRepository.save(recipe1);
        
        Recipe recipe2 = new Recipe();
        recipe2.setName("Quinoa Buddha Bowl");
        recipe2.setDescription("A nutritious bowl packed with quinoa, vegetables, and tahini dressing");
        recipe2.setIngredients("Quinoa 100g, Chickpeas 100g, Sweet potato 100g, Kale 50g, Avocado 50g, Tahini 2 tbsp");
        recipe2.setInstructions("1. Cook quinoa according to package directions. 2. Roast sweet potato cubes. 3. Sauté kale. 4. Arrange all ingredients in a bowl. 5. Drizzle with tahini dressing.");
        recipe2.setCalories(480);
        recipe2.setProtein(18.0);
        recipe2.setCarbohydrates(65.0);
        recipe2.setFat(20.0);
        recipe2.setPreparationTime(35);
        recipe2.setDifficulty("Medium");
        recipe2.setCategory("Bowl");
        recipe2.setTags("vegan,high-fiber,gluten-free");
        recipeRepository.save(recipe2);
        
        Recipe recipe3 = new Recipe();
        recipe3.setName("Salmon with Steamed Broccoli");
        recipe3.setDescription("Omega-3 rich salmon fillet with perfectly steamed broccoli");
        recipe3.setIngredients("Salmon fillet 200g, Broccoli 150g, Garlic 2 cloves, Lemon 1, Olive oil 1 tbsp");
        recipe3.setInstructions("1. Season salmon with salt, pepper, and lemon juice. 2. Bake salmon at 180°C for 15 minutes. 3. Steam broccoli until tender. 4. Sauté garlic in olive oil and toss with broccoli.");
        recipe3.setCalories(400);
        recipe3.setProtein(40.0);
        recipe3.setCarbohydrates(10.0);
        recipe3.setFat(22.0);
        recipe3.setPreparationTime(20);
        recipe3.setDifficulty("Easy");
        recipe3.setCategory("Main Course");
        recipe3.setTags("high-protein,omega-3,low-carb,gluten-free");
        recipeRepository.save(recipe3);
        
        System.out.println("Sample recipes initialized successfully!");
    }
}
