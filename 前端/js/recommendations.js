// 食谱推荐页面JavaScript

let allRecipes = [];
let filteredRecipes = [];
let currentFilters = {
    mealType: '',
    category: '',
    maxCalories: '',
    search: ''
};

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    initRecommendations();
});

// 初始化推荐页面
async function initRecommendations() {
    console.log('=== 初始化饮食推荐页面 ===');
    
    // 初始化骨架屏
    if (window.StaggeredAnimation) {
        StaggeredAnimation.initSkeletons();
    }
    
    // 加载用户档案
    const userId = localStorage.getItem('currentUserId');
    console.log('当前用户ID:', userId);
    let userProfile = null;

    if (userId) {
        try {
            if (window.API && window.API.healthProfile) {
                userProfile = await window.API.healthProfile.getByUserId(userId);
            } else {
                userProfile = loadProfileFromLocalStorage(userId);
            }
        } catch (error) {
            console.error('加载用户档案失败:', error);
        }
    }

    // 显示用户信息
    if (userProfile) {
        displayUserInfo(userProfile);
    }

    // 加载食谱
    await loadRecipes();

    // 设置事件监听器
    setupEventListeners();
    
    // 为交互元素添加观察者，当滚动到视图中时触发动画
    if ('IntersectionObserver' in window && window.StaggeredAnimation) {
        // 创建标签元素的交叉观察器
        StaggeredAnimation.createScrollObserver('.tag');
        // 观察可能需要滚动才能看到的元素
        StaggeredAnimation.createScrollObserver('.info-box');
    }
}

// 显示用户信息
function displayUserInfo(profile) {
    const userInfoDiv = document.getElementById('userInfo');
    if (userInfoDiv) {
        const bmr = calculateBMR(profile);
        const tdee = calculateTDEE(bmr, profile.activityLevel);
        const targetCalories = calculateTargetCalories(tdee, profile.healthGoal);

        userInfoDiv.innerHTML = `
            <p><strong>用户:</strong> ${profile.userId}</p>
            <p><strong>健康目标:</strong> ${getHealthGoalText(profile.healthGoal)}</p>
            <p><strong>建议每日摄入:</strong> ${Math.round(targetCalories)} 卡路里</p>
        `;
    }
}

// 加载食谱
async function loadRecipes() {
    try {
        console.log('开始加载食谱...');
        showMessage('正在加载食谱...', 'info');

        let recipesLoaded = false;
        
        // 优先尝试从后端加载
        if (window.API && window.API.recipe) {
            try {
                console.log('尝试从后端加载食谱...');
                allRecipes = await window.API.recipe.getAll();
                if (allRecipes && allRecipes.length > 0) {
                    console.log(`✅ 从后端加载了 ${allRecipes.length} 个食谱`);
                    recipesLoaded = true;
                }
            } catch (error) {
                console.warn('后端加载食谱失败:', error);
            }
        }
        
        // 如果后端加载失败，使用默认数据
        if (!recipesLoaded) {
            console.log('使用默认食谱数据...');
            allRecipes = getDefaultRecipes();
            console.log(`✅ 加载了 ${allRecipes.length} 个默认食谱`);
        }

        filteredRecipes = [...allRecipes];
        renderRecipes();
        
        showMessage(`已加载 ${allRecipes.length} 个食谱`, 'success');

        setTimeout(() => {
            const messageDiv = document.getElementById('message');
            if (messageDiv) {
                messageDiv.style.display = 'none';
            }
        }, 2000);

    } catch (error) {
        console.error('加载食谱出现异常:', error);
        
        // 确保至少有默认数据
        allRecipes = getDefaultRecipes();
        filteredRecipes = [...allRecipes];
        renderRecipes();
        
        showMessage(`使用离线数据，已加载 ${allRecipes.length} 个食谱`, 'warning');
    }
}

// 设置事件监听器
function setupEventListeners() {
    console.log('设置事件监听器...');
    
    // 餐食类型筛选
    const mealTypeFilter = document.getElementById('mealTypeFilter');
    if (mealTypeFilter) {
        mealTypeFilter.addEventListener('change', (e) => {
            currentFilters.mealType = e.target.value;
            applyFilters();
        });
    }

    // 类别筛选
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            applyFilters();
        });
    }

    // 卡路里筛选
    const caloriesFilter = document.getElementById('caloriesFilter');
    if (caloriesFilter) {
        caloriesFilter.addEventListener('change', (e) => {
            currentFilters.maxCalories = e.target.value;
            applyFilters();
        });
    }

    // 搜索框
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilters.search = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    // 搜索按钮
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            applyFilters();
        });
    }

    // 重置筛选按钮
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', clearFilters);
    }

    // 快速筛选标签
    const quickTags = document.querySelectorAll('.tag[data-tag]');
    quickTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            const tagValue = e.target.getAttribute('data-tag');
            currentFilters.search = tagValue;
            if (searchInput) {
                searchInput.value = tagValue;
            }
            applyFilters();
        });
    });

    // 模态框关闭按钮
    const modal = document.getElementById('recipeModal');
    const closeBtn = document.querySelector('.close');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // 点击模态框外部关闭
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    console.log('✅ 事件监听器设置完成');
}

