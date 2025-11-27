
// Recommendations JavaScript - High-End English Version

let allRecipes = [];
let filteredRecipes = [];
let currentFilters = {
    mealType: '',
    category: '',
    maxCalories: '',
    search: ''
};

document.addEventListener('DOMContentLoaded', function() {
    initRecommendations();
});

async function initRecommendations() {
    console.log('=== Init Recommendations ===');
    
    // Initialize Skeletons if module exists
    if (window.StaggeredAnimation) {
        StaggeredAnimation.initSkeletons();
    }
    
    const userId = localStorage.getItem('currentUserId');
    
    // Load recipes
    await loadRecipes();

    setupEventListeners();
    
    // Scroll animations
    if ('IntersectionObserver' in window && window.StaggeredAnimation) {
        StaggeredAnimation.createScrollObserver('.tag');
        StaggeredAnimation.createScrollObserver('.info-box');
    }
}

async function loadRecipes() {
    try {
        showMessage('Curating recipes...', 'info');
        let recipesLoaded = false;
        
        // 1. Try API
        if (window.API && window.API.recipe) {
            try {
                allRecipes = await window.API.recipe.getAll();
                if (allRecipes && allRecipes.length > 0) {
                    recipesLoaded = true;
                }
            } catch (error) {
                console.warn('Backend load failed:', error);
            }
        }
        
        // 2. Fallback to Default Data
        if (!recipesLoaded) {
            console.log('Using curated collection...');
            allRecipes = getDefaultRecipes();
        }

        filteredRecipes = [...allRecipes];
        renderRecipes();
        
        showMessage(`Found ${allRecipes.length} curated recipes`, 'success');

        setTimeout(() => {
            const messageDiv = document.getElementById('message');
            if (messageDiv) messageDiv.style.display = 'none';
        }, 2000);

    } catch (error) {
        console.error('Error loading recipes:', error);
        allRecipes = getDefaultRecipes();
        filteredRecipes = [...allRecipes];
        renderRecipes();
    }
}

function setupEventListeners() {
    // Filters
    const addFilterListener = (id, field) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', (e) => {
                currentFilters[field] = e.target.value;
                applyFilters();
            });
        }
    };

    addFilterListener('mealTypeFilter', 'mealType');
    addFilterListener('categoryFilter', 'category');
    addFilterListener('caloriesFilter', 'maxCalories');

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilters.search = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', applyFilters);
    }

    // Reset
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', clearFilters);
    }

    // Quick Tags
    const quickTags = document.querySelectorAll('.tag[data-tag]');
    quickTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            // Toggle active state visual
            document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            const tagValue = e.target.getAttribute('data-tag');
            
            // For demo, we map tags to categories or search terms
            if (tagValue === 'high-protein') currentFilters.category = 'High Protein';
            else if (tagValue === 'vegan') currentFilters.category = 'Vegan';
            else currentFilters.search = tagValue;
            
            applyFilters();
        });
    });

    // Modal Logic
    const modal = document.getElementById('recipeModal');
    const closeBtn = document.querySelector('.close');
    
    const closeModal = () => {
        if (modal) {
            modal.classList.remove('show');
        }
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        // Close on backdrop click
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });
    }
}

function applyFilters() {
    filteredRecipes = allRecipes.filter(recipe => {
        // Meal Type
        if (currentFilters.mealType && recipe.mealType.toLowerCase() !== currentFilters.mealType.toLowerCase()) {
            return false;
        }
        // Category
        if (currentFilters.category) {
             // Loose match for category or tags
             const catMatch = recipe.category.toLowerCase() === currentFilters.category.toLowerCase();
             const tagMatch = recipe.tags.toLowerCase().includes(currentFilters.category.toLowerCase());
             if (!catMatch && !tagMatch) return false;
        }
        // Calories
        if (currentFilters.maxCalories) {
            const cal = recipe.calories;
            const range = currentFilters.maxCalories;
            if (range === '0-200' && cal > 200) return false;
            if (range === '200-400' && (cal < 200 || cal > 400)) return false;
            if (range === '400-600' && (cal < 400 || cal > 600)) return false;
            if (range === '600+' && cal < 600) return false;
        }
        // Search
        if (currentFilters.search) {
            const term = currentFilters.search.toLowerCase().trim();
            const match = recipe.name.toLowerCase().includes(term) || 
                          recipe.tags.toLowerCase().includes(term) ||
                          recipe.ingredients.toLowerCase().includes(term);
            if (!match) return false;
        }
        return true;
    });

    renderRecipes();
}

function clearFilters() {
    currentFilters = { mealType: '', category: '', maxCalories: '', search: '' };
    
    // Reset UI inputs
    document.getElementById('mealTypeFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('caloriesFilter').value = '';
    const sInput = document.getElementById('searchInput');
    if(sInput) sInput.value = '';
    
    document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));

    filteredRecipes = [...allRecipes];
    renderRecipes();
}

