/* ==============================
   碳循环小记 - v1.2 功能逻辑
   ============================== */

const DEFAULT_SETTINGS = {
    gender: "male",
    age: 26,
    heightCm: 176,
    weightKg: 77,
    bodyFatRate: 20,
    activityLevel: 1.6,
};

const STORAGE_KEYS = {
    records: "carbonCycleRecords",
    settings: "carbonCycleSettings",
};

const MODE_LABELS = {
    bulk: "增肌版",
    cut: "减脂版",
};

const DAY_TYPE_LABELS = {
    high: "高碳日",
    medium: "中碳日",
    low: "低碳日",
};

const MEAL_TYPE_LABELS = {
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snack: "间餐",
    preWorkout: "训练前",
    postWorkout: "训练后",
    beforeSleep: "睡前餐",
    other: "其他",
};

let selectedDate = getTodayDateText();
let calendarViewDate = new Date();
let editingMealId = null;

const openIntroButton = document.getElementById("openIntroButton");
const closeIntroButton = document.getElementById("closeIntroButton");
const introModal = document.getElementById("introModal");

const dietModeSelect = document.getElementById("dietMode");
const dayTypeSelect = document.getElementById("dayType");

const mealTypeSelect = document.getElementById("mealType");
const mealNameInput = document.getElementById("mealName");
const actualProteinInput = document.getElementById("actualProtein");
const actualCarbsInput = document.getElementById("actualCarbs");
const actualFatInput = document.getElementById("actualFat");

const selectedDateText = document.getElementById("selectedDateText");

const targetProteinText = document.getElementById("targetProtein");
const targetCarbsText = document.getElementById("targetCarbs");
const targetFatText = document.getElementById("targetFat");
const targetCaloriesText = document.getElementById("targetCalories");

const actualTotalText = document.getElementById("actualTotalText");
const actualCaloriesText = document.getElementById("actualCaloriesText");

const saveButton = document.getElementById("saveButton");

const proteinDiffText = document.getElementById("proteinDiff");
const carbsDiffText = document.getElementById("carbsDiff");
const fatDiffText = document.getElementById("fatDiff");
const caloriesDiffText = document.getElementById("caloriesDiff");

const recordList = document.getElementById("recordList");

const calendarTitle = document.getElementById("calendarTitle");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonthButton = document.getElementById("prevMonthButton");
const nextMonthButton = document.getElementById("nextMonthButton");

const settingsModal = document.getElementById("settingsModal");
const openSettingsButton = document.getElementById("openSettingsButton");
const closeSettingsButton = document.getElementById("closeSettingsButton");
const saveSettingsButton = document.getElementById("saveSettingsButton");

const userGenderSelect = document.getElementById("userGender");
const userAgeInput = document.getElementById("userAge");
const userHeightInput = document.getElementById("userHeight");
const userWeightInput = document.getElementById("userWeight");
const userBodyFatInput = document.getElementById("userBodyFat");
const activityLevelSelect = document.getElementById("activityLevel");

const bmrResultText = document.getElementById("bmrResult");
const tdeeResultText = document.getElementById("tdeeResult");

function calculateCalories(protein, carbs, fat) {
    return Math.round(protein * 4 + carbs * 4 + fat * 9);
}

function roundNumber(value) {
    return Math.round(value);
}

function getNumberValue(inputElement) {
    const value = Number(inputElement.value);

    if (Number.isNaN(value)) {
        return 0;
    }

    return value;
}

function getTodayDateText() {
    const today = new Date();

    return formatDate(today);
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateText) {
    const [year, month, day] = dateText.split("-");

    return `${year}年${Number(month)}月${Number(day)}日`;
}

function loadSettings() {
    const savedText = localStorage.getItem(STORAGE_KEYS.settings);

    if (!savedText) {
        return DEFAULT_SETTINGS;
    }

    try {
        return {
            ...DEFAULT_SETTINGS,
            ...JSON.parse(savedText),
        };
    } catch (error) {
        console.error("设置读取失败", error);
        return DEFAULT_SETTINGS;
    }
}

function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

function calculateBmr(settings) {
    if (settings.gender === "female") {
        return roundNumber(
            655 +
            9.6 * settings.weightKg +
            1.8 * settings.heightCm -
            4.7 * settings.age
        );
    }

    return roundNumber(
        66 +
        13.7 * settings.weightKg +
        5 * settings.heightCm -
        6.8 * settings.age
    );
}

function calculateTdee(bmr, activityLevel) {
    return roundNumber(bmr * activityLevel);
}

