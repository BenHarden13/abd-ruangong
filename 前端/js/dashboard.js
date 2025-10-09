// 健康仪表盘JavaScript

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== 仪表盘页面加载 ===');
    checkDashboardElements();
    initDashboard();
});

// 检查仪表盘页面必要的元素
function checkDashboardElements() {
    const requiredElements = [
        'userName', 'userAge', 'userGender', 'userHeight', 'userWeight',
        'bmiValue', 'bmiStatus', 'bmrValue', 'tdeeValue', 'targetCalories'
    ];
    
    const missingElements = [];
    
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            missingElements.push(id);
        }
    });
    
    if (missingElements.length > 0) {
        console.warn('页面缺少以下元素:', missingElements);
    } else {
        console.log('✅ 页面元素检查完成');
    }
}

// 初始化仪表盘
async function initDashboard() {
    const userId = localStorage.getItem('currentUserId');

    console.log('=== 仪表盘初始化 ===');
    console.log('当前用户ID:', userId);

    if (!userId) {
        showMessage('未找到用户档案，请先创建档案', 'error');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 2000);
        return;
    }

    try {
        showMessage('正在加载数据...', 'info');

        let profile = null;
        
        // 优先尝试从后端加载
        if (window.API && window.API.healthProfile) {
            try {
                console.log('尝试从后端加载档案...');
                profile = await window.API.healthProfile.getByUserId(userId);
                if (profile) {
                    console.log('✅ 从后端加载档案成功:', profile);
                }
            } catch (error) {
                console.warn('后端加载失败，尝试本地存储:', error);
            }
        }
        
        // 如果后端加载失败，尝试从本地存储加载
        if (!profile) {
            console.log('尝试从本地存储加载档案...');
            profile = loadFromLocalStorage(userId);
            if (profile) {
                console.log('✅ 从本地存储加载档案成功:', profile);
            } else {
                console.error('❌ 本地存储也没有找到档案');
            }
        }

        if (!profile) {
            console.log('所有档案数据:', JSON.parse(localStorage.getItem('healthProfiles') || '{}'));
            showMessage('未找到档案数据，请重新创建档案', 'error');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 3000);
            return;
        }

        // 渲染仪表盘
        console.log('开始渲染仪表盘...');
        renderDashboard(profile);
        showMessage('数据加载完成', 'success');

        // 1秒后隐藏消息
        setTimeout(() => {
            const messageDiv = document.getElementById('message');
            if (messageDiv) {
                messageDiv.style.display = 'none';
            }
        }, 1000);

    } catch (error) {
        console.error('加载仪表盘失败:', error);
        showMessage('加载失败: ' + (error.message || '未知错误'), 'error');
    }

    // 编辑档案按钮
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }

    // 查看推荐按钮
    const viewBtn = document.getElementById('viewRecommendationsBtn');
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            window.location.href = 'recommendations.html';
        });
    }
}

// 渲染仪表盘
function renderDashboard(profile) {
    console.log('渲染仪表盘数据:', profile);
    
    try {
        // 渲染用户信息
        renderUserInfo(profile);

        // 渲染健康指标
        renderHealthMetrics(profile);

        // 渲染营养需求
        renderNutritionNeeds(profile);

        // 渲染建议卡片
        renderAdviceCards(profile);
        
        console.log('✅ 仪表盘渲染完成');
    } catch (error) {
        console.error('❌ 渲染仪表盘时出错:', error);
        showMessage('渲染数据时出错: ' + error.message, 'error');
    }
}

// 渲染用户信息
function renderUserInfo(profile) {
    console.log('渲染用户信息...');
    
    const setTextContent = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || '未设置';
        } else {
            console.warn(`未找到元素: ${id}`);
        }
    };
    
    setTextContent('userName', profile.userId);
    setTextContent('userAge', profile.age ? `${profile.age}岁` : '未设置');
    setTextContent('userGender', getGenderText(profile.gender));
    setTextContent('userHeight', profile.height ? `${profile.height} cm` : '未设置');
    setTextContent('userWeight', profile.weight ? `${profile.weight} kg` : '未设置');
    setTextContent('userActivity', getActivityText(profile.activityLevel));
    setTextContent('userGoal', getHealthGoalText(profile.healthGoal));
    
    console.log('✅ 用户信息渲染完成');
}

