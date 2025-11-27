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
        showMessage('Searching...', 'info');

        let allRecipes;
        if (window.API && window.API.recipe) {
            if (query) {
                allRecipes = await window.API.recipe.search(query);
            } else {
                allRecipes = await window.API.recipe.getAll();
            }
        } else {
            // Fallback to default English recipes (Need to match recommendations.js default)
            // Since we can't import from another JS file easily without modules, we mock it here or fetch if possible.
            // For this guide, we assume the API is offline or returns the English mock data we defined in recommendations.js if backend fails.
            // However, result.js doesn't have getDefaultRecipes definition. 
            // We'll define a simple one here to prevent crashes.
            allRecipes = getMockEnglishRecipes();
        }

        searchResults = allRecipes.filter(recipe => {
            if (mealType && recipe.mealType !== mealType) return false;
            if (category && recipe.category !== category) return false;
            if (query && !recipeMatchesQuery(recipe, query)) return false;
            return true;
        });

        renderResults();
        showMessage(`Found ${searchResults.length} results`, 'success');

        setTimeout(() => {
            const msg = document.getElementById('message');
            if(msg) msg.style.display = 'none';
        }, 2000);

    } catch (error) {
        console.error('Search failed:', error);
        searchResults = [];
        renderResults();
    }
}

function recipeMatchesQuery(recipe, query) {
    const lowerQuery = query.toLowerCase();
    return recipe.name.toLowerCase().includes(lowerQuery) ||
           (recipe.tags && recipe.tags.toLowerCase().includes(lowerQuery));
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

    const tags = recipe.tags ? recipe.tags.split(',').map(t => t.trim()) : [];

    card.innerHTML = `
        <div class="result-image">
            <img src="${recipe.imageUrl || '../images/default-recipe.jpg'}" 
                 alt="${recipe.name}"
                 onerror="this.src='../images/default-recipe.jpg'">
        </div>
        <div class="result-content">
            <div class="result-title">${recipe.name}</div>
            <div class="result-description">${recipe.description || 'Tasty and healthy.'}</div>
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

function showMessage(message, type) {
    // console.log(message);
}

// Mock data for results page fallback
function getMockEnglishRecipes() {
    return [
        {
            id: 1,
            name: 'Grilled Chicken',
            calories: 350,
            protein: 45,
            mealType: 'lunch',
            category: 'Salad',
            tags: 'Healthy',
            description: 'Simple protein meal.'
        },
        {
            id: 2,
            name: 'Oatmeal',
            calories: 280,
            protein: 10,
            mealType: 'breakfast',
            category: 'Bowl',
            tags: 'Fiber',
            description: 'Good morning start.'
        }
    ];
}