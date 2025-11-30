
// Results Page JavaScript

let searchResults = [];
let currentSort = 'relevance';

document.addEventListener('DOMContentLoaded', function() {
    initResultsPage();
});

function initResultsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q') || '';
    const mealType = urlParams.get('mealType') || '';
    const category = urlParams.get('category') || '';

    performSearch(searchQuery, mealType, category);
    setupEventListeners();
}

async function performSearch(query, mealType, category) {
    try {
        // USE MOCK DATA ONLY (Sync with Recommendations)
        // Accessing the same data function from recommendations.js style logic
        const allRecipes = getMockEnglishRecipes();

        searchResults = allRecipes.filter(recipe => {
            if (mealType && recipe.mealType.toLowerCase() !== mealType.toLowerCase()) return false;
            if (category && recipe.category.toLowerCase() !== category.toLowerCase()) return false;
            if (query && !recipeMatchesQuery(recipe, query)) return false;
            return true;
        });

        renderResults();

    } catch (error) {
        console.error('Search failed:', error);
        searchResults = [];
        renderResults();
    }
}

function recipeMatchesQuery(recipe, query) {
    const lowerQuery = query.toLowerCase();
    return recipe.name.toLowerCase().includes(lowerQuery) ||
           (recipe.tags && recipe.tags.toLowerCase().includes(lowerQuery)) ||
           (recipe.ingredients && recipe.ingredients.toLowerCase().includes(lowerQuery));
}

function setupEventListeners() {
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentSort = e.target.value;
        sortResults();
        renderResults();
    });
}

function sortResults() {
    switch (currentSort) {
        case 'calories-asc':
            searchResults.sort((a, b) => a.calories - b.calories);
            break;
        case 'calories-desc':
            searchResults.sort((a, b) => b.calories - a.calories);
            break;
        case 'protein-desc':
            searchResults.sort((a, b) => b.protein - a.protein);
            break;
        default:
            break;
    }
}

function renderResults() {
    const container = document.getElementById('resultsGrid');
    const resultCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');

    if(resultCount) resultCount.textContent = `Found ${searchResults.length} recipes`;

    if (searchResults.length === 0) {
        container.innerHTML = '';
        if(noResults) noResults.style.display = 'block';
        return;
    } else {
        if(noResults) noResults.style.display = 'none';
    }

    container.innerHTML = '';
    searchResults.forEach(recipe => {
        const card = createResultCard(recipe);
        container.appendChild(card);
    });
}

function createResultCard(recipe) {
    const card = document.createElement('div');
    card.className = 'result-card';

    // Fallback logic SAME as recommendations.js
    const safeImage = recipe.imageUrl;

    card.innerHTML = `
        <div class="result-image">
            <img src="${safeImage}" alt="${recipe.name}">
        </div>
        <div class="result-content">
            <div class="result-title">${recipe.name}</div>
            <div class="result-description">${recipe.description}</div>
            <div class="result-stats">
                 <span class="stat-item">
                    <span class="stat-value">${recipe.calories}</span>
                    <span class="stat-label">kcal</span>
                 </span>
                 <span class="stat-item">
                    <span class="stat-value">${recipe.protein}g</span>
                    <span class="stat-label">Protein</span>
                 </span>
            </div>
        </div>
    `;
    return card;
}

// COPY OF DATA FOR SYNC (Normally we'd import this, but keeping single file for simplicity)
function getMockEnglishRecipes() {
    return [
        {
            id: 1, name: 'Avocado & Poached Egg Toast', calories: 320, protein: 14,
            mealType: 'Breakfast', category: 'Balanced', tags: 'Vegetarian, High Fiber',
            description: 'Creamy avocado on toasted sourdough topped with a perfectly poached egg.',
            imageUrl: 'https://images.unsplash.com/photo-1613769049987-b31b641f25b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 2, name: 'Grilled Lemon Herb Chicken', calories: 450, protein: 52,
            mealType: 'Lunch', category: 'Main Course', tags: 'High Protein, Low Carb',
            description: 'Juicy grilled chicken marinated in zesty lemon and fresh herbs.',
            imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 3, name: 'Quinoa & Black Bean Power Bowl', calories: 380, protein: 15,
            mealType: 'Lunch', category: 'Bowl', tags: 'Vegan, High Fiber',
            description: 'A nutrient-packed vegan bowl perfect for energy.',
            imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342d2c7135?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 4, name: 'Pan-Seared Salmon with Asparagus', calories: 480, protein: 40,
            mealType: 'Dinner', category: 'Main Course', tags: 'High Protein, Omega-3, Keto',
            description: 'Crispy skin salmon served with tender butter-garlic asparagus.',
            imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 5, name: 'Greek Yogurt Berry Parfait', calories: 250, protein: 20,
            mealType: 'Breakfast', category: 'Bowl', tags: 'High Protein, Antioxidants',
            description: 'Layers of creamy yogurt, fresh berries, and crunchy granola.',
            imageUrl: 'https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 6, name: 'Hearty Lentil Soup', calories: 220, protein: 12,
            mealType: 'Dinner', category: 'Soup', tags: 'Vegan, Warm, Low Calorie',
            description: 'A comforting and filling plant-based soup.',
            imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 7, name: 'Turkey & Broccoli Stir-Fry', calories: 340, protein: 38,
            mealType: 'Dinner', category: 'Main Course', tags: 'High Protein, Low Carb',
            description: 'Quick lean protein stir-fry with crunchy veggies.',
            imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 8, name: 'Chia Seed Pudding', calories: 180, protein: 6,
            mealType: 'Snack', category: 'Bowl', tags: 'Vegan, Omega-3',
            description: 'Creamy nutrient-dense pudding.',
            imageUrl: 'https://images.unsplash.com/photo-1622502701538-28d4b7662337?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 9, name: 'Shrimp Tacos with Slaw', calories: 310, protein: 24,
            mealType: 'Dinner', category: 'Main Course', tags: 'Pescatarian, Spicy',
            description: 'Spicy shrimp served in soft tortillas with crunchy slaw.',
            imageUrl: 'https://images.unsplash.com/photo-1512838243147-844c040702aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 10, name: 'Creamy Mushroom Risotto', calories: 420, protein: 12,
            mealType: 'Dinner', category: 'Main Course', tags: 'Vegetarian, Comfort',
            description: 'Rich and creamy Italian rice dish.',
            imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 11, name: 'Classic Cobb Salad', calories: 490, protein: 45,
            mealType: 'Lunch', category: 'Salad', tags: 'High Protein, Keto',
            description: 'A loaded salad that eats like a meal.',
            imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 12, name: 'Green Detox Smoothie Bowl', calories: 260, protein: 8,
            mealType: 'Breakfast', category: 'Bowl', tags: 'Vegan, Detox',
            description: 'Refreshing green smoothie topped with fruit.',
            imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 13, name: 'Zucchini Noodles with Pesto', calories: 190, protein: 6,
            mealType: 'Dinner', category: 'Main Course', tags: 'Low Carb, Vegetarian',
            description: 'Light and fresh alternative to pasta.',
            imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 14, name: 'Sweet Potato & Black Bean Tacos', calories: 340, protein: 10,
            mealType: 'Lunch', category: 'Main Course', tags: 'Vegan, Fiber Rich',
            description: 'Flavorful plant-based tacos.',
            imageUrl: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 15, name: 'Tuna Poke Bowl', calories: 440, protein: 35,
            mealType: 'Dinner', category: 'Bowl', tags: 'High Protein, Seafood',
            description: 'Restaurant-quality raw fish bowl at home.',
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
    ];
}
