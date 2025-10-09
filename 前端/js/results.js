// 搜索结果页面JavaScript

let searchResults = [];
let currentSort = 'relevance';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    initResultsPage();
});

// 初始化结果页面
function initResultsPage() {
    // 获取搜索参数
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q') || '';
    const mealType = urlParams.get('mealType') || '';
    const category = urlParams.get('category') || '';

    // 显示搜索条件
    displaySearchCriteria(searchQuery, mealType, category);

    // 执行搜索
    performSearch(searchQuery, mealType, category);

    // 设置事件监听器
    setupEventListeners();
}

// 显示搜索条件
function displaySearchCriteria(query, mealType, category) {
    const criteriaDiv = document.getElementById('searchCriteria');
    let criteriaText = '';

    if (query) {
        criteriaText += `关键词: "${query}"`;
    }
    if (mealType) {
        criteriaText += ` | 餐食类型: ${getMealTypeText(mealType)}`;
    }
    if (category) {
        criteriaText += ` | 类别: ${getCategoryText(category)}`;
    }

    if (criteriaText) {
        criteriaDiv.textContent = '搜索条件: ' + criteriaText;
    } else {
        criteriaDiv.textContent = '显示所有食谱';
    }
}

// 执行搜索
async function performSearch(query, mealType, category) {
    try {
        showMessage('正在搜索...', 'info');

        let allRecipes;
        if (window.API && window.API.recipe) {
            // 从后端搜索
            if (query) {
                allRecipes = await window.API.recipe.search(query);
            } else {
                allRecipes = await window.API.recipe.getAll();
            }
        } else {
            // 使用示例数据
            allRecipes = getDefaultRecipes();
        }

        // 应用额外筛选
        searchResults = allRecipes.filter(recipe => {
            if (mealType && recipe.mealType !== mealType) return false;
            if (category && recipe.category !== category) return false;
            if (query && !recipeMatchesQuery(recipe, query)) return false;
            return true;
        });

        renderResults();
        loadRelatedRecommendations();
        showMessage(`找到 ${searchResults.length} 个结果`, 'success');

        setTimeout(() => {
            document.getElementById('message').style.display = 'none';
        }, 2000);

    } catch (error) {
        console.error('搜索失败:', error);
        showMessage('搜索失败: ' + error.message, 'error');
        searchResults = [];
        renderResults();
    }
}

// 检查食谱是否匹配查询
function recipeMatchesQuery(recipe, query) {
    const lowerQuery = query.toLowerCase();
    return recipe.name.toLowerCase().includes(lowerQuery) ||
           (recipe.tags && recipe.tags.toLowerCase().includes(lowerQuery)) ||
           (recipe.ingredients && recipe.ingredients.toLowerCase().includes(lowerQuery));
}

// 设置事件监听器
function setupEventListeners() {
    // 返回按钮
    document.getElementById('backBtn').addEventListener('click', () => {
        window.history.back();
    });

    // 排序选择
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentSort = e.target.value;
        sortResults();
        renderResults();
    });

    // 模态框关闭
    const modal = document.getElementById('recipeModal');
    document.querySelector('.close-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// 排序结果
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
        case 'name':
            searchResults.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
            break;
        case 'relevance':
        default:
            // 保持原始顺序
            break;
    }
}