// 应用筛选
function applyFilters() {
    console.log('应用筛选:', currentFilters);
    
    filteredRecipes = allRecipes.filter(recipe => {
        // 餐食类型筛选
        if (currentFilters.mealType && currentFilters.mealType !== '' && recipe.mealType !== currentFilters.mealType) {
            return false;
        }

        // 类别筛选
        if (currentFilters.category && currentFilters.category !== '' && recipe.category !== currentFilters.category) {
            return false;
        }

        // 卡路里筛选
        if (currentFilters.maxCalories && currentFilters.maxCalories !== '') {
            const range = currentFilters.maxCalories;
            if (range === '0-200' && recipe.calories > 200) return false;
            if (range === '200-400' && (recipe.calories < 200 || recipe.calories > 400)) return false;
            if (range === '400-600' && (recipe.calories < 400 || recipe.calories > 600)) return false;
            if (range === '600+' && recipe.calories < 600) return false;
        }

        // 搜索筛选
        if (currentFilters.search && currentFilters.search.trim() !== '') {
            const searchTerm = currentFilters.search.toLowerCase().trim();
            const nameMatch = recipe.name && recipe.name.toLowerCase().includes(searchTerm);
            const ingredientsMatch = recipe.ingredients && 
                recipe.ingredients.toLowerCase().includes(searchTerm);
            const tagsMatch = recipe.tags && 
                recipe.tags.toLowerCase().includes(searchTerm);
            const descMatch = recipe.description && 
                recipe.description.toLowerCase().includes(searchTerm);
            
            if (!nameMatch && !ingredientsMatch && !tagsMatch && !descMatch) {
                return false;
            }
        }

        return true;
    });

    console.log(`筛选结果: ${filteredRecipes.length} / ${allRecipes.length} 个食谱`);
    renderRecipes();
}

// 清除筛选
function clearFilters() {
    currentFilters = {
        mealType: '',
        category: '',
        maxCalories: '',
        search: ''
    };

    document.getElementById('mealTypeFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('caloriesFilter').value = '';
    document.getElementById('searchInput').value = '';

    filteredRecipes = [...allRecipes];
    renderRecipes();
}

// 渲染食谱列表
function renderRecipes() {
    const container = document.getElementById('recipesGrid');
    container.innerHTML = '';
    
    // 隐藏骨架屏，显示实际内容
    setTimeout(() => {
        // 给骨架屏一点时间来展示，提升用户体验
        if (window.StaggeredAnimation) {
            StaggeredAnimation.hideSkeletons();
        }
    }, 800);

    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
        resultCount.textContent = `找到 ${filteredRecipes.length} 个食谱`;
    }

    const noResults = document.getElementById('noResults');
    if (filteredRecipes.length === 0) {
        container.innerHTML = '';
        if (noResults) {
            noResults.style.display = 'block';
        }
        return;
    } else {
        if (noResults) {
            noResults.style.display = 'none';
        }
    }

    // 创建所有卡片
    filteredRecipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        // 给卡片添加类以便动画控制
        card.classList.add('staggered-fade-in');
        container.appendChild(card);
    });
    
    // 应用交错动画效果
    const cards = container.querySelectorAll('.staggered-fade-in');
    if (window.StaggeredAnimation) {
        StaggeredAnimation.animateCards(cards);
    } else {
        // 如果没有动画库，直接显示卡片
        cards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }
}