// 渲染健康指标
function renderHealthMetrics(profile) {
    console.log('渲染健康指标...');
    
    if (!profile.weight || !profile.height) {
        console.warn('缺少身高或体重数据');
        showMessage('缺少身高或体重数据，无法计算健康指标', 'warning');
        return;
    }
    
    // BMI
    const bmi = profile.bmi || calculateBMI(profile.weight, profile.height);
    const bmiStatus = getBMIStatus(bmi);
    
    console.log('计算的BMI:', bmi, '状态:', bmiStatus);
    
    // 使用CountUpEffect来创建动态数字效果
    const bmiElement = document.getElementById('bmiValue');
    const bmiStatusElement = document.getElementById('bmiStatus');
    
    if (bmiElement) {
        if (window.CountUpEffect) {
            new CountUpEffect({
                end: parseFloat(bmi.toFixed(1)),
                duration: 1500,
                decimals: 1,
                element: bmiElement
            });
        } else {
            bmiElement.textContent = bmi.toFixed(1);
        }
    }
    
    if (bmiStatusElement) {
        bmiStatusElement.textContent = bmiStatus;
    }
    
    // 高亮当前BMI范围
    highlightBmiRange(bmi);

    // BMR (基础代谢率)
    const bmr = calculateBMR(profile);
    if (window.CountUpEffect) {
        new CountUpEffect({
            end: Math.round(bmr),
            duration: 1800,
            element: document.getElementById('bmrValue')
        });
    } else {
        document.getElementById('bmrValue').textContent = Math.round(bmr);
    }

    // TDEE (每日总能量消耗)
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    if (window.CountUpEffect) {
        new CountUpEffect({
            end: Math.round(tdee),
            duration: 2000,
            element: document.getElementById('tdeeValue')
        });
    } else {
        document.getElementById('tdeeValue').textContent = Math.round(tdee);
    }

    // 目标卡路里
    const targetCalories = calculateTargetCalories(tdee, profile.healthGoal);
    if (window.CountUpEffect) {
        new CountUpEffect({
            end: Math.round(targetCalories),
            duration: 2200,
            element: document.getElementById('targetCalories')
        });
    } else {
        document.getElementById('targetCalories').textContent = Math.round(targetCalories);
    }
    
    // 总卡路里显示
    if (document.getElementById('totalCalories')) {
        if (window.CountUpEffect) {
            new CountUpEffect({
                end: Math.round(targetCalories),
                duration: 2500,
                element: document.getElementById('totalCalories')
            });
        } else {
            document.getElementById('totalCalories').textContent = Math.round(targetCalories);
        }
    }
}

// 高亮当前BMI范围
function highlightBmiRange(bmi) {
    setTimeout(() => {
        const ranges = document.querySelectorAll('.bmi-range');
        let userRange;
        
        if (bmi < 18.5) {
            userRange = 'underweight';
        } else if (bmi < 25) {
            userRange = 'normal';
        } else if (bmi < 30) {
            userRange = 'overweight';
        } else {
            userRange = 'obese';
        }
        
        ranges.forEach(range => {
            if (range.getAttribute('data-bmi-range') === userRange) {
                range.classList.add('user-range');
            }
        });
    }, 2000); // 延迟执行，等待动画完成
}

