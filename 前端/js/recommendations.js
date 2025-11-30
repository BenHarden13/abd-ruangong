
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
    
    // FORCE LOAD LOCAL DATA ONLY
    // We bypass API completely to ensure the correct English data is shown
    allRecipes = getDefaultRecipes();
    filteredRecipes = [...allRecipes];
    renderRecipes();
    
    setupEventListeners();
}

function setupEventListeners() {
    const addFilterListener = (id, field) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', (e) => {
            currentFilters[field] = e.target.value;
            applyFilters();
        });
    };

    addFilterListener('mealTypeFilter', 'mealType');
    addFilterListener('categoryFilter', 'category');
    addFilterListener('caloriesFilter', 'maxCalories');

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilters.search = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    const modal = document.getElementById('recipeModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => { if(modal) modal.classList.remove('show'); });
    }
    if (modal) {
        window.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('show'); });
        document.addEventListener('keydown', (e) => { if(e.key === 'Escape') modal.classList.remove('show'); });
    }
}

function applyFilters() {
    filteredRecipes = allRecipes.filter(recipe => {
        if (currentFilters.mealType && recipe.mealType.toLowerCase() !== currentFilters.mealType.toLowerCase()) return false;
        
        if (currentFilters.category) {
             const catMatch = recipe.category.toLowerCase() === currentFilters.category.toLowerCase();
             const tagMatch = recipe.tags.toLowerCase().includes(currentFilters.category.toLowerCase());
             if (!catMatch && !tagMatch) return false;
        }
        
        if (currentFilters.maxCalories) {
            const cal = recipe.calories;
            const range = currentFilters.maxCalories;
            if (range === '0-200' && cal > 200) return false;
            if (range === '200-400' && (cal < 200 || cal > 400)) return false;
            if (range === '400-600' && (cal < 400 || cal > 600)) return false;
            if (range === '600+' && cal < 600) return false;
        }
        
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
    document.getElementById('mealTypeFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('caloriesFilter').value = '';
    const sInput = document.getElementById('searchInput');
    if(sInput) sInput.value = '';
    
    filteredRecipes = [...allRecipes];
    renderRecipes();
}

function renderRecipes() {
    const container = document.getElementById('recipesGrid');
    const skeletonGrid = document.getElementById('skeletonGrid');
    const noResults = document.getElementById('noResults');
    
    if(container) {
        container.innerHTML = '';
        container.style.display = 'grid';
    }
    if(skeletonGrid) skeletonGrid.style.display = 'none';

    if (filteredRecipes.length === 0) {
        if (noResults) noResults.style.display = 'block';
        return;
    } else {
        if (noResults) noResults.style.display = 'none';
    }

    filteredRecipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        container.appendChild(card);
    });
    
    // Simple fade in
    setTimeout(() => {
        document.querySelectorAll('.recipe-card').forEach(c => c.style.opacity = 1);
    }, 50);
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card shadow-soft';
    card.style.opacity = '0';
    card.style.transition = 'opacity 0.5s ease';
    
    const tagsList = recipe.tags.split(',').slice(0, 2).map(t => t.trim());

    card.innerHTML = `
        <div class="recipe-image">
            <img src="${recipe.imageUrl}" alt="${recipe.name}" loading="lazy">
            <span class="recipe-difficulty">${recipe.difficulty}</span>
        </div>
        <div class="recipe-content">
            <h3 class="recipe-name">${recipe.name}</h3>
            <div class="recipe-meta">
                <span>${recipe.calories} kcal</span> • <span>${recipe.prepTime}</span>
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
    
    document.getElementById('modalCalories').textContent = `${recipe.calories} kcal`;
    document.getElementById('modalPrepTime').textContent = recipe.prepTime;
    document.getElementById('modalDifficulty').textContent = recipe.difficulty;
    
    document.getElementById('modalProtein').textContent = `${recipe.protein}g`;
    document.getElementById('modalCarbs').textContent = `${recipe.carbs}g`;
    document.getElementById('modalFat').textContent = `${recipe.fat}g`;
    
    const tags = recipe.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('');
    document.getElementById('modalRecipeTags').innerHTML = tags;
    
    const ingredients = recipe.ingredients.split(',').map(i => `<li>${i.trim()}</li>`).join('');
    document.getElementById('modalIngredients').innerHTML = ingredients;
    
    const instructions = recipe.instructions.split(/(\d\.)/).filter(s => s.trim().length > 2)
        .map(s => `<li>${s.trim().replace(/^\d\./, '')}</li>`).join('');
    document.getElementById('modalInstructions').innerHTML = instructions;
    
    modal.classList.add('show');
}

// 15 Hardcoded English Recipes
function getDefaultRecipes() {
    return [
        {
            id: 1,
            name: 'Avocado & Poached Egg Toast',
            calories: 320,
            protein: 14, carbs: 28, fat: 18,
            mealType: 'Breakfast', category: 'Balanced', tags: 'Vegetarian, High Fiber',
            ingredients: '1 slice Sourdough Bread, 1/2 Avocado, 1 Large Egg, Chili Flakes',
            description: 'Creamy avocado on toasted sourdough topped with a perfectly poached egg.',
            instructions: '1. Toast sourdough. 2. Mash avocado. 3. Poach egg. 4. Assemble and season.',
            prepTime: '10 min', difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1613769049987-b31b641f25b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 2,
            name: 'Grilled Lemon Herb Chicken',
            calories: 450,
            protein: 52, carbs: 5, fat: 20,
            mealType: 'Lunch', category: 'Main Course', tags: 'High Protein, Low Carb',
            ingredients: '200g Chicken Breast, Lemon, Rosemary, Garlic, Olive Oil',
            description: 'Juicy grilled chicken marinated in zesty lemon and fresh herbs.',
            instructions: '1. Marinate chicken. 2. Grill 6-7 mins per side. 3. Serve with greens.',
            prepTime: '45 min', difficulty: 'Medium',
            imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 3,
            name: 'Quinoa & Black Bean Power Bowl',
            calories: 380,
            protein: 15, carbs: 55, fat: 12,
            mealType: 'Lunch', category: 'Bowl', tags: 'Vegan, High Fiber',
            ingredients: 'Quinoa, Black Beans, Avocado, Corn, Tomatoes',
            description: 'A nutrient-packed vegan bowl perfect for energy.',
            instructions: '1. Assemble all ingredients in a bowl. 2. Dress with lime vinaigrette.',
            prepTime: '15 min', difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 4,
            name: 'Pan-Seared Salmon with Asparagus',
            calories: 480,
            protein: 40, carbs: 8, fat: 32,
            mealType: 'Dinner', category: 'Main Course', tags: 'High Protein, Omega-3',
            ingredients: 'Salmon Fillet, Asparagus, Butter, Lemon, Garlic',
            description: 'Crispy skin salmon served with tender butter-garlic asparagus.',
            instructions: '1. Sear salmon skin-side down. 2. Flip and finish. 3. Sauté asparagus in pan juices.',
            prepTime: '20 min', difficulty: 'Medium',
            imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 5,
            name: 'Greek Yogurt Berry Parfait',
            calories: 250,
            protein: 20, carbs: 30, fat: 6,
            mealType: 'Breakfast', category: 'Bowl', tags: 'High Protein, Antioxidants',
            ingredients: 'Greek Yogurt, Mixed Berries, Honey, Granola',
            description: 'Layers of creamy yogurt, fresh berries, and crunchy granola.',
            instructions: '1. Layer yogurt, berries, and granola in a glass. 2. Drizzle honey.',
            prepTime: '5 min', difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 6,
            name: 'Hearty Lentil Soup',
            calories: 220,
            protein: 12, carbs: 35, fat: 4,
            mealType: 'Dinner', category: 'Soup', tags: 'Vegan, Warm, Low Calorie',
            ingredients: 'Lentils, Onion, Carrots, Celery, Vegetable Broth',
            description: 'A comforting and filling plant-based soup.',
            instructions: '1. Sauté veggies. 2. Add lentils and broth. 3. Simmer 25 mins.',
            prepTime: '35 min', difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 7,
            name: 'Turkey & Broccoli Stir-Fry',
            calories: 340,
            protein: 38, carbs: 15, fat: 12,
            mealType: 'Dinner', category: 'Main Course', tags: 'High Protein, Low Carb',
            ingredients: 'Turkey Breast, Broccoli, Soy Sauce, Ginger, Sesame Oil',
            description: 'Quick lean protein stir-fry with crunchy veggies.',
            instructions: '1. Stir-fry turkey strips. 2. Add broccoli. 3. Add sauce and simmer.',
            prepTime: '20 min', difficulty: 'Medium',
            imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 8,
            name: 'Chia Seed Pudding',
            calories: 180,
            protein: 6, carbs: 15, fat: 10,
            mealType: 'Snack', category: 'Bowl', tags: 'Vegan, Omega-3',
            ingredients: 'Chia Seeds, Almond Milk, Vanilla, Maple Syrup',
            description: 'Creamy nutrient-dense pudding.',
            instructions: '1. Mix all ingredients. 2. Refrigerate overnight.',
            prepTime: '5 min', difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 9,
            name: 'Shrimp Tacos with Slaw',
            calories: 310,
            protein: 24, carbs: 28, fat: 10,
            mealType: 'Dinner', category: 'Main Course', tags: 'Pescatarian, Spicy',
            ingredients: 'Shrimp, Corn Tortillas, Cabbage Slaw, Lime',
            description: 'Spicy shrimp served in soft tortillas with crunchy slaw.',
            instructions: '1. Sauté shrimp. 2. Warm tortillas. 3. Assemble with slaw.',
            prepTime: '20 min', difficulty: 'Medium',
            imageUrl: '/images/pngtree-mexican-shrimp-tacos-with-colorful-toppings-design-png-image_16088699.png'
        },
        {
            id: 10,
            name: 'Creamy Mushroom Risotto',
            calories: 420,
            protein: 12, carbs: 60, fat: 14,
            mealType: 'Dinner', category: 'Main Course', tags: 'Vegetarian, Comfort',
            ingredients: 'Arborio Rice, Mushrooms, Broth, Parmesan',
            description: 'Rich and creamy Italian rice dish.',
            instructions: '1. Sauté mushrooms. 2. Toast rice and add broth slowly. 3. Stir in cheese.',
            prepTime: '40 min', difficulty: 'Hard',
            imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 11,
            name: 'Classic Cobb Salad',
            calories: 490,
            protein: 45, carbs: 10, fat: 30,
            mealType: 'Lunch', category: 'Salad', tags: 'High Protein, Keto',
            ingredients: 'Chicken, Bacon, Egg, Avocado, Blue Cheese, Lettuce',
            description: 'A loaded salad that eats like a meal.',
            instructions: '1. Chop ingredients. 2. Arrange in rows. 3. Dress.',
            prepTime: '20 min', difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 12,
            name: 'Green Detox Smoothie Bowl',
            calories: 260,
            protein: 8, carbs: 45, fat: 6,
            mealType: 'Breakfast', category: 'Bowl', tags: 'Vegan, Detox',
            ingredients: 'Spinach, Banana, Pineapple, Coconut Water',
            description: 'Refreshing green smoothie topped with fruit.',
            instructions: '1. Blend ingredients. 2. Pour into bowl. 3. Top with fruit.',
            prepTime: '10 min', difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 13,
            name: 'Zucchini Noodles with Pesto',
            calories: 190,
            protein: 6, carbs: 12, fat: 14,
            mealType: 'Dinner', category: 'Main Course', tags: 'Low Carb, Vegetarian',
            ingredients: 'Zucchinis, Basil Pesto, Cherry Tomatoes, Pine Nuts',
            description: 'Light and fresh alternative to pasta.',
            instructions: '1. Spiralize zucchini. 2. Sauté briefly. 3. Toss with pesto.',
            prepTime: '15 min', difficulty: 'Easy',
            imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 14,
            name: 'Sweet Potato & Black Bean Tacos',
            calories: 340,
            protein: 10, carbs: 58, fat: 8,
            mealType: 'Lunch', category: 'Main Course', tags: 'Vegan, Fiber Rich',
            ingredients: 'Sweet Potato, Black Beans, Corn Tortillas, Avocado',
            description: 'Flavorful plant-based tacos.',
            instructions: '1. Roast sweet potatoes. 2. Fill tortillas with beans and potato. 3. Top with salsa.',
            prepTime: '30 min', difficulty: 'Medium',
            imageUrl: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 15,
            name: 'Tuna Poke Bowl',
            calories: 440,
            protein: 35, carbs: 45, fat: 12,
            mealType: 'Dinner', category: 'Bowl', tags: 'High Protein, Seafood',
            ingredients: 'Sushi Tuna, Rice, Edamame, Cucumber, Seaweed',
            description: 'Restaurant-quality raw fish bowl at home.',
            instructions: '1. Cube tuna. 2. Serve over rice. 3. Arrange toppings.',
            prepTime: '20 min', difficulty: 'Medium',
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
    ];
}

window.viewRecipeDetail = viewRecipeDetail;