function renderRecipes() {
    const container = document.getElementById('recipesGrid');
    const skeletonGrid = document.getElementById('skeletonGrid');
    const noResults = document.getElementById('noResults');
    
    container.innerHTML = '';
    
    // Hide Skeletons
    if(skeletonGrid) skeletonGrid.style.display = 'none';
    container.style.display = 'grid';

    if (filteredRecipes.length === 0) {
        if (noResults) noResults.style.display = 'block';
        return;
    } else {
        if (noResults) noResults.style.display = 'none';
    }

    filteredRecipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        // Animation class
        card.classList.add('staggered-fade-in');
        container.appendChild(card);
    });
    
    // Trigger Animations
    setTimeout(() => {
        const cards = container.querySelectorAll('.staggered-fade-in');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 50);
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card shadow-soft';
    
    // Process Tags
    const tagsList = recipe.tags.split(',').slice(0, 2).map(t => t.trim());

    // Fallback image logic
    const fallbackImage = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    card.innerHTML = `
        <div class="recipe-image">
            <img src="${recipe.imageUrl}" 
                 alt="${recipe.name}" 
                 loading="lazy"
                 onerror="this.onerror=null; this.src='${fallbackImage}';">
            <span class="recipe-difficulty">${recipe.difficulty}</span>
        </div>
        <div class="recipe-content">
            <h3 class="recipe-name">${recipe.name}</h3>
            <div class="recipe-meta">
                <span>${recipe.calories} kcal</span>
                <span>•</span>
                <span>${recipe.prepTime}</span>
            </div>
            <div class="recipe-tags">
                ${tagsList.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
            </div>
            <button class="view-detail-btn" onclick="viewRecipeDetail(${recipe.id})">View Recipe</button>
        </div>
    `;

    return card;
}

function viewRecipeDetail(recipeId) {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    const modal = document.getElementById('recipeModal');
    
    document.getElementById('modalRecipeName').textContent = recipe.name;
    document.getElementById('modalDescription').textContent = recipe.description;
    
    // Stats
    setText('modalCalories', `${recipe.calories} kcal`);
    setText('modalPrepTime', recipe.prepTime);
    setText('modalDifficulty', recipe.difficulty);
    
    // Macros
    setText('modalProtein', `${recipe.protein}g`);
    setText('modalCarbs', `${recipe.carbs}g`);
    setText('modalFat', `${recipe.fat}g`);
    
    // Tags
    const tags = recipe.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('');
    document.getElementById('modalRecipeTags').innerHTML = tags;
    
    // Ingredients
    const ingredients = recipe.ingredients.split(',').map(i => `<li>${i.trim()}</li>`).join('');
    document.getElementById('modalIngredients').innerHTML = ingredients;
    
    // Instructions
    let instructionsHTML = '';
    if (recipe.instructions.includes('1.')) {
         instructionsHTML = recipe.instructions.split(/\d\./).filter(s => s.trim().length > 0)
            .map(s => `<li>${s.trim().replace(/^\./, '')}</li>`).join('');
    } else {
        instructionsHTML = recipe.instructions.split('.').filter(s => s.trim().length > 0)
            .map(s => `<li>${s.trim()}.</li>`).join('');
    }
    document.getElementById('modalInstructions').innerHTML = instructionsHTML;
    
    // Use class 'show' for flexbox centering and animation
    modal.classList.add('show');
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    messageDiv.textContent = message;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';
}