// 创建食谱卡片
function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card shadow-soft';

    // 解析标签
    const tags = recipe.tags ? recipe.tags.split(',').map(t => t.trim()) : [];

    card.innerHTML = `
        <div class="recipe-image">
            <img src="${recipe.imageUrl || '../images/default-recipe.jpg'}" 
                 alt="${recipe.name}" 
                 onerror="this.src='../images/default-recipe.jpg'">
        </div>
        <div class="recipe-info">
            <h3>${recipe.name}</h3>
            <div class="recipe-tags">
                ${tags.map(tag => `<span class="tag shadow-soft">${tag}</span>`).join('')}
            </div>
            <div class="recipe-stats">
                <span><i class="icon">🔥</i> ${recipe.calories} 卡</span>
                <span><i class="icon">🥩</i> ${recipe.protein}g 蛋白</span>
            </div>
            <p class="recipe-description">${recipe.description || '美味健康的食谱选择'}</p>
            <button class="view-detail-btn btn btn-primary" onclick="viewRecipeDetail(${recipe.id})">查看详情</button>
        </div>
    `;

    return card;
}

// 查看食谱详情
function viewRecipeDetail(recipeId) {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    // 清除之前的元信息，避免重复添加
    const existingMeta = document.querySelector('.recipe-meta');
    if (existingMeta) {
        existingMeta.remove();
    }

    const modal = document.getElementById('recipeModal');
    
    // 设置模态框中的食谱信息
    document.getElementById('modalRecipeName').textContent = recipe.name;
    document.getElementById('modalDescription').textContent = recipe.description || '美味健康的食谱选择';
    document.getElementById('modalCalories').textContent = `${recipe.calories} 卡`;
    document.getElementById('modalPrepTime').textContent = recipe.prepTime || '30分钟';
    document.getElementById('modalDifficulty').textContent = recipe.difficulty || '简单';
    document.getElementById('modalProtein').textContent = `${recipe.protein}g`;
    document.getElementById('modalCarbs').textContent = `${recipe.carbs}g`;
    document.getElementById('modalFat').textContent = `${recipe.fat}g`;
    
    // 解析标签和配料
    const tags = recipe.tags ? recipe.tags.split(',').map(t => t.trim()) : [];
    const ingredients = recipe.ingredients ? 
        recipe.ingredients.split(',').map(i => i.trim()) : [];
    const instructions = recipe.instructions ? 
        recipe.instructions.split('.').filter(s => s.trim()) : [];
    
    // 设置标签
    const tagsContainer = document.getElementById('modalRecipeTags');
    tagsContainer.innerHTML = tags.map(tag => `<span class="tag shadow-soft">${tag}</span>`).join('');
    
    // 设置食材列表
    const ingredientsList = document.getElementById('modalIngredients');
    ingredientsList.innerHTML = ingredients.map(ing => `<li>${ing}</li>`).join('');
    
    // 设置步骤列表
    const instructionsList = document.getElementById('modalInstructions');
    instructionsList.innerHTML = instructions.map(step => `<li>${step.trim()}.</li>`).join('');
    
    // 添加餐食类型和分类信息
    const recipeMetaInfo = document.createElement('div');
    recipeMetaInfo.className = 'recipe-meta animate-fadeInUp delay-500';
    recipeMetaInfo.innerHTML = `
        <p><strong>餐食类型:</strong> ${getMealTypeText(recipe.mealType)}</p>
        <p><strong>类别:</strong> ${getCategoryText(recipe.category)}</p>
    `;
    document.querySelector('.modal-body').appendChild(recipeMetaInfo);
    
    // 显示模态框
    modal.style.display = 'block';
    
    // 应用交错动画到食材列表和步骤列表
    setTimeout(() => {
        if (window.StaggeredAnimation) {
            StaggeredAnimation.animateList(ingredientsList);
            StaggeredAnimation.animateList(instructionsList, 80);
        }
    }, 500);
}

// 辅助函数
function calculateBMR(profile) {
    const { weight, height, age, gender } = profile;
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}

function calculateTDEE(bmr, activityLevel) {
    const multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    };
    return bmr * (multipliers[activityLevel] || 1.2);
}

function calculateTargetCalories(tdee, healthGoal) {
    switch (healthGoal) {
        case 'lose_weight': return tdee - 500;
        case 'gain_weight': return tdee + 500;
        default: return tdee;
    }
}

function getHealthGoalText(goal) {
    const goals = {
        'lose_weight': '减重',
        'gain_weight': '增重',
        'maintain_weight': '维持体重',
        'build_muscle': '增肌'
    };
    return goals[goal] || goal;
}

// 这些函数在模态框的设置信息时会用到
// 在viewRecipeDetail函数中添加相关使用
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

function loadProfileFromLocalStorage(userId) {
    const profiles = JSON.parse(localStorage.getItem('healthProfiles') || '{}');
    return profiles[userId] || null;
}