// 渲染营养需求
function renderNutritionNeeds(profile) {
    const bmr = calculateBMR(profile);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, profile.healthGoal);

    // 计算宏量营养素分配
    const macros = calculateMacros(targetCalories, profile.healthGoal);

    // 蛋白质
    if (document.getElementById('proteinAmount')) {
        if (window.CountUpEffect) {
            new CountUpEffect({
                end: Math.round(macros.protein),
                duration: 1800,
                suffix: ' 克',
                element: document.getElementById('proteinAmount')
            });
        } else {
            document.getElementById('proteinAmount').textContent = Math.round(macros.protein) + ' 克';
        }
        
        // 计算百分比
        const proteinPercent = Math.round((macros.protein * 4 / targetCalories) * 100);
        document.getElementById('proteinPercentage').textContent = proteinPercent + '%';
        
        // 计算卡路里
        const proteinCalories = Math.round(macros.protein * 4);
        document.getElementById('proteinCalories').textContent = proteinCalories + ' 千卡';
    }

    // 碳水化合物
    if (document.getElementById('carbsAmount')) {
        if (window.CountUpEffect) {
            new CountUpEffect({
                end: Math.round(macros.carbs),
                duration: 2000,
                suffix: ' 克',
                element: document.getElementById('carbsAmount')
            });
        } else {
            document.getElementById('carbsAmount').textContent = Math.round(macros.carbs) + ' 克';
        }
        
        // 计算百分比
        const carbsPercent = Math.round((macros.carbs * 4 / targetCalories) * 100);
        document.getElementById('carbsPercentage').textContent = carbsPercent + '%';
        
        // 计算卡路里
        const carbsCalories = Math.round(macros.carbs * 4);
        document.getElementById('carbsCalories').textContent = carbsCalories + ' 千卡';
    }

    // 脂肪
    if (document.getElementById('fatsAmount')) {
        if (window.CountUpEffect) {
            new CountUpEffect({
                end: Math.round(macros.fat),
                duration: 2200,
                suffix: ' 克',
                element: document.getElementById('fatsAmount')
            });
        } else {
            document.getElementById('fatsAmount').textContent = Math.round(macros.fat) + ' 克';
        }
        
        // 计算百分比
        const fatsPercent = Math.round((macros.fat * 9 / targetCalories) * 100);
        document.getElementById('fatsPercentage').textContent = fatsPercent + '%';
        
        // 计算卡路里
        const fatsCalories = Math.round(macros.fat * 9);
        document.getElementById('fatsCalories').textContent = fatsCalories + ' 千卡';
    }
    
    // 设置环形图动画数据
    setTimeout(() => {
        animateNutritionDonut(macros, targetCalories);
    }, 500);
}

// 动画显示营养环形图
function animateNutritionDonut(macros, targetCalories) {
    const proteinArc = document.getElementById('proteinArc');
    const carbsArc = document.getElementById('carbsArc');
    const fatsArc = document.getElementById('fatsArc');
    
    if (!proteinArc || !carbsArc || !fatsArc) return;
    
    // 计算各营养素百分比
    const proteinCalories = macros.protein * 4;
    const carbsCalories = macros.carbs * 4;
    const fatCalories = macros.fat * 9;
    
    const proteinPercent = (proteinCalories / targetCalories) * 100;
    const carbsPercent = (carbsCalories / targetCalories) * 100;
    const fatPercent = (fatCalories / targetCalories) * 100;
    
    // 圆周长
    const circumference = 2 * Math.PI * 90;
    
    // 计算各部分的弧长和偏移量
    let offset = 0;
    
    // 蛋白质弧
    const proteinLength = (proteinPercent / 100) * circumference;
    proteinArc.style.strokeDasharray = `${proteinLength} ${circumference}`;
    proteinArc.style.strokeDashoffset = '0';
    offset += proteinLength;
    
    // 碳水弧
    const carbsLength = (carbsPercent / 100) * circumference;
    carbsArc.style.strokeDasharray = `${carbsLength} ${circumference}`;
    carbsArc.style.strokeDashoffset = `-${offset}`;
    offset += carbsLength;
    
    // 脂肪弧
    const fatsLength = (fatPercent / 100) * circumference;
    fatsArc.style.strokeDasharray = `${fatsLength} ${circumference}`;
    fatsArc.style.strokeDashoffset = `-${offset}`;
    
    // 应用动画
    [proteinArc, carbsArc, fatsArc].forEach(arc => {
        const originalDashArray = arc.style.strokeDasharray;
        arc.style.strokeDasharray = '0 ' + circumference;
        
        setTimeout(() => {
            arc.style.transition = 'stroke-dasharray 1.5s ease';
            arc.style.strokeDasharray = originalDashArray;
        }, 100);
    });
}

