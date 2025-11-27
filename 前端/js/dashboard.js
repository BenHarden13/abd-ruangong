// Dashboard JavaScript - English Version (Fixed)

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Dashboard Load ===');
    initDashboard();
});

async function initDashboard() {
    const userId = localStorage.getItem('currentUserId');

    if (!userId) {
        // Hide metrics if no user
        document.getElementById('noDataMessage').style.display = 'block';
        document.querySelector('.user-info-card').style.display = 'none';
        document.querySelector('.metrics-grid').style.display = 'none';
        document.querySelector('.nutrition-card').style.display = 'none';
        document.querySelector('.bmi-chart-card').style.display = 'none';
        document.querySelector('.recommendations-card').style.display = 'none';
        return;
    } else {
        document.getElementById('noDataMessage').style.display = 'none';
    }

    try {
        let profile = null;
        
        // 1. Try API
        if (window.API && window.API.healthProfile) {
            try {
                profile = await window.API.healthProfile.getByUserId(userId);
            } catch (error) {
                console.warn('Backend load failed, trying local.', error);
            }
        }
        
        // 2. Try Local
        if (!profile) {
            profile = loadFromLocalStorage(userId);
        }

        if (!profile) {
            document.getElementById('noDataMessage').style.display = 'block';
            return;
        }

        renderDashboard(profile);

    } catch (error) {
        console.error('Dashboard init error:', error);
    }
}

function renderDashboard(profile) {
    renderUserInfo(profile);
    renderHealthMetrics(profile);
    renderNutritionNeeds(profile);
    renderAdviceCards(profile);
}

function renderUserInfo(profile) {
    setText('userName', profile.userId);
    setText('userAge', profile.age ? `${profile.age}` : '-');
    setText('userGender', getGenderText(profile.gender));
    setText('userHeight', profile.height ? `${profile.height} cm` : '-');
    setText('userWeight', profile.weight ? `${profile.weight} kg` : '-');
    setText('userActivity', getActivityText(profile.activityLevel));
    setText('userGoal', getHealthGoalText(profile.healthGoal));
}

function renderHealthMetrics(profile) {
    if (!profile.weight || !profile.height) return;
    
    // BMI
    const bmi = profile.bmi || calculateBMI(profile.weight, profile.height);
    const bmiStatus = getBMIStatus(bmi);
    
    setText('bmiValue', bmi.toFixed(1));
    setText('bmiStatus', bmiStatus);
    
    // Highlight BMI Card
    highlightBmiRange(bmi);

    // BMR
    const bmr = calculateBMR(profile);
    setText('bmrValue', Math.round(bmr));

    // TDEE
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    setText('tdeeValue', Math.round(tdee));

    // Target
    const targetCalories = calculateTargetCalories(tdee, profile.healthGoal);
    setText('targetCalories', Math.round(targetCalories));
    
    // Center of Donut
    setText('totalCalories', Math.round(targetCalories));
}

function highlightBmiRange(bmi) {
    const ranges = document.querySelectorAll('.bmi-range');
    let type = '';
    if (bmi < 18.5) type = 'underweight';
    else if (bmi < 25) type = 'normal';
    else if (bmi < 30) type = 'overweight';
    else type = 'obese';

    ranges.forEach(r => {
        if (r.getAttribute('data-bmi-range') === type) {
            r.classList.add('user-range');
        } else {
            r.classList.remove('user-range');
        }
    });
}

function renderNutritionNeeds(profile) {
    const bmr = calculateBMR(profile);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const target = calculateTargetCalories(tdee, profile.healthGoal);
    
    // Safeguard: ensure target is positive to avoid division by zero
    const safeTarget = target > 0 ? target : 2000;
    
    const macros = calculateMacros(safeTarget, profile.healthGoal);

    // Update Texts with English Units
    updateMacro('protein', macros.protein, safeTarget, 4);
    updateMacro('carbs', macros.carbs, safeTarget, 4);
    updateMacro('fats', macros.fat, safeTarget, 9);

    // Update Donut Chart (Visual)
    // Calculate percentages safely
    let proteinP = (macros.protein * 4 / safeTarget) * 100;
    let carbsP = (macros.carbs * 4 / safeTarget) * 100;
    let fatsP = (macros.fat * 9 / safeTarget) * 100;

    // Handle NaNs
    if (isNaN(proteinP)) proteinP = 0;
    if (isNaN(carbsP)) carbsP = 0;
    if (isNaN(fatsP)) fatsP = 0;

    setDonutSegment('proteinArc', proteinP);
    setDonutSegment('carbsArc', carbsP, proteinP); // Offset by protein
    setDonutSegment('fatsArc', fatsP, proteinP + carbsP); // Offset by protein + carbs
}