// 渲染结果
function renderResults() {
    const container = document.getElementById('resultsContainer');
    const resultCount = document.getElementById('resultCount');

    resultCount.textContent = `找到 ${searchResults.length} 个食谱`;

    if (searchResults.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>没有找到匹配的食谱</h3>
                <p>请尝试调整搜索条件</p>
                <button onclick="window.location.href='recommendations.html'" class="btn-primary">
                    浏览所有食谱
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    searchResults.forEach(recipe => {
        const card = createResultCard(recipe);
        container.appendChild(card);
    });
}

// 创建结果卡片
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
        <div class="result-info">
            <h3>${recipe.name}</h3>
            <div class="result-tags">
                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <p class="result-description">${recipe.description || '营养美味的健康食谱'}</p>
            <div class="result-nutrition">
                <span class="nutrition-badge">
                    <strong>${recipe.calories}</strong> 卡路里
                </span>
                <span class="nutrition-badge">
                    <strong>${recipe.protein}g</strong> 蛋白质
                </span>
                <span class="nutrition-badge">
                    <strong>${recipe.carbs}g</strong> 碳水
                </span>
                <span class="nutrition-badge">
                    <strong>${recipe.fat}g</strong> 脂肪
                </span>
            </div>
            <button class="view-detail-btn" onclick="viewRecipeDetail(${recipe.id})">
                查看详情
            </button>
        </div>
    `;

    return card;
}

// 查看食谱详情
function viewRecipeDetail(recipeId) {
    const recipe = searchResults.find(r => r.id === recipeId);
    if (!recipe) return;

    const modal = document.getElementById('recipeModal');
    const modalContent = document.getElementById('modalRecipeContent');

    const tags = recipe.tags ? recipe.tags.split(',').map(t => t.trim()) : [];
    const ingredients = recipe.ingredients ? 
        recipe.ingredients.split(',').map(i => i.trim()) : [];

    modalContent.innerHTML = `
        <div class="modal-header">
            <img src="${recipe.imageUrl || '../images/default-recipe.jpg'}" 
                 alt="${recipe.name}"
                 onerror="this.src='../images/default-recipe.jpg'">
            <div class="modal-title-section">
                <h2>${recipe.name}</h2>
                <div class="modal-tags">
                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="modal-meta">
                    <span>${getMealTypeText(recipe.mealType)}</span>
                    <span>${getCategoryText(recipe.category)}</span>
                </div>
            </div>
        </div>

        <div class="modal-body">
            <div class="nutrition-details">
                <h3>营养成分表</h3>
                <div class="nutrition-grid">
                    <div class="nutrition-item">
                        <div class="nutrition-label">热量</div>
                        <div class="nutrition-value">${recipe.calories} 卡</div>
                        <div class="nutrition-bar">
                            <div class="nutrition-fill" style="width: ${Math.min(recipe.calories / 10, 100)}%"></div>
                        </div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-label">蛋白质</div>
                        <div class="nutrition-value">${recipe.protein}g</div>
                        <div class="nutrition-bar">
                            <div class="nutrition-fill" style="width: ${Math.min(recipe.protein * 2, 100)}%"></div>
                        </div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-label">碳水化合物</div>
                        <div class="nutrition-value">${recipe.carbs}g</div>
                        <div class="nutrition-bar">
                            <div class="nutrition-fill" style="width: ${Math.min(recipe.carbs * 2, 100)}%"></div>
                        </div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-label">脂肪</div>
                        <div class="nutrition-value">${recipe.fat}g</div>
                        <div class="nutrition-bar">
                            <div class="nutrition-fill" style="width: ${Math.min(recipe.fat * 3, 100)}%"></div>
                        </div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-label">膳食纤维</div>
                        <div class="nutrition-value">${recipe.fiber}g</div>
                        <div class="nutrition-bar">
                            <div class="nutrition-fill" style="width: ${Math.min(recipe.fiber * 10, 100)}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="ingredients-list">
                <h3>所需食材</h3>
                <ul>
                    ${ingredients.map(ing => `<li><i class="icon">✓</i> ${ing}</li>`).join('')}
                </ul>
            </div>

            <div class="cooking-instructions">
                <h3>烹饪步骤</h3>
                <p>${recipe.instructions || '1. 准备所有食材\\n2. 按照标准烹饪方法制作\\n3. 注意火候和时间\\n4. 完成后即可享用'}</p>
            </div>

            <div class="modal-actions">
                <button class="btn-secondary" onclick="addToFavorites(${recipe.id})">
                    ❤ 收藏
                </button>
                <button class="btn-primary" onclick="addToMealPlan(${recipe.id})">
                    + 添加到计划
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// 加载相关推荐
async function loadRelatedRecommendations() {
    const container = document.getElementById('relatedRecipes');
    
    try {
        let allRecipes;
        if (window.API && window.API.recipe) {
            allRecipes = await window.API.recipe.getAll();
        } else {
            allRecipes = getDefaultRecipes();
        }

        // 随机选择3个不在搜索结果中的食谱
        const relatedRecipes = allRecipes
            .filter(r => !searchResults.find(sr => sr.id === r.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        if (relatedRecipes.length > 0) {
            container.innerHTML = '<h3>您可能还喜欢</h3>';
            relatedRecipes.forEach(recipe => {
                const item = document.createElement('div');
                item.className = 'related-item';
                item.innerHTML = `
                    <img src="${recipe.imageUrl || '../images/default-recipe.jpg'}" 
                         alt="${recipe.name}"
                         onerror="this.src='../images/default-recipe.jpg'">
                    <div class="related-info">
                        <h4>${recipe.name}</h4>
                        <p>${recipe.calories} 卡 | ${recipe.protein}g 蛋白</p>
                    </div>
                `;
                item.onclick = () => viewRecipeDetail(recipe.id);
                container.appendChild(item);
            });
        }
    } catch (error) {
        console.error('加载推荐失败:', error);
    }
}

// 添加到收藏
function addToFavorites(recipeId) {
    const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
    if (!favorites.includes(recipeId)) {
        favorites.push(recipeId);
        localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
        showMessage('已添加到收藏', 'success');
    } else {
        showMessage('已经在收藏中了', 'info');
    }
}

// 添加到计划
function addToMealPlan(recipeId) {
    const mealPlan = JSON.parse(localStorage.getItem('mealPlan') || '[]');
    const recipe = searchResults.find(r => r.id === recipeId);
    
    if (recipe) {
        mealPlan.push({
            recipeId: recipe.id,
            recipeName: recipe.name,
            date: new Date().toISOString(),
            calories: recipe.calories
        });
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        showMessage('已添加到饮食计划', 'success');
    }
}

// 辅助函数
function getMealTypeText(type) {
    const types = {
        'breakfast': '早餐',
        'lunch': '午餐',
        'dinner': '晚餐',
        'snack': '零食'
    };
    return types[type] || type;
}

function getCategoryText(category) {
    const categories = {
        'high_protein': '高蛋白',
        'low_carb': '低碳水',
        'low_fat': '低脂',
        'vegetarian': '素食',
        'vegan': '纯素',
        'balanced': '均衡'
    };
    return categories[category] || category;
}

function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = 'message ' + type;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// 默认食谱数据
function getDefaultRecipes() {
    return [
        {
            id: 1,
            name: '烤鸡胸配蔬菜',
            calories: 350,
            protein: 45,
            carbs: 20,
            fat: 10,
            fiber: 5,
            mealType: 'lunch',
            category: 'high_protein',
            tags: '高蛋白,低脂,健康',
            ingredients: '鸡胸肉200g,西兰花100g,胡萝卜50g,橄榄油5ml',
            description: '简单健康的高蛋白餐',
            imageUrl: ''
        },
        {
            id: 2,
            name: '燕麦粥配水果',
            calories: 280,
            protein: 10,
            carbs: 50,
            fat: 5,
            fiber: 8,
            mealType: 'breakfast',
            category: 'balanced',
            tags: '早餐,高纤维,健康',
            ingredients: '燕麦50g,牛奶200ml,香蕉1根,蓝莓50g',
            description: '营养均衡的早餐选择',
            imageUrl: ''
        },
        {
            id: 3,
            name: '三文鱼沙拉',
            calories: 400,
            protein: 35,
            carbs: 15,
            fat: 25,
            fiber: 6,
            mealType: 'dinner',
            category: 'low_carb',
            tags: '低碳水,高蛋白,Omega-3',
            ingredients: '三文鱼150g,生菜100g,番茄50g,橄榄油10ml',
            description: '富含优质脂肪的健康晚餐',
            imageUrl: ''
        },
        {
            id: 4,
            name: '全麦三明治',
            calories: 320,
            protein: 18,
            carbs: 42,
            fat: 8,
            fiber: 7,
            mealType: 'breakfast',
            category: 'balanced',
            tags: '早餐,全谷物,便携',
            ingredients: '全麦面包2片,鸡蛋1个,生菜,番茄',
            description: '快速简便的营养早餐',
            imageUrl: ''
        },
        {
            id: 5,
            name: '豆腐蔬菜炒',
            calories: 260,
            protein: 20,
            carbs: 25,
            fat: 12,
            fiber: 6,
            mealType: 'dinner',
            category: 'vegetarian',
            tags: '素食,高蛋白,低卡',
            ingredients: '豆腐200g,各类蔬菜,酱油,姜蒜',
            description: '健康的素食选择',
            imageUrl: ''
        }
    ];
}

// 暴露到全局作用域
window.viewRecipeDetail = viewRecipeDetail;
window.addToFavorites = addToFavorites;
window.addToMealPlan = addToMealPlan;