// 渲染建议卡片
function renderAdviceCards(profile) {
    const adviceContainer = document.getElementById('adviceCards');
    adviceContainer.innerHTML = '';

    const advices = generateAdvices(profile);

    advices.forEach(advice => {
        const card = document.createElement('div');
        card.className = 'advice-card';
        card.innerHTML = `
            <h4>${advice.title}</h4>
            <p>${advice.content}</p>
        `;
        adviceContainer.appendChild(card);
    });
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

// 计算BMR (基础代谢率) - Mifflin-St Jeor公式
function calculateBMR(profile) {
    const { weight, height, age, gender } = profile;
    
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}

// 计算TDEE (每日总能量消耗)
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

// 计算目标卡路里
function calculateTargetCalories(tdee, healthGoal) {
    switch (healthGoal) {
        case 'lose_weight':
            return tdee - 500; // 减重：每天减少500卡
        case 'gain_weight':
            return tdee + 500; // 增重：每天增加500卡
        case 'maintain_weight':
        default:
            return tdee; // 维持体重
    }
}

// 计算宏量营养素
function calculateMacros(targetCalories, healthGoal) {
    let proteinPercent, carbsPercent, fatPercent;

    switch (healthGoal) {
        case 'lose_weight':
            // 减重：高蛋白、低碳水
            proteinPercent = 0.35;
            carbsPercent = 0.35;
            fatPercent = 0.30;
            break;
        case 'gain_weight':
            // 增重：高碳水、高蛋白
            proteinPercent = 0.30;
            carbsPercent = 0.45;
            fatPercent = 0.25;
            break;
        case 'maintain_weight':
        default:
            // 维持：均衡
            proteinPercent = 0.30;
            carbsPercent = 0.40;
            fatPercent = 0.30;
            break;
    }

    return {
        protein: (targetCalories * proteinPercent) / 4, // 蛋白质 4卡/克
        carbs: (targetCalories * carbsPercent) / 4,     // 碳水 4卡/克
        fat: (targetCalories * fatPercent) / 9          // 脂肪 9卡/克
    };
}

// 生成个性化建议
function generateAdvices(profile) {
    const advices = [];
    const bmi = profile.bmi || calculateBMI(profile.weight, profile.height);

    // BMI建议
    if (bmi < 18.5) {
        advices.push({
            title: '体重偏轻',
            content: '建议增加营养摄入，选择高蛋白、高热量的健康食物。'
        });
    } else if (bmi >= 25 && bmi < 30) {
        advices.push({
            title: '体重超标',
            content: '建议控制热量摄入，增加有氧运动，选择低脂、高纤维食物。'
        });
    } else if (bmi >= 30) {
        advices.push({
            title: '体重过重',
            content: '建议咨询专业营养师，制定科学的减重计划。'
        });
    } else {
        advices.push({
            title: '体重正常',
            content: '保持当前的健康生活方式，均衡饮食，规律运动。'
        });
    }

    // 健康目标建议
    switch (profile.healthGoal) {
        case 'lose_weight':
            advices.push({
                title: '减重建议',
                content: '每天保持500卡路里热量缺口，多吃蔬菜水果，减少精制碳水。'
            });
            break;
        case 'gain_weight':
            advices.push({
                title: '增重建议',
                content: '增加优质蛋白和碳水摄入，选择坚果、全谷物等营养密集食物。'
            });
            break;
        case 'maintain_weight':
            advices.push({
                title: '维持体重',
                content: '保持均衡饮食，每周至少150分钟中等强度运动。'
            });
            break;
    }

    // 活动水平建议
    if (profile.activityLevel === 'sedentary') {
        advices.push({
            title: '运动建议',
            content: '建议增加日常活动量，每天至少步行30分钟。'
        });
    }

    // 饮食限制建议
    if (profile.dietaryRestrictions) {
        advices.push({
            title: '饮食限制',
            content: `您的饮食限制：${profile.dietaryRestrictions}。推荐系统会为您筛选合适的食谱。`
        });
    }

    return advices;
}

// 获取性别文本
function getGenderText(gender) {
    return gender === 'male' ? '男' : '女';
}

// 获取活动水平文本
function getActivityText(activityLevel) {
    const activities = {
        'sedentary': '久坐',
        'light': '轻度活动',
        'moderate': '中度活动',
        'active': '活跃',
        'very_active': '高度活跃'
    };
    return activities[activityLevel] || '未设置';
}

// 获取健康目标文本
function getHealthGoalText(healthGoal) {
    const goals = {
        'lose_weight': '减重',
        'gain_weight': '增重',
        'maintain_weight': '维持体重',
        'build_muscle': '增肌'
    };
    return goals[healthGoal] || '未设置';
}

// 从本地存储加载
function loadFromLocalStorage(userId) {
    try {
        const profilesJson = localStorage.getItem('healthProfiles');
        console.log('本地存储原始数据:', profilesJson);
        
        const profiles = JSON.parse(profilesJson || '{}');
        console.log('解析后的档案数据:', profiles);
        console.log('可用的用户ID列表:', Object.keys(profiles));
        
        const profile = profiles[userId] || null;
        console.log(`查找用户 ${userId} 的档案:`, profile);
        
        return profile;
    } catch (error) {
        console.error('从本地存储加载档案失败:', error);
        return null;
    }
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = 'message ' + type;
        messageDiv.style.display = 'block';
    }
}