function calculateLeanBodyMassKg(weightKg, bodyFatRate) {
    return weightKg * (1 - bodyFatRate / 100);
}

function convertKgToLb(kg) {
    return kg * 2.2046;
}

function calculateTargets(settings) {
    const bmr = calculateBmr(settings);
    const tdee = calculateTdee(bmr, settings.activityLevel);

    const leanBodyMassKg = calculateLeanBodyMassKg(
        settings.weightKg,
        settings.bodyFatRate
    );

    const leanBodyMassLb = convertKgToLb(leanBodyMassKg);
    const bodyWeightLb = convertKgToLb(settings.weightKg);

    const protein = roundNumber(leanBodyMassLb * 1.2);

    const cutMediumCarbs = roundNumber(bodyWeightLb * 1.25);
    const cutMediumFat = roundNumber(bodyWeightLb * 0.6);

    const cutTargets = {
        high: {
            protein,
            carbs: roundNumber(cutMediumCarbs * 1.75),
            fat: roundNumber(cutMediumFat * 0.5),
        },
        medium: {
            protein,
            carbs: cutMediumCarbs,
            fat: cutMediumFat,
        },
        low: {
            protein,
            carbs: roundNumber(cutMediumCarbs * 0.25),
            fat: roundNumber(cutMediumFat * 1.5),
        },
    };

    return {
        bulk: calculateBulkTargetsFromTdee(tdee, protein),
        cut: cutTargets,
    };
}

function calculateBulkTargetsFromTdee(tdee, protein) {
    return {
        high: buildMacroTarget(tdee + 300, protein, 65),
        medium: buildMacroTarget(tdee + 100, protein, 75),
        low: buildMacroTarget(tdee - 150, protein, 85),
    };
}

function buildMacroTarget(totalCalories, protein, fat) {
    const proteinCalories = protein * 4;
    const fatCalories = fat * 9;
    const carbs = roundNumber((totalCalories - proteinCalories - fatCalories) / 4);

    return {
        protein,
        carbs: Math.max(carbs, 0),
        fat,
    };
}

function getCurrentTarget() {
    const settings = loadSettings();
    const targets = calculateTargets(settings);

    const mode = dietModeSelect.value;
    const dayType = dayTypeSelect.value;

    return targets[mode][dayType];
}

function getCurrentMealInput() {
    const protein = getNumberValue(actualProteinInput);
    const carbs = getNumberValue(actualCarbsInput);
    const fat = getNumberValue(actualFatInput);

    return {
        id: editingMealId || Date.now(),
        type: mealTypeSelect.value,
        name: mealNameInput.value.trim(),
        protein,
        carbs,
        fat,
        calories: calculateCalories(protein, carbs, fat),
    };
}

function clearCurrentMealInput() {
    editingMealId = null;

    mealTypeSelect.value = "breakfast";
    mealNameInput.value = "";
    actualProteinInput.value = "";
    actualCarbsInput.value = "";
    actualFatInput.value = "";
    saveButton.textContent = "追加到当前日期";

    updateDiffDisplay();
}

function getTotalsFromRecord(record) {
    if (!record || !Array.isArray(record.meals)) {
        return {
            protein: 0,
            carbs: 0,
            fat: 0,
            calories: 0,
        };
    }

    const totals = record.meals.reduce(
        (sum, meal) => {
            return {
                protein: sum.protein + meal.protein,
                carbs: sum.carbs + meal.carbs,
                fat: sum.fat + meal.fat,
            };
        },
        {
            protein: 0,
            carbs: 0,
            fat: 0,
        }
    );

    return {
        ...totals,
        calories: calculateCalories(totals.protein, totals.carbs, totals.fat),
    };
}

function updateTargetDisplay() {
    const target = getCurrentTarget();
    const targetCalories = calculateCalories(
        target.protein,
        target.carbs,
        target.fat
    );

    targetProteinText.textContent = `${target.protein}g`;
    targetCarbsText.textContent = `${target.carbs}g`;
    targetFatText.textContent = `${target.fat}g`;
    targetCaloriesText.textContent = `${targetCalories} kcal`;

    updateDiffDisplay();
}

