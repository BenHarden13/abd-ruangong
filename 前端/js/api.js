// API配置和工具函数
const API_BASE_URL = 'http://localhost:8080/api';

// API请求工具类
class ApiClient {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            // 如果响应不是JSON，返回文本
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${text}`);
                }
                return text;
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // GET请求
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST请求
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PUT请求
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE请求
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// 健康档案API
class HealthProfileApi extends ApiClient {
    // 创建或更新健康档案
    async createOrUpdate(profileData) {
        return this.post('/health-profiles', profileData);
    }

    // 根据用户ID获取健康档案
    async getByUserId(userId) {
        return this.get(`/health-profiles/user/${userId}`);
    }

    // 获取所有健康档案
    async getAllProfiles() {
        return this.get('/health-profiles');
    }

    // 根据ID获取健康档案
    async getProfileById(id) {
        return this.get(`/health-profiles/${id}`);
    }

    // 更新健康档案
    async updateProfile(id, profileData) {
        return this.put(`/health-profiles/${id}`, profileData);
    }

    // 删除健康档案
    async deleteProfile(id) {
        return this.delete(`/health-profiles/${id}`);
    }

    // 搜索健康档案
    async searchProfiles(name) {
        return this.get(`/health-profiles/search?name=${encodeURIComponent(name)}`);
    }
}

// 食谱API
class RecipeApi extends ApiClient {
    // 获取所有食谱
    async getAll() {
        return this.get('/recipes');
    }

    // 根据ID获取食谱
    async getById(id) {
        return this.get(`/recipes/${id}`);
    }

    // 根据餐型获取食谱
    async getByMealType(mealType) {
        return this.get(`/recipes/meal-type/${mealType}`);
    }

    // 根据类别获取食谱
    async getByCategory(category) {
        return this.get(`/recipes/category/${category}`);
    }

    // 搜索食谱
    async search(keyword) {
        return this.get(`/recipes/search?name=${encodeURIComponent(keyword)}`);
    }

    // 根据热量范围获取食谱
    async getByCaloriesRange(minCalories, maxCalories) {
        return this.get(`/recipes/calories?min=${minCalories}&max=${maxCalories}`);
    }

    // 获取高蛋白食谱
    async getHighProtein(minProtein = 20) {
        return this.get(`/recipes/high-protein?min=${minProtein}`);
    }

    // 创建食谱
    async create(recipeData) {
        return this.post('/recipes', recipeData);
    }

    // 获取推荐食谱（基于用户档案）
    async getRecommendations(userId) {
        if (userId) {
            return this.get(`/recipes/recommendations/${userId}`);
        }
        return this.getAll();
    }
}

// 数据存储工具
class DataStore {
    // 保存到localStorage
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }

    // 从localStorage读取
    static load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Failed to load data:', error);
            return defaultValue;
        }
    }

    // 删除localStorage数据
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to remove data:', error);
        }
    }

    // 清空所有数据
    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Failed to clear data:', error);
        }
    }
}

// 创建API实例
const healthProfileApi = new HealthProfileApi();
const recipeApi = new RecipeApi();

// 导出API和工具
window.API = {
    healthProfile: healthProfileApi,
    recipe: recipeApi,
    DataStore: DataStore,
    BASE_URL: API_BASE_URL
};

// 在控制台中显示API连接状态
console.log('DietHub API Client initialized');
console.log('Backend URL:', API_BASE_URL);

// 测试后端连接
async function testBackendConnection() {
    try {
        await recipeApi.get('/health-check');
        console.log('✅ 后端连接正常');
        return true;
    } catch (error) {
        console.warn('⚠️  后端连接失败，使用本地数据模式');
        console.error(error.message);
        return false;
    }
}

// 页面加载时测试连接
if (typeof window !== 'undefined') {
    window.addEventListener('load', testBackendConnection);
}