// 个人档案页面JavaScript

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    initProfilePage();
});

// 初始化页面
function initProfilePage() {
    const form = document.getElementById('profileForm');
    const loadBtn = document.getElementById('loadBtn');
    const viewDashboardBtn = document.getElementById('viewDashboardBtn');
    const userIdInput = document.getElementById('userId');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');

    // 表单提交事件
    form.addEventListener('submit', handleSubmit);

    // 加载档案按钮
    loadBtn.addEventListener('click', loadProfile);

    // 查看仪表盘按钮
    viewDashboardBtn.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    // 监听身高体重变化，实时计算BMI
    heightInput.addEventListener('input', updateBMIPreview);
    weightInput.addEventListener('input', updateBMIPreview);

    // 尝试从localStorage加载userId
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
        userIdInput.value = savedUserId;
        loadProfile();
    }
    
    // 显示系统状态
    checkSystemStatus();
}

// 检查系统状态
function checkSystemStatus() {
    console.log('=== 档案系统状态检查 ===');
    
    // 检查本地存储
    try {
        const testKey = 'test_storage';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        console.log('✅ 本地存储可用');
    } catch (error) {
        console.error('❌ 本地存储不可用:', error);
    }
    
    // 检查API
    if (window.API && window.API.healthProfile) {
        console.log('✅ API客户端已加载');
    } else {
        console.log('⚠️  API客户端未加载，将使用本地存储');
    }
    
    // 检查现有档案
    const profiles = JSON.parse(localStorage.getItem('healthProfiles') || '{}');
    const profileCount = Object.keys(profiles).length;
    console.log(`📁 本地存储中有 ${profileCount} 个档案`);
    
    console.log('=== 状态检查完成 ===');
}

// 处理表单提交
async function handleSubmit(e) {
    e.preventDefault();

    const formData = getFormData();
    
    // 表单验证
    if (!validateForm(formData)) {
        return;
    }

    try {
        showMessage('正在保存档案...', 'info');
        
        let saveSuccess = false;
        
        // 优先尝试后端API
        if (window.API && window.API.healthProfile) {
            try {
                await window.API.healthProfile.createOrUpdate(formData);
                saveSuccess = true;
                console.log('档案已保存到后端');
            } catch (error) {
                console.warn('后端保存失败，尝试本地保存:', error);
            }
        }
        
        // 如果后端失败或不可用，使用本地存储作为备份
        if (!saveSuccess) {
            saveToLocalStorage(formData);
            saveSuccess = true;
            console.log('档案已保存到本地存储');
        }

        if (saveSuccess) {
            // 保存当前用户ID
            localStorage.setItem('currentUserId', formData.userId);

            showMessage('档案保存成功！', 'success');
            
            // 更新BMI预览
            updateBMIPreview();

            // 2秒后跳转到仪表盘
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            throw new Error('所有保存方式都失败了');
        }

    } catch (error) {
        console.error('保存档案失败:', error);
        showMessage('保存失败: ' + (error.message || '未知错误'), 'error');
    }
}

// 加载档案
async function loadProfile() {
    const userId = document.getElementById('userId').value.trim();

    if (!userId) {
        showMessage('请先输入用户ID', 'error');
        return;
    }

    try {
        showMessage('正在加载档案...', 'info');

        let profile = null;
        
        // 优先尝试从后端加载
        if (window.API && window.API.healthProfile) {
            try {
                profile = await window.API.healthProfile.getByUserId(userId);
                if (profile) {
                    console.log('从后端加载档案成功');
                }
            } catch (error) {
                console.warn('后端加载失败，尝试本地加载:', error);
            }
        }
        
        // 如果后端没有数据，尝试从本地存储加载
        if (!profile) {
            profile = loadFromLocalStorage(userId);
            if (profile) {
                console.log('从本地存储加载档案成功');
            }
        }

        if (profile) {
            fillForm(profile);
            showMessage('档案加载成功！', 'success');
            updateBMIPreview();
            
            // 隐藏成功消息
            setTimeout(() => {
                document.getElementById('message').style.display = 'none';
            }, 2000);
        } else {
            showMessage('未找到该用户的档案，请创建新档案', 'error');
        }

    } catch (error) {
        console.error('加载档案失败:', error);
        showMessage('加载失败: ' + (error.message || '未知错误'), 'error');
    }
}