function updateDiffDisplay() {
    const target = getCurrentTarget();
    const record = findRecordByDate(selectedDate);
    const totals = getTotalsFromRecord(record);

    const targetCalories = calculateCalories(
        target.protein,
        target.carbs,
        target.fat
    );

    actualTotalText.textContent = `P ${totals.protein}g / C ${totals.carbs}g / F ${totals.fat}g`;
    actualCaloriesText.textContent = `${totals.calories} kcal`;

    proteinDiffText.textContent = formatDiffText(
        "蛋白质",
        target.protein - totals.protein,
        "g"
    );

    carbsDiffText.textContent = formatDiffText(
        "碳水",
        target.carbs - totals.carbs,
        "g"
    );

    fatDiffText.textContent = formatDiffText(
        "脂肪",
        target.fat - totals.fat,
        "g"
    );

    caloriesDiffText.textContent = formatDiffText(
        "热量",
        targetCalories - totals.calories,
        "kcal"
    );
}

function formatDiffText(label, diff, unit) {
    if (diff > 0) {
        return `${label}：还差 ${diff}${unit}`;
    }

    if (diff < 0) {
        return `${label}：超出 ${Math.abs(diff)}${unit}`;
    }

    return `${label}：刚好达标`;
}

function loadRecords() {
    const savedText = localStorage.getItem(STORAGE_KEYS.records);

    if (!savedText) {
        return [];
    }

    try {
        return JSON.parse(savedText);
    } catch (error) {
        console.error("记录读取失败", error);
        return [];
    }
}

function saveRecords(records) {
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
}

function findRecordByDate(dateText) {
    const records = loadRecords();

    return records.find((record) => record.date === dateText) || null;
}

function saveSelectedDateRecord() {
    const mode = dietModeSelect.value;
    const dayType = dayTypeSelect.value;
    const currentMeal = getCurrentMealInput();

    if (!validateMeal(currentMeal)) {
        alert("请至少输入一项有效的 P / C / F 数据。");
        return;
    }

    const target = getCurrentTarget();
    const targetCalories = calculateCalories(
        target.protein,
        target.carbs,
        target.fat
    );

    const records = loadRecords();
    const oldRecord = findRecordByDate(selectedDate);

    const oldMeals = oldRecord && Array.isArray(oldRecord.meals)
        ? oldRecord.meals
        : [];

    const meals = upsertMeal(oldMeals, currentMeal);
    const totals = getTotalsFromRecord({ meals });

    const newRecord = {
        id: selectedDate,
        date: selectedDate,
        mode,
        dayType,
        targetProtein: target.protein,
        targetCarbs: target.carbs,
        targetFat: target.fat,
        targetCalories,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        calories: totals.calories,
        meals,
    };

    const filteredRecords = records.filter((record) => {
        return record.date !== selectedDate;
    });

    filteredRecords.unshift(newRecord);

    saveRecords(filteredRecords);
    clearCurrentMealInput();
    renderCalendar();
    renderSelectedDateRecord();

    alert("餐食记录已保存");
}

function upsertMeal(meals, currentMeal) {
    const exists = meals.some((meal) => meal.id === currentMeal.id);

    if (!exists) {
        return [...meals, currentMeal];
    }

    return meals.map((meal) => {
        if (meal.id !== currentMeal.id) {
            return meal;
        }

        return currentMeal;
    });
}

function validateMeal(meal) {
    return meal.protein > 0 || meal.carbs > 0 || meal.fat > 0;
}

function renderSelectedDateRecord() {
    const record = findRecordByDate(selectedDate);

    selectedDateText.textContent = formatDisplayDate(selectedDate);

    if (!record) {
        recordList.innerHTML = '<p class="empty-text">当前日期还没有记录</p>';
        return;
    }

    recordList.innerHTML = `
    <div class="record-item">
      <div class="record-item-header">
        <span>${record.date}｜${DAY_TYPE_LABELS[record.dayType]}</span>
        <button class="delete-button" data-date="${record.date}">删除当天</button>
      </div>

      <p>${MODE_LABELS[record.mode]}</p>
      <p>目标：P ${record.targetProtein}g / C ${record.targetCarbs}g / F ${record.targetFat}g</p>
      <p>实际：P ${record.protein}g / C ${record.carbs}g / F ${record.fat}g</p>
      <p>${record.calories} / ${record.targetCalories} kcal</p>

      ${buildMealListHtml(record.meals)}
    </div>
  `;

    bindDeleteRecordButtons();
    bindMealActionButtons();
}