// --- DATA SOURCE ---
// 15 Unique High-Quality English Recipes with MANUALLY VERIFIED DISTINCT Images
function getDefaultRecipes() {
    return [
        {
            id: 1,
            name: 'Avocado & Poached Egg Toast',
            calories: 320,
            protein: 14,
            carbs: 28,
            fat: 18,
            mealType: 'Breakfast',
            category: 'Balanced',
            tags: 'Vegetarian, High Fiber, Quick',
            ingredients: '1 slice Sourdough Bread, 1/2 Avocado, 1 Large Egg, Chili Flakes, Lemon Juice',
            description: 'Creamy avocado on toasted sourdough topped with a perfectly poached egg.',
            instructions: '1. Toast the sourdough slice until golden. 2. Mash avocado with lemon juice and salt. 3. Poach the egg in simmering water for 3 mins. 4. Spread avocado on toast, top with egg and chili flakes.',
            prepTime: '10 min',
            difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414395d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 2,
            name: 'Grilled Lemon Herb Chicken',
            calories: 450,
            protein: 52,
            carbs: 5,
            fat: 20,
            mealType: 'Lunch',
            category: 'Main Course',
            tags: 'High Protein, Low Carb, Gluten Free',
            ingredients: '200g Chicken Breast, 1 Lemon, 2 sprigs Rosemary, 2 cloves Garlic, Olive Oil',
            description: 'Juicy grilled chicken marinated in zesty lemon and fresh herbs.',
            instructions: '1. Mix olive oil, lemon juice, minced garlic, and rosemary. 2. Marinate chicken for 30 mins. 3. Grill on medium-high heat for 6-7 mins per side. 4. Serve with steamed greens.',
            prepTime: '45 min',
            difficulty: 'Medium',
            imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 3,
            name: 'Quinoa & Black Bean Power Bowl',
            calories: 380,
            protein: 15,
            carbs: 55,
            fat: 12,
            mealType: 'Lunch',
            category: 'Bowl',
            tags: 'Vegan, High Fiber, Superfood',
            ingredients: '1 cup Cooked Quinoa, 1/2 cup Black Beans, 1/2 Avocado, Corn, Cherry Tomatoes, Lime Dressing',
            description: 'A nutrient-packed vegan bowl perfect for energy.',
            instructions: '1. Arrange quinoa, beans, corn, and tomatoes in a bowl. 2. Top with sliced avocado. 3. Drizzle with lime vinaigrette. 4. Toss gently to combine.',
            prepTime: '15 min',
            difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 4,
            name: 'Pan-Seared Salmon with Asparagus',
            calories: 480,
            protein: 40,
            carbs: 8,
            fat: 32,
            mealType: 'Dinner',
            category: 'Main Course',
            tags: 'High Protein, Omega-3, Keto Friendly',
            ingredients: '1 Salmon Fillet, 1 bunch Asparagus, Butter, Lemon, Garlic',
            description: 'Crispy skin salmon served with tender butter-garlic asparagus.',
            instructions: '1. Season salmon with salt and pepper. 2. Sear skin-side down in a hot pan for 4 mins. 3. Flip and cook 2 mins. 4. Sauté asparagus in same pan with butter and garlic.',
            prepTime: '20 min',
            difficulty: 'Medium',
            imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 5,
            name: 'Greek Yogurt Berry Parfait',
            calories: 250,
            protein: 20,
            carbs: 30,
            fat: 6,
            mealType: 'Breakfast',
            category: 'Bowl',
            tags: 'High Protein, Antioxidants, Quick',
            ingredients: '1 cup Greek Yogurt, 1/2 cup Mixed Berries, 1 tbsp Honey, 2 tbsp Granola',
            description: 'Layers of creamy yogurt, fresh berries, and crunchy granola.',
            instructions: '1. Spoon a layer of yogurt into a glass. 2. Add a layer of berries and granola. 3. Repeat layers. 4. Drizzle with honey.',
            prepTime: '5 min',
            difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291789?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 6,
            name: 'Hearty Lentil Soup',
            calories: 220,
            protein: 12,
            carbs: 35,
            fat: 4,
            mealType: 'Dinner',
            category: 'Soup',
            tags: 'Vegan, Warm, Low Calorie',
            ingredients: '1 cup Lentils, 1 Onion, 2 Carrots, 2 Celery Stalks, Vegetable Broth',
            description: 'A comforting and filling plant-based soup.',
            instructions: '1. Sauté chopped vegetables until soft. 2. Add lentils and broth. 3. Simmer for 25 mins until lentils are tender. 4. Season with thyme and pepper.',
            prepTime: '35 min',
            difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 7,
            name: 'Turkey & Broccoli Stir-Fry',
            calories: 340,
            protein: 38,
            carbs: 15,
            fat: 12,
            mealType: 'Dinner',
            category: 'Main Course',
            tags: 'High Protein, Low Carb',
            ingredients: '200g Turkey Breast, 1 cup Broccoli, Soy Sauce, Ginger, Sesame Oil',
            description: 'Quick lean protein stir-fry with crunchy veggies.',
            instructions: '1. Slice turkey into strips. 2. Stir-fry turkey in sesame oil until browned. 3. Add broccoli and splash of water. 4. Stir in soy sauce and ginger.',
            prepTime: '20 min',
            difficulty: 'Medium',
            imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 8,
            name: 'Chia Seed Pudding',
            calories: 180,
            protein: 6,
            carbs: 15,
            fat: 10,
            mealType: 'Snack',
            category: 'Bowl',
            tags: 'Vegan, Omega-3, Prep-Ahead',
            ingredients: '3 tbsp Chia Seeds, 1 cup Almond Milk, Vanilla Extract, Maple Syrup',
            description: 'A creamy, nutrient-dense pudding perfect for prepping ahead.',
            instructions: '1. Mix seeds, milk, vanilla, and syrup in a jar. 2. Stir well to prevent clumping. 3. Refrigerate for at least 4 hours or overnight.',
            prepTime: '5 min',
            difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 9,
            name: 'Shrimp Tacos with Slaw',
            calories: 310,
            protein: 24,
            carbs: 28,
            fat: 10,
            mealType: 'Dinner',
            category: 'Main Course',
            tags: 'Pescatarian, Spicy, Fresh',
            ingredients: '150g Shrimp, 2 Corn Tortillas, Cabbage Slaw, Lime, Chili Powder',
            description: 'Spicy shrimp served in soft tortillas with crunchy slaw.',
            instructions: '1. Season shrimp with chili powder. 2. Sauté shrimp for 3 mins. 3. Warm tortillas. 4. Assemble with slaw and squeeze of lime.',
            prepTime: '20 min',
            difficulty: 'Medium',
            imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 10,
            name: 'Creamy Mushroom Risotto',
            calories: 420,
            protein: 12,
            carbs: 60,
            fat: 14,
            mealType: 'Dinner',
            category: 'Main Course',
            tags: 'Vegetarian, Comfort Food',
            ingredients: 'Arborio Rice, Mushrooms, Vegetable Broth, Parmesan, White Wine',
            description: 'Rich and creamy Italian rice dish with earthy mushrooms.',
            instructions: '1. Sauté mushrooms and set aside. 2. Toast rice, then slowly add broth while stirring. 3. Cook until creamy (20 mins). 4. Stir in cheese and mushrooms.',
            prepTime: '40 min',
            difficulty: 'Hard',
            imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 11,
            name: 'Classic Cobb Salad',
            calories: 490,
            protein: 45,
            carbs: 10,
            fat: 30,
            mealType: 'Lunch',
            category: 'Salad',
            tags: 'High Protein, Keto, Filling',
            ingredients: 'Chicken, Bacon, Hard Boiled Egg, Avocado, Blue Cheese, Lettuce',
            description: 'A loaded salad that eats like a meal.',
            instructions: '1. Chop all ingredients. 2. Arrange in rows over a bed of lettuce. 3. Drizzle with red wine vinaigrette.',
            prepTime: '20 min',
            difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 12,
            name: 'Green Detox Smoothie Bowl',
            calories: 260,
            protein: 8,
            carbs: 45,
            fat: 6,
            mealType: 'Breakfast',
            category: 'Bowl',
            tags: 'Vegan, Detox, Fresh',
            ingredients: 'Spinach, Banana, Pineapple, Coconut Water, Chia Seeds',
            description: 'Refreshing green smoothie topped with fruit and seeds.',
            instructions: '1. Blend spinach, banana, pineapple, and coconut water until smooth. 2. Pour into bowl. 3. Top with sliced fruit and chia seeds.',
            prepTime: '10 min',
            difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1638176311291-3617cd13a80d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 13,
            name: 'Zucchini Noodles with Pesto',
            calories: 190,
            protein: 6,
            carbs: 12,
            fat: 14,
            mealType: 'Dinner',
            category: 'Main Course',
            tags: 'Low Carb, Vegetarian, Light',
            ingredients: '2 Zucchinis, Basil Pesto, Cherry Tomatoes, Pine Nuts',
            description: 'Light and fresh alternative to pasta.',
            instructions: '1. Spiralize zucchinis into noodles. 2. Sauté briefly (2 mins). 3. Toss with pesto and halved cherry tomatoes. 4. Garnish with pine nuts.',
            prepTime: '15 min',
            difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 14,
            name: 'Sweet Potato & Black Bean Tacos',
            calories: 340,
            protein: 10,
            carbs: 58,
            fat: 8,
            mealType: 'Lunch',
            category: 'Main Course',
            tags: 'Vegan, Fiber Rich',
            ingredients: 'Roasted Sweet Potato, Black Beans, Corn Tortillas, Avocado Salsa',
            description: 'Flavorful plant-based tacos.',
            instructions: '1. Cube and roast sweet potatoes. 2. Warm beans with cumin. 3. Fill tortillas with potatoes and beans. 4. Top with avocado salsa.',
            prepTime: '30 min',
            difficulty: 'Medium',
            imageUrl: 'https://images.unsplash.com/photo-1593030761757-71bd90dbe78e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 15,
            name: 'Tuna Poke Bowl',
            calories: 440,
            protein: 35,
            carbs: 45,
            fat: 12,
            mealType: 'Dinner',
            category: 'Bowl',
            tags: 'High Protein, Seafood, Fresh',
            ingredients: 'Sushi Grade Tuna, Sushi Rice, Edamame, Cucumber, Seaweed',
            description: 'Restaurant-quality raw fish bowl at home.',
            instructions: '1. Cube tuna and toss with soy sauce and sesame oil. 2. Serve over seasoned sushi rice. 3. Arrange veggies and seaweed on top.',
            prepTime: '20 min',
            difficulty: 'Medium',
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
    ];
}