function updateMacro(type, grams, totalCal, calPerGram) {
    const amountEl = document.getElementById(`${type}Amount`);
    const pctEl = document.getElementById(`${type}Percentage`);
    const calEl = document.getElementById(`${type}Calories`);
    
    // Force English unit 'g'
    if(amountEl) amountEl.textContent = Math.round(grams) + 'g';
    
    const calories = grams * calPerGram;
    let percent = Math.round((calories / totalCal) * 100);
    if (isNaN(percent)) percent = 0;
    
    if(pctEl) pctEl.textContent = percent + '%';
    // Force English unit 'kcal'
    if(calEl) calEl.textContent = Math.round(calories) + ' kcal';
}

function setDonutSegment(id, percent, offsetPercent = 0) {
    const circle = document.getElementById(id);
    if (!circle) return;
    
    const radius = 90;
    const circumference = 2 * Math.PI * radius; // approx 565.48
    
    // Limit percent to 100 to avoid drawing too much
    const safePercent = Math.min(Math.max(percent, 0), 100);
    const arcLength = (safePercent / 100) * circumference;
    const offsetLength = (offsetPercent / 100) * circumference;
    
    // Draw the line
    circle.style.strokeDasharray = `${arcLength} ${circumference}`;
    // Rotate it to correct position
    circle.style.strokeDashoffset = -offsetLength;
}

function renderAdviceCards(profile) {
    const container = document.getElementById('healthAdvice');
    if(!container) return;
    
    const advices = generateAdvices(profile);
    
    if (advices.length === 0) {
        container.innerHTML = '<p class="no-data">You are doing great! Keep it up.</p>';
        return;
    }

    container.innerHTML = '';
    advices.forEach(advice => {
        const div = document.createElement('div');
        div.className = 'advice-item';
        div.innerHTML = `<h4>${advice.title}</h4><p>${advice.content}</p>`;
        container.appendChild(div);
    });
}

// --- Helpers ---

function getBMIStatus(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function getGenderText(g) { return g === 'Male' ? 'Male' : (g === 'Female' ? 'Female' : '-'); }

function getActivityText(level) {
    const map = {
        'Sedentary': 'Sedentary',
        'Light': 'Light Activity',
        'Moderate': 'Moderate Activity',
        'Active': 'Very Active',
        'Very Active': 'Extra Active'
    };
    return map[level] || level;
}

function getHealthGoalText(goal) {
    const map = {
        'Weight Loss': 'Weight Loss',
        'Weight Gain': 'Weight Gain',
        'Maintain Weight': 'Maintain',
        'Muscle Gain': 'Muscle Gain',
        'General Health': 'Health'
    };
    return map[goal] || goal;
}

function generateAdvices(profile) {
    const list = [];
    const bmi = profile.bmi || calculateBMI(profile.weight, profile.height);

    if (bmi < 18.5) {
        list.push({ title: 'Nutrition Focus', content: 'Prioritize nutrient-dense foods to reach a healthy weight.' });
    } else if (bmi >= 25) {
        list.push({ title: 'Activity', content: 'Aim for a caloric deficit and increase daily movement.' });
    }

    if (profile.healthGoal === 'Muscle Gain') {
        list.push({ title: 'Protein', content: 'Ensure you consume protein within 30 mins of workouts.' });
    }

    return list;
}

function calculateBMI(w, h) { 
    if(!w || !h) return 0;
    return w / Math.pow(h / 100, 2); 
}

function calculateBMR(p) {
    if (!p.weight || !p.height || !p.age) return 0;
    if (p.gender === 'Male') return 10 * p.weight + 6.25 * p.height - 5 * p.age + 5;
    return 10 * p.weight + 6.25 * p.height - 5 * p.age - 161;
}

function calculateTDEE(bmr, level) {
    const map = { 'Sedentary': 1.2, 'Light': 1.375, 'Moderate': 1.55, 'Active': 1.725, 'Very Active': 1.9 };
    return bmr * (map[level] || 1.2);
}

function calculateTargetCalories(tdee, goal) {
    if (goal === 'Weight Loss') return tdee - 500;
    if (goal === 'Weight Gain') return tdee + 500;
    return tdee;
}

function calculateMacros(cal, goal) {
    let p = 0.3, c = 0.4, f = 0.3;
    if (goal === 'Weight Loss') { p=0.4; c=0.3; f=0.3; }
    if (goal === 'Muscle Gain') { p=0.35; c=0.45; f=0.2; }
    
    return {
        protein: (cal * p) / 4,
        carbs: (cal * c) / 4,
        fat: (cal * f) / 9
    };
}

function setText(id, val) {
    const el = document.getElementById(id);
    if(el) el.textContent = val;
}

function loadFromLocalStorage(id) {
    const profiles = JSON.parse(localStorage.getItem('healthProfiles') || '{}');
    return profiles[id] || null;
}