function buildMealListHtml(meals) {
    if (!Array.isArray(meals) || meals.length === 0) {
        return '<p class="empty-text">还没有餐食记录</p>';
    }

    const mealItems = meals
        .map((meal) => {
            const mealTypeLabel = MEAL_TYPE_LABELS[meal.type] || "其他";
            const mealName = meal.name ? `｜${meal.name}` : "";

            return `
        <li class="meal-list-item">
          <div class="meal-list-header">
            <div>
              <div class="meal-list-title">${mealTypeLabel}${mealName}</div>
              <p class="meal-list-meta">
                P ${meal.protein}g / C ${meal.carbs}g / F ${meal.fat}g / ${meal.calories} kcal
              </p>
            </div>

            <div class="meal-action-group">
              <button class="small-button edit-meal-button" data-meal-id="${meal.id}" type="button">
                编辑
              </button>
              <button class="small-button danger delete-meal-button" data-meal-id="${meal.id}" type="button">
                删除
              </button>
            </div>
          </div>
        </li>
      `;
        })
        .join("");

    return `<ul class="meal-list">${mealItems}</ul>`;
}

function bindDeleteRecordButtons() {
    const deleteButtons = document.querySelectorAll(".delete-button");

    deleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
            deleteRecordByDate(button.dataset.date);
        });
    });
}

function bindMealActionButtons() {
    const editButtons = document.querySelectorAll(".edit-meal-button");
    const deleteMealButtons = document.querySelectorAll(".delete-meal-button");

    editButtons.forEach((button) => {
        button.addEventListener("click", () => {
            startEditMeal(Number(button.dataset.mealId));
        });
    });

    deleteMealButtons.forEach((button) => {
        button.addEventListener("click", () => {
            deleteMeal(Number(button.dataset.mealId));
        });
    });
}

function startEditMeal(mealId) {
    const record = findRecordByDate(selectedDate);

    if (!record || !Array.isArray(record.meals)) {
        return;
    }

    const meal = record.meals.find((item) => item.id === mealId);

    if (!meal) {
        return;
    }

    editingMealId = meal.id;

    mealTypeSelect.value = meal.type;
    mealNameInput.value = meal.name || "";
    actualProteinInput.value = meal.protein;
    actualCarbsInput.value = meal.carbs;
    actualFatInput.value = meal.fat;
    saveButton.textContent = "保存餐食修改";
}

function deleteMeal(mealId) {
    const records = loadRecords();
    const record = findRecordByDate(selectedDate);

    if (!record || !Array.isArray(record.meals)) {
        return;
    }

    const meals = record.meals.filter((meal) => meal.id !== mealId);

    if (meals.length === 0) {
        deleteRecordByDate(selectedDate);
        return;
    }

    const totals = getTotalsFromRecord({ meals });

    const updatedRecord = {
        ...record,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        calories: totals.calories,
        meals,
    };

    const updatedRecords = records.map((item) => {
        if (item.date !== selectedDate) {
            return item;
        }

        return updatedRecord;
    });

    saveRecords(updatedRecords);
    clearCurrentMealInput();
    renderSelectedDateRecord();
    renderCalendar();
    updateDiffDisplay();
}

function deleteRecordByDate(dateText) {
    const records = loadRecords();
    const filteredRecords = records.filter((record) => record.date !== dateText);

    saveRecords(filteredRecords);
    clearCurrentMealInput();
    renderCalendar();
    renderSelectedDateRecord();
    updateDiffDisplay();
}

function fillInputsFromRecord(record) {
    clearCurrentMealInput();

    if (!record) {
        updateDiffDisplay();
        return;
    }

    dietModeSelect.value = record.mode;
    dayTypeSelect.value = record.dayType;

    updateTargetDisplay();
}

function renderCalendar() {
    const records = loadRecords();
    const recordMap = buildRecordMap(records);

    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();

    calendarTitle.textContent = `${year}年${month + 1}月`;

    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const dayCells = [];

    for (let i = 0; i < firstWeekday; i += 1) {
        dayCells.push('<button class="calendar-day is-empty" type="button"></button>');
    }

    for (let day = 1; day <= lastDate; day += 1) {
        const dateText = formatDate(new Date(year, month, day));
        const record = recordMap[dateText];

        const classes = ["calendar-day"];

        if (dateText === selectedDate) {
            classes.push("is-selected");
        }

        if (dateText === getTodayDateText()) {
            classes.push("is-today");
        }

        if (record) {
            classes.push("has-record");
            classes.push(`record-${record.dayType}`);
        }

        dayCells.push(`
      <button class="${classes.join(" ")}" type="button" data-date="${dateText}">
        ${day}
      </button>
    `);
    }

    calendarGrid.innerHTML = dayCells.join("");

    bindCalendarDayButtons();
}

function buildRecordMap(records) {
    return records.reduce((map, record) => {
        map[record.date] = record;

        return map;
    }, {});
}