function showMessage(message, type = 'info') {
    console.log(`消息 [${type}]:`, message);
    
    // 尝试多个可能的消息容器ID
    const possibleIds = ['message', 'loadingSpinner', 'systemMessage'];
    let messageDiv = null;
    
    for (const id of possibleIds) {
        messageDiv = document.getElementById(id);
        if (messageDiv) break;
    }
    
    // 如果没有找到现有的消息容器，创建一个
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'message';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
        `;
        document.body.appendChild(messageDiv);
    }
    
    messageDiv.textContent = message;
    messageDiv.className = 'message ' + type;
    
    // 设置样式
    const styles = {
        'info': 'background: #17a2b8;',
        'success': 'background: #28a745;',
        'warning': 'background: #ffc107; color: #212529;',
        'error': 'background: #dc3545;'
    };
    
    messageDiv.style.cssText += styles[type] || styles['info'];
    messageDiv.style.display = 'block';
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
            mealType: '午餐',
            category: 'Salad',
            tags: '高蛋白,低脂,健康',
            ingredients: '鸡胸肉200g,西兰花100g,胡萝卜50g,橄榄油5ml',
            description: '简单健康的高蛋白餐',
            instructions: '1. 烤箱预热至200度. 2. 鸡胸肉用盐和胡椒腌制. 3. 蔬菜切块用橄榄油拌匀. 4. 烤制25分钟至熟透',
            prepTime: '30分钟',
            difficulty: '简单',
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
            mealType: '早餐',
            category: 'Bowl',
            tags: '早餐,高纤维,健康',
            ingredients: '燕麦50g,牛奶200ml,香蕉1根,蓝莓50g,蜂蜜10g',
            description: '营养均衡的早餐选择',
            instructions: '1. 燕麦加牛奶煮制5分钟. 2. 香蕉切片. 3. 盛碗后加入水果和蜂蜜',
            prepTime: '10分钟',
            difficulty: '简单',
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
            mealType: '晚餐',
            category: 'Salad',
            tags: '低碳水,高蛋白,Omega-3',
            ingredients: '三文鱼150g,生菜100g,番茄50g,黄瓜50g,橄榄油10ml,柠檬汁5ml',
            description: '富含优质脂肪的健康晚餐',
            instructions: '1. 三文鱼煎制至两面金黄. 2. 蔬菜洗净切块. 3. 用橄榄油和柠檬汁调味',
            prepTime: '15分钟',
            difficulty: '简单',
            imageUrl: ''
        },
        {
            id: 4,
            name: '蔬菜蛋白碗',
            calories: 320,
            protein: 28,
            carbs: 35,
            fat: 8,
            fiber: 12,
            mealType: '午餐',
            category: 'Bowl',
            tags: '素食,高纤维,低脂',
            ingredients: '豆腐150g,糙米50g,菠菜100g,胡萝卜50g,芝麻酱15g',
            description: '营养丰富的素食选择',
            instructions: '1. 糙米蒸煮20分钟. 2. 豆腐煎制金黄. 3. 蔬菜焯水调味. 4. 组合摆盘',
            prepTime: '25分钟',
            difficulty: '简单',
            imageUrl: ''
        },
        {
            id: 5,
            name: '鸡蛋蔬菜汤',
            calories: 180,
            protein: 15,
            carbs: 12,
            fat: 8,
            fiber: 4,
            mealType: '加餐',
            category: 'Soup',
            tags: '低热量,营养,暖胃',
            ingredients: '鸡蛋2个,西红柿1个,黄瓜50g,香葱10g,盐适量',
            description: '清淡营养的汤品',
            instructions: '1. 西红柿切块炒出汁. 2. 加水煮开. 3. 打入蛋花. 4. 加入黄瓜丝和调料',
            prepTime: '10分钟',
            difficulty: '简单',
            imageUrl: ''
        },
        {
            id: 6,
            name: '牛肉炒饭',
            calories: 520,
            protein: 32,
            carbs: 48,
            fat: 22,
            fiber: 3,
            mealType: '晚餐',
            category: 'Main Course',
            tags: '高蛋白,主食,饱腹',
            ingredients: '牛肉丝150g,米饭150g,洋葱50g,豌豆50g,鸡蛋1个,生抽15ml',
            description: '营养丰富的主食选择',
            instructions: '1. 牛肉丝腌制入味. 2. 热锅炒制牛肉. 3. 加入蔬菜和米饭翻炒. 4. 调味出锅',
            prepTime: '20分钟',
            difficulty: '中等',
            imageUrl: ''
        }
    ];
}

// 暴露到全局作用域
window.viewRecipeDetail = viewRecipeDetail;
