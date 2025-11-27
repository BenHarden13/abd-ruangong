// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initProfilePage();
});

function initProfilePage() {
    const form = document.getElementById('profileForm');
    const loadBtn = document.getElementById('loadBtn');
    const userIdInput = document.getElementById('userId');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');

    if (form) form.addEventListener('submit', handleSubmit);
    if (loadBtn) loadBtn.addEventListener('click', loadProfile);

    if (heightInput) heightInput.addEventListener('input', updateBMIPreview);
    if (weightInput) weightInput.addEventListener('input', updateBMIPreview);

    // Auto-load if user exists
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId && userIdInput) {
        userIdInput.value = savedUserId;
        loadProfile();
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    const formData = getFormData();
    
    if (!validateForm(formData)) {
        return;
    }

    try {
        const saveBtn = document.getElementById('saveBtn');
        const originalText = saveBtn.innerText;
        saveBtn.innerText = 'Saving...';
        saveBtn.disabled = true;

        let saveSuccess = false;
        
        // Try API
        if (window.API && window.API.healthProfile) {
            try {
                await window.API.healthProfile.createOrUpdate(formData);
                saveSuccess = true;
            } catch (error) {
                console.warn('API save failed, using local fallback:', error);
            }
        }
        
        // Fallback to LocalStorage
        if (!saveSuccess) {
            saveToLocalStorage(formData);
            saveSuccess = true;
        }

        if (saveSuccess) {
            localStorage.setItem('currentUserId', formData.userId);
            showMessage('Journal saved successfully.', 'success');
            updateBMIPreview();
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }

    } catch (error) {
        console.error('Save failed:', error);
        showMessage('Could not save profile. Please try again.', 'error');
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.innerText = 'Save Journal';
        saveBtn.disabled = false;
    }
}

async function loadProfile() {
    const userIdInput = document.getElementById('userId');
    const userId = userIdInput ? userIdInput.value.trim() : '';

    if (!userId) {
        showMessage('Please enter your Name or ID first.', 'error');
        return;
    }

    try {
        showMessage('Retrieving journal...', 'info');
        let profile = null;
        
        if (window.API && window.API.healthProfile) {
            try {
                profile = await window.API.healthProfile.getByUserId(userId);
            } catch (error) {
                console.warn('API load failed, using local fallback');
            }
        }
        
        if (!profile) {
            profile = loadFromLocalStorage(userId);
        }

        if (profile) {
            fillForm(profile);
            showMessage('Profile loaded.', 'success');
            updateBMIPreview();
            setTimeout(() => {
                const msg = document.getElementById('message');
                if(msg) msg.style.display = 'none';
            }, 2000);
        } else {
            showMessage('No profile found for this ID.', 'error');
        }

    } catch (error) {
        showMessage('Error loading profile.', 'error');
    }
}

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

function fillForm(profile) {
    if(!profile) return;
    setVal('userId', profile.userId);
    setVal('age', profile.age);
    setVal('gender', profile.gender);
    setVal('height', profile.height);
    setVal('weight', profile.weight);
    setVal('healthGoal', profile.healthGoal);
    setVal('activityLevel', profile.activityLevel);
    setVal('dietaryRestrictions', profile.dietaryRestrictions);
    setVal('allergies', profile.allergies);
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if(el) el.value = val || '';
}

function validateForm(data) {
    const errors = [];
    
    if (!data.userId || data.userId.length < 2) errors.push('Name/ID is too short');
    if (!data.age || data.age < 1) errors.push('Invalid Age');
    if (!data.gender) errors.push('Please select Gender');
    if (!data.height || data.height < 50) errors.push('Invalid Height');
    if (!data.weight || data.weight < 20) errors.push('Invalid Weight');
    if (!data.healthGoal) errors.push('Please select a Goal');
    if (!data.activityLevel) errors.push('Please select Activity Level');

    if (errors.length > 0) {
        showMessage(errors[0], 'error'); // Show first error only for minimalism
        return false;
    }

    return true;
}

function updateBMIPreview() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);

    const previewBox = document.getElementById('bmiPreview');

    if (height && weight && height > 0) {
        const bmi = weight / Math.pow(height / 100, 2);
        let status = '';
        if (bmi < 18.5) status = 'Underweight';
        else if (bmi < 25) status = 'Normal';
        else if (bmi < 30) status = 'Overweight';
        else status = 'Obese';

        document.getElementById('currentBMI').textContent = bmi.toFixed(1);
        document.getElementById('bmiStatus').textContent = status;
        if(previewBox) previewBox.style.display = 'block';
    } else {
        if(previewBox) previewBox.style.display = 'none';
    }
}

function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if(!messageDiv) return;
    messageDiv.textContent = message;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';
}

function saveToLocalStorage(data) {
    try {
        const profiles = JSON.parse(localStorage.getItem('healthProfiles') || '{}');
        const profileData = {
            ...data,
            bmi: data.weight / Math.pow(data.height / 100, 2),
            updatedAt: new Date().toISOString()
        };
        profiles[data.userId] = profileData;
        localStorage.setItem('healthProfiles', JSON.stringify(profiles));
    } catch (error) {
        console.error('Local save error', error);
    }
}

function loadFromLocalStorage(userId) {
    const profiles = JSON.parse(localStorage.getItem('healthProfiles') || '{}');
    return profiles[userId] || null;
}