function bindCalendarDayButtons() {
    const dayButtons = document.querySelectorAll(".calendar-day[data-date]");

    dayButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectDate(button.dataset.date);
        });
    });
}

function selectDate(dateText) {
    selectedDate = dateText;

    const [year, month] = dateText.split("-").map(Number);
    calendarViewDate = new Date(year, month - 1, 1);

    const record = findRecordByDate(selectedDate);

    fillInputsFromRecord(record);
    renderCalendar();
    renderSelectedDateRecord();
    updateTargetDisplay();
}

function moveToPrevMonth() {
    calendarViewDate = new Date(
        calendarViewDate.getFullYear(),
        calendarViewDate.getMonth() - 1,
        1
    );

    renderCalendar();
}

function moveToNextMonth() {
    calendarViewDate = new Date(
        calendarViewDate.getFullYear(),
        calendarViewDate.getMonth() + 1,
        1
    );

    renderCalendar();
}

function openIntroModal() {
    introModal.classList.remove("hidden");
}

function closeIntroModal() {
    introModal.classList.add("hidden");
}

function openSettingsModal() {
    fillSettingsForm();
    updateSettingsPreview();
    settingsModal.classList.remove("hidden");
}

function closeSettingsModal() {
    settingsModal.classList.add("hidden");
}

function fillSettingsForm() {
    const settings = loadSettings();

    userGenderSelect.value = settings.gender;
    userAgeInput.value = settings.age;
    userHeightInput.value = settings.heightCm;
    userWeightInput.value = settings.weightKg;
    userBodyFatInput.value = settings.bodyFatRate;
    activityLevelSelect.value = String(settings.activityLevel);
}

function buildSettingsFromForm() {
    return {
        gender: userGenderSelect.value,
        age: getNumberValue(userAgeInput),
        heightCm: getNumberValue(userHeightInput),
        weightKg: getNumberValue(userWeightInput),
        bodyFatRate: getNumberValue(userBodyFatInput),
        activityLevel: getNumberValue(activityLevelSelect),
    };
}

function updateSettingsPreview() {
    const settings = buildSettingsFromForm();
    const bmr = calculateBmr(settings);
    const tdee = calculateTdee(bmr, settings.activityLevel);

    bmrResultText.textContent = `${bmr} kcal`;
    tdeeResultText.textContent = `${tdee} kcal`;
}

function saveUserSettings() {
    const settings = buildSettingsFromForm();

    if (!validateSettings(settings)) {
        alert("请确认年龄、身高、体重、体脂率是否正确。");
        return;
    }

    saveSettings(settings);
    updateTargetDisplay();
    closeSettingsModal();

    alert("个人数据已保存");
}

function validateSettings(settings) {
    if (settings.age <= 0) {
        return false;
    }

    if (settings.heightCm <= 0) {
        return false;
    }

    if (settings.weightKg <= 0) {
        return false;
    }

    if (settings.bodyFatRate < 3 || settings.bodyFatRate > 60) {
        return false;
    }

    if (settings.activityLevel <= 0) {
        return false;
    }

    return true;
}

function bindMealInputEvents() {
    actualProteinInput.addEventListener("input", updateDiffDisplay);
    actualCarbsInput.addEventListener("input", updateDiffDisplay);
    actualFatInput.addEventListener("input", updateDiffDisplay);
}

dietModeSelect.addEventListener("change", updateTargetDisplay);
dayTypeSelect.addEventListener("change", updateTargetDisplay);

saveButton.addEventListener("click", saveSelectedDateRecord);

prevMonthButton.addEventListener("click", moveToPrevMonth);
nextMonthButton.addEventListener("click", moveToNextMonth);

openIntroButton.addEventListener("click", openIntroModal);
closeIntroButton.addEventListener("click", closeIntroModal);

openSettingsButton.addEventListener("click", openSettingsModal);
closeSettingsButton.addEventListener("click", closeSettingsModal);
saveSettingsButton.addEventListener("click", saveUserSettings);

userGenderSelect.addEventListener("change", updateSettingsPreview);
userAgeInput.addEventListener("input", updateSettingsPreview);
userHeightInput.addEventListener("input", updateSettingsPreview);
userWeightInput.addEventListener("input", updateSettingsPreview);
userBodyFatInput.addEventListener("input", updateSettingsPreview);
activityLevelSelect.addEventListener("change", updateSettingsPreview);

bindMealInputEvents();

renderCalendar();
renderSelectedDateRecord();
updateTargetDisplay();

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js");
    });
}