// 获取表单数据
function getFormData() {
    return {
        userId: document.getElementById('userId').value.trim(),
        age: parseInt(document.getElementById('age').value) || null,
        gender: document.getElementById('gender').value,
        height: parseFloat(document.getElementById('height').value) || null,
        weight: parseFloat(document.getElementById('weight').value) || null,
        healthGoal: document.getElementById('healthGoal').value,
        activityLevel: document.getElementById('activityLevel').value,
        dietaryRestrictions: document.getElementById('dietaryRestrictions').value.trim(),
        allergies: document.getElementById('allergies').value.trim()
    };
}

// 填充表单
function fillForm(profile) {
    document.getElementById('userId').value = profile.userId || '';
    document.getElementById('age').value = profile.age || '';
    document.getElementById('gender').value = profile.gender || '';
    document.getElementById('height').value = profile.height || '';
    document.getElementById('weight').value = profile.weight || '';
    document.getElementById('healthGoal').value = profile.healthGoal || '';
    document.getElementById('activityLevel').value = profile.activityLevel || '';
    document.getElementById('dietaryRestrictions').value = profile.dietaryRestrictions || '';
    document.getElementById('allergies').value = profile.allergies || '';
}

// 表单验证
function validateForm(data) {
    const errors = [];
    
    if (!data.userId || data.userId.length < 2) {
        errors.push('请输入用效的用户ID (至少2个字符)');
    }

    if (!data.age || data.age < 1 || data.age > 120) {
        errors.push('请输入有效的年龄 (1-120岁)');
    }

    if (!data.gender) {
        errors.push('请选择性别');
    }

    if (!data.height || data.height < 50 || data.height > 250) {
        errors.push('请输入有效的身高 (50-250厘米)');
    }

    if (!data.weight || data.weight < 20 || data.weight > 300) {
        errors.push('请输入有效的体重 (20-300公斤)');
    }

    if (!data.healthGoal) {
        errors.push('请选择健康目标');
    }

    if (!data.activityLevel) {
        errors.push('请选择活动水平');
    }

    if (errors.length > 0) {
        showMessage(errors.join('；'), 'error');
        return false;
    }

    return true;
}

// 更新BMI预览
function updateBMIPreview() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);

    if (height && weight && height > 0) {
        const bmi = calculateBMI(weight, height);
        const status = getBMIStatus(bmi);

        document.getElementById('currentBMI').textContent = bmi.toFixed(1);
        document.getElementById('bmiStatus').textContent = status;
        document.getElementById('bmiPreview').style.display = 'block';
    } else {
        document.getElementById('bmiPreview').style.display = 'none';
    }
}

// 计算BMI
function calculateBMI(weight, height) {
    return weight / Math.pow(height / 100, 2);
}

// 获取BMI状态
function getBMIStatus(bmi) {
    if (bmi < 18.5) return '偏瘦';
    if (bmi < 25) return '正常';
    if (bmi < 30) return '超重';
    return '肥胖';
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';

    // 3秒后自动隐藏（除非是成功消息）
    if (type !== 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// 本地存储操作
function saveToLocalStorage(data) {
    try {
        const profiles = JSON.parse(localStorage.getItem('healthProfiles') || '{}');
        const profileData = {
            ...data,
            bmi: calculateBMI(data.weight, data.height),
            createdAt: profiles[data.userId]?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        profiles[data.userId] = profileData;
        localStorage.setItem('healthProfiles', JSON.stringify(profiles));
        
        console.log('档案已保存到本地存储:', profileData);
        return profileData;
    } catch (error) {
        console.error('本地存储保存失败:', error);
        throw new Error('本地存储保存失败: ' + error.message);
    }
}

function loadFromLocalStorage(userId) {
    try {
        const profiles = JSON.parse(localStorage.getItem('healthProfiles') || '{}');
        const profile = profiles[userId] || null;
        console.log('从本地存储加载档案:', profile ? '成功' : '未找到');
        return profile;
    } catch (error) {
        console.error('本地存储加载失败:', error);
        return null;
    }
}
