/* ==============================
   碳循环小记 - v1.3.1 功能逻辑
   ============================== */

const DEFAULT_SETTINGS = {
    gender: "male",
    age: 26,
    heightCm: 176,
    weightKg: 77,
    bodyFatRate: 20,
    activityLevel: 1.6,

    targetCalculationMode: "classic",
    customDayType: "low",
    calorieOffset: -500,
    macroMethod: "fixed",

    fixedProtein: 170,
    fixedFat: 75,

    proteinPercent: 30,
    carbsPercent: 45,
    fatPercent: 25,
};

const STORAGE_KEYS = {
    records: "carbonCycleRecords",
    settings: "carbonCycleSettings",
    weightRecords: "carbonCycleWeightRecords",
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

const TARGET_MODE_LABELS = {
    classic: "经典碳循环模式",
    custom: "自定义热量模式",
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

const targetCalculationModeSelect = document.getElementById("targetCalculationMode");
const classicTargetPanel = document.getElementById("classicTargetPanel");
const customTargetPanel = document.getElementById("customTargetPanel");

const customDayTypeSelect = document.getElementById("customDayType");
const calorieOffsetSelect = document.getElementById("calorieOffset");
const manualOffsetGroup = document.getElementById("manualOffsetGroup");
const manualCalorieOffsetInput = document.getElementById("manualCalorieOffset");

const macroMethodSelect = document.getElementById("macroMethod");
const fixedMacroPanel = document.getElementById("fixedMacroPanel");
const percentMacroPanel = document.getElementById("percentMacroPanel");

const fixedProteinInput = document.getElementById("fixedProtein");
const fixedFatInput = document.getElementById("fixedFat");

const proteinPercentInput = document.getElementById("proteinPercent");
const carbsPercentInput = document.getElementById("carbsPercent");
const fatPercentInput = document.getElementById("fatPercent");
const macroPercentHelp = document.getElementById("macroPercentHelp");

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

const overviewDateTypeText = document.getElementById("overviewDateType");
const overviewCaloriesText = document.getElementById("overviewCalories");
const overviewCalorieDiffText = document.getElementById("overviewCalorieDiff");

const proteinProgressText = document.getElementById("proteinProgressText");
const carbsProgressText = document.getElementById("carbsProgressText");
const fatProgressText = document.getElementById("fatProgressText");
const caloriesProgressText = document.getElementById("caloriesProgressText");

const proteinProgressBar = document.getElementById("proteinProgressBar");
const carbsProgressBar = document.getElementById("carbsProgressBar");
const fatProgressBar = document.getElementById("fatProgressBar");
const caloriesProgressBar = document.getElementById("caloriesProgressBar");

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

const weightDateText = document.getElementById("weightDateText");
const dailyWeightInput = document.getElementById("dailyWeightInput");
const saveWeightButton = document.getElementById("saveWeightButton");

const currentWeekAverageText = document.getElementById("currentWeekAverageText");
const previousWeekAverageText = document.getElementById("previousWeekAverageText");
const weekDifferenceText = document.getElementById("weekDifferenceText");
const firstWeekDifferenceText = document.getElementById("firstWeekDifferenceText");

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

const pageElements = document.querySelectorAll(".page");
const bottomNavButtons = document.querySelectorAll(".bottom-nav-button");
const openIntroButtonInPage = document.getElementById("openIntroButtonInPage");
const openSettingsButtonInPage = document.getElementById("openSettingsButtonInPage");

const exportDataButton = document.getElementById("exportDataButton");
const importDataButton = document.getElementById("importDataButton");
const copyBackupButton = document.getElementById("copyBackupButton");
const backupDataText = document.getElementById("backupDataText");

/**
 * 表示ページを切り替える
 *
 * @param {string} pageId - 表示するページID
 */
function switchPage(pageId) {
    pageElements.forEach((page) => {
        page.classList.toggle("active-page", page.id === pageId);
    });

    bottomNavButtons.forEach((button) => {
        button.classList.toggle("active-nav", button.dataset.page === pageId);
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
}

/**
 * ボトムナビイベントを設定する
 */
function bindPageNavigationEvents() {
    bottomNavButtons.forEach((button) => {
        button.addEventListener("click", () => {
            switchPage(button.dataset.page);
        });
    });
}

/**
 * PFCから総カロリーを計算する
 *
 * @param {number} protein - 蛋白质 g
 * @param {number} carbs - 碳水 g
 * @param {number} fat - 脂肪 g
 * @returns {number} 总热量 kcal
 */
function calculateCalories(protein, carbs, fat) {
    return Math.round(protein * 4 + carbs * 4 + fat * 9);
}

/**
 * 数值を整数に丸める
 *
 * @param {number} value - 原始数值
 * @returns {number}
 */
function roundNumber(value) {
    return Math.round(value);
}

/**
 * 数值输入を安全に取得する
 *
 * @param {HTMLInputElement | HTMLSelectElement} inputElement - 输入框或选择框
 * @returns {number}
 */
function getNumberValue(inputElement) {
    const value = Number(inputElement.value);

    if (Number.isNaN(value)) {
        return 0;
    }

    return value;
}

/**
 * 今日の日付を yyyy-mm-dd 形式で取得する
 *
 * @returns {string}
 */
function getTodayDateText() {
    const today = new Date();

    return formatDate(today);
}

/**
 * Dateを yyyy-mm-dd 形式へ変換する
 *
 * @param {Date} date - 日期对象
 * @returns {string}
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/**
 * yyyy-mm-dd を表示用文字列へ変換する
 *
 * @param {string} dateText - 日期文本
 * @returns {string}
 */
function formatDisplayDate(dateText) {
    const [year, month, day] = dateText.split("-");

    return `${year}年${Number(month)}月${Number(day)}日`;
}

/**
 * yyyy-mm-dd を Date に変換する
 *
 * @param {string} dateText - 日期文本
 * @returns {Date}
 */
function parseDateText(dateText) {
    const [year, month, day] = dateText.split("-").map(Number);

    return new Date(year, month - 1, day);
}

/**
 * 指定日の週開始日（月曜日）を取得する
 *
 * @param {string} dateText - 日期文本
 * @returns {string}
 */
function getWeekStartDateText(dateText) {
    const date = parseDateText(dateText);
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    date.setDate(date.getDate() + diffToMonday);

    return formatDate(date);
}

/**
 * 指定日の前週開始日（月曜日）を取得する
 *
 * @param {string} dateText - 日期文本
 * @returns {string}
 */
function getPreviousWeekStartDateText(dateText) {
    const date = parseDateText(getWeekStartDateText(dateText));

    date.setDate(date.getDate() - 7);

    return formatDate(date);
}

/**
 * localStorageから設定を取得する
 *
 * @returns {typeof DEFAULT_SETTINGS}
 */
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

/**
 * localStorageへ設定を保存する
 *
 * @param {typeof DEFAULT_SETTINGS} settings - 用户设置
 */
function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

/**
 * BMRを計算する
 *
 * 男性：66 + 13.7 × 体重kg + 5 × 身高cm - 6.8 × 年龄
 * 女性：655 + 9.6 × 体重kg + 1.8 × 身高cm - 4.7 × 年龄
 *
 * @param {typeof DEFAULT_SETTINGS} settings - 用户设置
 * @returns {number}
 */
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

/**
 * TDEEを計算する
 *
 * @param {number} bmr - 基础代谢
 * @param {number} activityLevel - 活动系数
 * @returns {number}
 */
function calculateTdee(bmr, activityLevel) {
    return roundNumber(bmr * activityLevel);
}

/**
 * 瘦体重をkgで計算する
 *
 * @param {number} weightKg - 体重 kg
 * @param {number} bodyFatRate - 体脂率 %
 * @returns {number}
 */
function calculateLeanBodyMassKg(weightKg, bodyFatRate) {
    return weightKg * (1 - bodyFatRate / 100);
}

/**
 * kgをポンドに変換する
 *
 * @param {number} kg - kg
 * @returns {number}
 */
function convertKgToLb(kg) {
    return kg * 2.2046;
}

/**
 * 用户数据から碳循环目标を計算する
 *
 * @param {typeof DEFAULT_SETTINGS} settings - 用户设置
 * @returns {Object}
 */
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

/**
 * TDEEから增肌版目标を計算する
 *
 * @param {number} tdee - 日总消耗
 * @param {number} protein - 蛋白质目标
 * @returns {Object}
 */
function calculateBulkTargetsFromTdee(tdee, protein) {
    return {
        high: buildMacroTarget(tdee + 300, protein, 65),
        medium: buildMacroTarget(tdee + 100, protein, 75),
        low: buildMacroTarget(tdee - 150, protein, 85),
    };
}

/**
 * 热量・蛋白质・脂肪から碳水量を逆算する
 *
 * @param {number} totalCalories - 目标热量
 * @param {number} protein - 蛋白质 g
 * @param {number} fat - 脂肪 g
 * @returns {{protein: number, carbs: number, fat: number}}
 */
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

/**
 * 当前选择されている目标を取得する
 *
 * @returns {{protein: number, carbs: number, fat: number}}
 */
function getCurrentTarget() {
    const settings = loadSettings();
    const targetMode = targetCalculationModeSelect.value;

    if (targetMode === "custom") {
        return calculateCustomTarget(settings);
    }

    const targets = calculateTargets(settings);
    const mode = dietModeSelect.value;
    const dayType = dayTypeSelect.value;

    return targets[mode][dayType];
}

/**
 * 自定义目标設定をフォームから取得する
 *
 * @returns {Object}
 */
function buildTargetSettingsFromForm() {
    const calorieOffset = getSelectedCalorieOffset();

    return {
        targetCalculationMode: targetCalculationModeSelect.value,
        customDayType: customDayTypeSelect.value,
        calorieOffset,
        macroMethod: macroMethodSelect.value,
        fixedProtein: getNumberValue(fixedProteinInput),
        fixedFat: getNumberValue(fixedFatInput),
        proteinPercent: getNumberValue(proteinPercentInput),
        carbsPercent: getNumberValue(carbsPercentInput),
        fatPercent: getNumberValue(fatPercentInput),
    };
}

/**
 * 选择された热量调整を取得する
 *
 * @returns {number}
 */
function getSelectedCalorieOffset() {
    if (calorieOffsetSelect.value === "manual") {
        return getNumberValue(manualCalorieOffsetInput);
    }

    return Number(calorieOffsetSelect.value);
}

/**
 * TDEE と自定义設定から今日目标を計算する
 *
 * @param {typeof DEFAULT_SETTINGS} settings - 用户设置
 * @returns {{protein: number, carbs: number, fat: number}}
 */
function calculateCustomTarget(settings) {
    const targetSettings = buildTargetSettingsFromForm();
    const bmr = calculateBmr(settings);
    const tdee = calculateTdee(bmr, settings.activityLevel);
    const targetCalories = tdee + targetSettings.calorieOffset;

    if (targetSettings.macroMethod === "percent") {
        return calculatePercentTarget(targetCalories, targetSettings);
    }

    return calculateFixedMacroTarget(targetCalories, targetSettings);
}

/**
 * 百分比分配から PFC を計算する
 *
 * @param {number} targetCalories - 目标热量
 * @param {Object} targetSettings - 目标设置
 * @returns {{protein: number, carbs: number, fat: number}}
 */
function calculatePercentTarget(targetCalories, targetSettings) {
    return {
        protein: roundNumber((targetCalories * targetSettings.proteinPercent / 100) / 4),
        carbs: roundNumber((targetCalories * targetSettings.carbsPercent / 100) / 4),
        fat: roundNumber((targetCalories * targetSettings.fatPercent / 100) / 9),
    };
}

/**
 * 固定蛋白质・脂肪から碳水を逆算する
 *
 * @param {number} targetCalories - 目标热量
 * @param {Object} targetSettings - 目标设置
 * @returns {{protein: number, carbs: number, fat: number}}
 */
function calculateFixedMacroTarget(targetCalories, targetSettings) {
    const protein = targetSettings.fixedProtein;
    const fat = targetSettings.fixedFat;
    const carbs = roundNumber((targetCalories - protein * 4 - fat * 9) / 4);

    return {
        protein,
        carbs: Math.max(carbs, 0),
        fat,
    };
}

/**
 * 当前目标热量を取得する
 *
 * @param {{protein: number, carbs: number, fat: number}} target - PFC目标
 * @returns {number}
 */
function getCurrentTargetCalories(target) {
    const targetMode = targetCalculationModeSelect.value;

    if (targetMode !== "custom") {
        return calculateCalories(target.protein, target.carbs, target.fat);
    }

    const settings = loadSettings();
    const bmr = calculateBmr(settings);
    const tdee = calculateTdee(bmr, settings.activityLevel);
    const calorieOffset = getSelectedCalorieOffset();

    return roundNumber(tdee + calorieOffset);
}

/**
 * 当前输入中的一餐数据を取得する
 *
 * @returns {Object}
 */
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

/**
 * 当前正在输入的一餐をクリアする
 */
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

/**
 * 指定记录から当天合计を计算する
 *
 * @param {Object | null} record - 当前日期记录
 * @returns {{protein: number, carbs: number, fat: number, calories: number}}
 */
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

/**
 * 今日目标を画面に表示する
 */
function updateTargetDisplay() {
    const target = getCurrentTarget();
    const targetCalories = getCurrentTargetCalories(target);

    targetProteinText.textContent = `${target.protein}g`;
    targetCarbsText.textContent = `${target.carbs}g`;
    targetFatText.textContent = `${target.fat}g`;
    targetCaloriesText.textContent = `${targetCalories} kcal`;

    updateDiffDisplay();
    updateOverviewDisplay();
}

/**
 * 目标との差分を画面に表示する
 */
function updateDiffDisplay() {
    const target = getCurrentTarget();
    const record = findRecordByDate(selectedDate);
    const totals = getTotalsFromRecord(record);

    const targetCalories = getCurrentTargetCalories(target);

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

/**
 * 差分テキストを作成する
 *
 * @param {string} label - 项目名
 * @param {number} diff - 差值
 * @param {string} unit - 单位
 * @returns {string}
 */
function formatDiffText(label, diff, unit) {
    if (diff > 0) {
        return `${label}：还差 ${diff}${unit}`;
    }

    if (diff < 0) {
        return `${label}：超出 ${Math.abs(diff)}${unit}`;
    }

    return `${label}：刚好达标`;
}

/**
 * 完成率を計算する
 *
 * @param {number} actual - 实际值
 * @param {number} target - 目标值
 * @returns {number}
 */
function calculateProgressPercent(actual, target) {
    if (target <= 0) {
        return 0;
    }

    return Math.round((actual / target) * 100);
}

/**
 * 进度条を更新する
 *
 * @param {HTMLElement} textElement - 百分比文字元素
 * @param {HTMLElement} barElement - 进度条元素
 * @param {number} percent - 百分比
 */
function updateProgressBar(textElement, barElement, percent) {
    const displayPercent = Math.max(percent, 0);
    const barWidth = Math.min(displayPercent, 100);

    textElement.textContent = `${displayPercent}%`;
    barElement.style.width = `${barWidth}%`;

    if (displayPercent > 100) {
        barElement.classList.add("is-over");
    } else {
        barElement.classList.remove("is-over");
    }
}

/**
 * 今日总览を更新する
 */
function updateOverviewDisplay() {
    const target = getCurrentTarget();
    const record = findRecordByDate(selectedDate);
    const totals = getTotalsFromRecord(record);

    const targetCalories = getCurrentTargetCalories(target);

    const dayTypeLabel = getCurrentDayTypeLabel();
    const calorieDiff = targetCalories - totals.calories;

    overviewDateTypeText.textContent = `${formatDisplayDate(selectedDate)}｜${dayTypeLabel}`;
    overviewCaloriesText.textContent = `${totals.calories} / ${targetCalories} kcal`;
    overviewCalorieDiffText.textContent = formatDiffText("热量", calorieDiff, "kcal");

    const proteinPercent = calculateProgressPercent(totals.protein, target.protein);
    const carbsPercent = calculateProgressPercent(totals.carbs, target.carbs);
    const fatPercent = calculateProgressPercent(totals.fat, target.fat);
    const caloriesPercent = calculateProgressPercent(totals.calories, targetCalories);

    updateProgressBar(proteinProgressText, proteinProgressBar, proteinPercent);
    updateProgressBar(carbsProgressText, carbsProgressBar, carbsPercent);
    updateProgressBar(fatProgressText, fatProgressBar, fatPercent);
    updateProgressBar(caloriesProgressText, caloriesProgressBar, caloriesPercent);
}

/**
 * 当前显示用の日类型ラベルを取得する
 *
 * @returns {string}
 */
function getCurrentDayTypeLabel() {
    if (targetCalculationModeSelect.value === "custom") {
        return DAY_TYPE_LABELS[customDayTypeSelect.value] || "自定义日";
    }

    return DAY_TYPE_LABELS[dayTypeSelect.value];
}

/**
 * localStorageから記録を取得する
 *
 * @returns {Array}
 */
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

/**
 * localStorageへ記録を保存する
 *
 * @param {Array} records - 记录数组
 */
function saveRecords(records) {
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
}

/**
 * localStorageから体重記録を取得する
 *
 * @returns {Array}
 */
function loadWeightRecords() {
    const savedText = localStorage.getItem(STORAGE_KEYS.weightRecords);

    if (!savedText) {
        return [];
    }

    try {
        return JSON.parse(savedText);
    } catch (error) {
        console.error("体重记录读取失败", error);
        return [];
    }
}

/**
 * localStorageへ体重記録を保存する
 *
 * @param {Array} weightRecords - 体重记录数组
 */
function saveWeightRecords(weightRecords) {
    localStorage.setItem(
        STORAGE_KEYS.weightRecords,
        JSON.stringify(weightRecords)
    );
}

/**
 * 指定日の体重記録を取得する
 *
 * @param {string} dateText - 日期文本
 * @returns {Object | null}
 */
function findWeightRecordByDate(dateText) {
    const weightRecords = loadWeightRecords();

    return weightRecords.find((record) => record.date === dateText) || null;
}

/**
 * 当前日期体重を保存する
 */
function saveSelectedDateWeight() {
    const weightKg = getNumberValue(dailyWeightInput);

    if (weightKg <= 0) {
        alert("请输入有效的体重。");
        return;
    }

    const weightRecords = loadWeightRecords();

    const newRecord = {
        date: selectedDate,
        weightKg,
    };

    const filteredRecords = weightRecords.filter((record) => {
        return record.date !== selectedDate;
    });

    filteredRecords.push(newRecord);
    filteredRecords.sort((a, b) => {
        return a.date.localeCompare(b.date);
    });

    saveWeightRecords(filteredRecords);
    updateWeightDisplay();

    alert("体重已保存");
}

/**
 * 指定週の体重記録を取得する
 *
 * @param {string} weekStartDateText - 週開始日
 * @returns {Array}
 */
function getWeightRecordsByWeekStart(weekStartDateText) {
    const weightRecords = loadWeightRecords();
    const weekStartDate = parseDateText(weekStartDateText);
    const weekEndDate = parseDateText(weekStartDateText);

    weekEndDate.setDate(weekEndDate.getDate() + 6);

    return weightRecords.filter((record) => {
        const recordDate = parseDateText(record.date);

        return recordDate >= weekStartDate && recordDate <= weekEndDate;
    });
}

/**
 * 体重平均を計算する
 *
 * @param {Array} records - 体重记录数组
 * @returns {number | null}
 */
function calculateAverageWeight(records) {
    if (!Array.isArray(records) || records.length === 0) {
        return null;
    }

    const total = records.reduce((sum, record) => {
        return sum + record.weightKg;
    }, 0);

    return Number((total / records.length).toFixed(2));
}

/**
 * 最初に体重記録がある週の開始日を取得する
 *
 * @returns {string | null}
 */
function getFirstRecordedWeekStartDateText() {
    const weightRecords = loadWeightRecords();

    if (weightRecords.length === 0) {
        return null;
    }

    const sortedRecords = [...weightRecords].sort((a, b) => {
        return a.date.localeCompare(b.date);
    });

    return getWeekStartDateText(sortedRecords[0].date);
}

/**
 * 差分表示を作成する
 *
 * @param {number | null} currentAverage - 本周平均
 * @param {number | null} compareAverage - 比较对象平均
 * @returns {string}
 */
function formatWeightDifference(currentAverage, compareAverage) {
    if (currentAverage === null || compareAverage === null) {
        return "-";
    }

    const difference = Number((currentAverage - compareAverage).toFixed(2));

    if (difference > 0) {
        return `+${difference} kg`;
    }

    if (difference < 0) {
        return `${difference} kg`;
    }

    return "±0 kg";
}

/**
 * 体重差分の色を更新する
 *
 * @param {HTMLElement} element - 表示元素
 * @param {string} text - 差分文字
 */
function updateWeightDifferenceClass(element, text) {
    element.classList.remove("weight-diff-down", "weight-diff-up", "weight-diff-flat");

    if (text.startsWith("-")) {
        element.classList.add("weight-diff-down");
        return;
    }

    if (text.startsWith("+")) {
        element.classList.add("weight-diff-up");
        return;
    }

    element.classList.add("weight-diff-flat");
}

/**
 * 体重表示を更新する
 */
function updateWeightDisplay() {
    const weightRecord = findWeightRecordByDate(selectedDate);

    weightDateText.textContent = formatDisplayDate(selectedDate);
    dailyWeightInput.value = weightRecord ? weightRecord.weightKg : "";

    const currentWeekStart = getWeekStartDateText(selectedDate);
    const previousWeekStart = getPreviousWeekStartDateText(selectedDate);
    const firstWeekStart = getFirstRecordedWeekStartDateText();

    const currentWeekAverage = calculateAverageWeight(
        getWeightRecordsByWeekStart(currentWeekStart)
    );

    const previousWeekAverage = calculateAverageWeight(
        getWeightRecordsByWeekStart(previousWeekStart)
    );

    const firstWeekAverage = firstWeekStart
        ? calculateAverageWeight(getWeightRecordsByWeekStart(firstWeekStart))
        : null;

    currentWeekAverageText.textContent = currentWeekAverage === null
        ? "-"
        : `${currentWeekAverage} kg`;

    previousWeekAverageText.textContent = previousWeekAverage === null
        ? "-"
        : `${previousWeekAverage} kg`;

    const weekDifference = formatWeightDifference(
        currentWeekAverage,
        previousWeekAverage
    );

    const firstWeekDifference = formatWeightDifference(
        currentWeekAverage,
        firstWeekAverage
    );

    weekDifferenceText.textContent = weekDifference;
    firstWeekDifferenceText.textContent = firstWeekDifference;

    updateWeightDifferenceClass(weekDifferenceText, weekDifference);
    updateWeightDifferenceClass(firstWeekDifferenceText, firstWeekDifference);
}

/**
 * v1.7 全データをエクスポートする
 *
 * 导出内容：
 * - 饮食记录
 * - 用户设置
 * - 体重记录
 */
function exportBackupData() {
    const backupData = {
        appName: "碳循环小记",
        version: "1.7",
        exportedAt: new Date().toISOString(),
        data: {
            records: loadRecords(),
            settings: loadSettings(),
            weightRecords: loadWeightRecords(),
        },
    };

    const backupText = JSON.stringify(backupData, null, 2);

    backupDataText.value = backupText;

    alert("备份数据已生成，请复制保存。");
}

/**
 * v1.7 备份文本をクリップボードへコピーする
 */
function copyBackupData() {
    const text = backupDataText.value.trim();

    if (!text) {
        alert("目前没有可复制的备份文本。请先点击「导出备份」。");
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => {
            alert("备份文本已复制。");
        })
        .catch(() => {
            backupDataText.focus();
            backupDataText.select();

            alert("自动复制失败，请手动复制备份文本。");
        });
}

/**
 * v1.7 バックアップデータをインポートする
 *
 * 导入会覆盖当前 localStorage 中的 App 数据
 */
function importBackupData() {
    const backupText = backupDataText.value.trim();

    if (!backupText) {
        alert("请先粘贴备份文本。");
        return;
    }

    let parsedData = null;

    try {
        parsedData = JSON.parse(backupText);
    } catch (error) {
        console.error("备份数据解析失败", error);
        alert("备份文本格式不正确，请确认复制完整。");
        return;
    }

    if (!validateBackupData(parsedData)) {
        alert("备份数据内容不完整，无法导入。");
        return;
    }

    const confirmed = confirm(
        "导入后会覆盖当前浏览器中的饮食记录、设置和体重记录。确定要导入吗？"
    );

    if (!confirmed) {
        return;
    }

    localStorage.setItem(
        STORAGE_KEYS.records,
        JSON.stringify(parsedData.data.records || [])
    );

    localStorage.setItem(
        STORAGE_KEYS.settings,
        JSON.stringify({
            ...DEFAULT_SETTINGS,
            ...(parsedData.data.settings || {}),
        })
    );

    localStorage.setItem(
        STORAGE_KEYS.weightRecords,
        JSON.stringify(parsedData.data.weightRecords || [])
    );

    fillTargetSettingsForm();
    renderCalendar();
    renderSelectedDateRecord();
    updateTargetDisplay();
    updateWeightDisplay();

    alert("数据导入完成。");
}

/**
 * v1.7 バックアップデータの形式を検証する
 *
 * @param {Object} backupData - 解析后的备份数据
 * @returns {boolean}
 */
function validateBackupData(backupData) {
    if (!backupData || typeof backupData !== "object") {
        return false;
    }

    if (!backupData.data || typeof backupData.data !== "object") {
        return false;
    }

    const records = backupData.data.records;
    const settings = backupData.data.settings;
    const weightRecords = backupData.data.weightRecords;

    if (!Array.isArray(records)) {
        return false;
    }

    if (!settings || typeof settings !== "object") {
        return false;
    }

    if (!Array.isArray(weightRecords)) {
        return false;
    }

    return true;
}

/**
 * 指定日の記録を取得する
 *
 * @param {string} dateText - yyyy-mm-dd
 * @returns {Object | null}
 */
function findRecordByDate(dateText) {
    const records = loadRecords();

    return records.find((record) => record.date === dateText) || null;
}

/**
 * 当前日期记录を保存する
 */
function saveSelectedDateRecord() {
    const mode = dietModeSelect.value;
    const dayType = dayTypeSelect.value;
    const targetSettings = buildTargetSettingsFromForm();
    const currentMeal = getCurrentMealInput();

    if (!validateMeal(currentMeal)) {
        alert("请至少输入一项有效的 P / C / F 数据。");
        return;
    }

    const target = getCurrentTarget();
    const targetCalories = getCurrentTargetCalories(target);

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
        targetMode: targetSettings.targetCalculationMode,
        mode,
        dayType,
        customDayType: targetSettings.customDayType,
        calorieOffset: targetSettings.calorieOffset,
        macroMethod: targetSettings.macroMethod,
        fixedProtein: targetSettings.fixedProtein,
        fixedFat: targetSettings.fixedFat,
        proteinPercent: targetSettings.proteinPercent,
        carbsPercent: targetSettings.carbsPercent,
        fatPercent: targetSettings.fatPercent,
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
    updateTargetDisplay();

    alert("餐食记录已保存");
}

/**
 * 餐食を追加または更新する
 *
 * @param {Array} meals - 既存餐食数组
 * @param {Object} currentMeal - 当前餐食
 * @returns {Array}
 */
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

/**
 * 餐食输入を検証する
 *
 * @param {Object} meal - 餐食数据
 * @returns {boolean}
 */
function validateMeal(meal) {
    return meal.protein > 0 || meal.carbs > 0 || meal.fat > 0;
}

/**
 * 当前日期记录を画面に表示する
 */
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

            <p>${getRecordTargetModeLabel(record)}</p>
            <p>目标：P ${record.targetProtein}g / C ${record.targetCarbs}g / F ${record.targetFat}g</p>
            <p>实际：P ${record.protein}g / C ${record.carbs}g / F ${record.fat}g</p>
            <p>${record.calories} / ${record.targetCalories} kcal</p>

            ${buildMealListHtml(record.meals)}
        </div>
    `;

    bindDeleteRecordButtons();
    bindMealActionButtons();
}

/**
 * 记录の目标模式表示テキストを作成する
 *
 * @param {Object} record - 当前日期记录
 * @returns {string}
 */
function getRecordTargetModeLabel(record) {
    if (record.targetMode === "custom") {
        const dayLabel = DAY_TYPE_LABELS[record.customDayType] || "自定义日";
        const offset = record.calorieOffset || 0;
        const offsetText = offset >= 0 ? `+${offset}` : `${offset}`;

        return `${TARGET_MODE_LABELS.custom}｜${dayLabel}｜TDEE ${offsetText} kcal`;
    }

    return `${TARGET_MODE_LABELS.classic}｜${MODE_LABELS[record.mode]}｜${DAY_TYPE_LABELS[record.dayType]}`;
}

/**
 * 餐食列表HTMLを作成する
 *
 * @param {Array} meals - 餐食数组
 * @returns {string}
 */
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

/**
 * 削除当天ボタンにイベントを設定する
 */
function bindDeleteRecordButtons() {
    const deleteButtons = document.querySelectorAll(".delete-button");

    deleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
            deleteRecordByDate(button.dataset.date);
        });
    });
}

/**
 * 餐食操作ボタンにイベントを設定する
 */
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

/**
 * 指定餐食の編集を開始する
 *
 * @param {number} mealId - 餐食ID
 */
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

/**
 * 指定餐食を削除する
 *
 * @param {number} mealId - 餐食ID
 */
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
    updateTargetDisplay();
}

/**
 * 指定日记录を削除する
 *
 * @param {string} dateText - yyyy-mm-dd
 */
function deleteRecordByDate(dateText) {
    const records = loadRecords();
    const filteredRecords = records.filter((record) => record.date !== dateText);

    saveRecords(filteredRecords);
    clearCurrentMealInput();
    renderCalendar();
    renderSelectedDateRecord();
    updateTargetDisplay();
}

/**
 * 选择日期后，清空当前输入框，并读取当天模式
 *
 * @param {Object | null} record - 当前日期记录
 */
function fillInputsFromRecord(record) {
    clearCurrentMealInput();

    if (!record) {
        updateDiffDisplay();
        updateOverviewDisplay();
        return;
    }

    restoreTargetSettingsFromRecord(record);

    updateTargetDisplay();
}

/**
 * 记录から目标設定を画面に反映する
 *
 * @param {Object} record - 当前日期记录
 */
function restoreTargetSettingsFromRecord(record) {
    targetCalculationModeSelect.value = record.targetMode || "classic";

    dietModeSelect.value = record.mode || "bulk";
    dayTypeSelect.value = record.dayType || "medium";

    customDayTypeSelect.value = record.customDayType || "low";
    macroMethodSelect.value = record.macroMethod || "fixed";

    fixedProteinInput.value = record.fixedProtein || fixedProteinInput.value;
    fixedFatInput.value = record.fixedFat || fixedFatInput.value;

    proteinPercentInput.value = record.proteinPercent || proteinPercentInput.value;
    carbsPercentInput.value = record.carbsPercent || carbsPercentInput.value;
    fatPercentInput.value = record.fatPercent || fatPercentInput.value;

    if (record.calorieOffset !== undefined) {
        setCalorieOffsetValue(record.calorieOffset);
    }

    toggleTargetModePanels();
}

/**
 * 热量调整値をセレクトに反映する
 *
 * @param {number} value - 热量调整
 */
function setCalorieOffsetValue(value) {
    const valueText = String(value);
    const optionExists = Array.from(calorieOffsetSelect.options).some((option) => {
        return option.value === valueText;
    });

    if (optionExists) {
        calorieOffsetSelect.value = valueText;
        manualCalorieOffsetInput.value = "";
    } else {
        calorieOffsetSelect.value = "manual";
        manualCalorieOffsetInput.value = value;
    }
}

/**
 * 日历を描画する
 */
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

/**
 * 記録配列を日付キーのMapに変換する
 *
 * @param {Array} records - 记录数组
 * @returns {Object}
 */
function buildRecordMap(records) {
    return records.reduce((map, record) => {
        map[record.date] = record;

        return map;
    }, {});
}

/**
 * 日历日期按钮にイベントを設定する
 */
function bindCalendarDayButtons() {
    const dayButtons = document.querySelectorAll(".calendar-day[data-date]");

    dayButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectDate(button.dataset.date);
        });
    });
}

/**
 * 日期を選択する
 *
 * @param {string} dateText - yyyy-mm-dd
 */
function selectDate(dateText) {
    selectedDate = dateText;

    const [year, month] = dateText.split("-").map(Number);
    calendarViewDate = new Date(year, month - 1, 1);

    const record = findRecordByDate(selectedDate);

    fillInputsFromRecord(record);
    renderCalendar();
    renderSelectedDateRecord();
    updateTargetDisplay();
    updateWeightDisplay();
}

/**
 * 前月へ移動する
 */
function moveToPrevMonth() {
    calendarViewDate = new Date(
        calendarViewDate.getFullYear(),
        calendarViewDate.getMonth() - 1,
        1
    );

    renderCalendar();
}

/**
 * 次月へ移動する
 */
function moveToNextMonth() {
    calendarViewDate = new Date(
        calendarViewDate.getFullYear(),
        calendarViewDate.getMonth() + 1,
        1
    );

    renderCalendar();
}

/**
 * 简介弹窗を開く
 */
function openIntroModal() {
    introModal.classList.remove("hidden");
}

/**
 * 简介弹窗を閉じる
 */
function closeIntroModal() {
    introModal.classList.add("hidden");
}

/**
 * 设置弹窗を開く
 */
function openSettingsModal() {
    fillSettingsForm();
    updateSettingsPreview();
    settingsModal.classList.remove("hidden");
}

/**
 * 设置弹窗を閉じる
 */
function closeSettingsModal() {
    settingsModal.classList.add("hidden");
}

/**
 * 保存済み設定をフォームに反映する
 */
function fillSettingsForm() {
    const settings = loadSettings();

    userGenderSelect.value = settings.gender;
    userAgeInput.value = settings.age;
    userHeightInput.value = settings.heightCm;
    userWeightInput.value = settings.weightKg;
    userBodyFatInput.value = settings.bodyFatRate;
    activityLevelSelect.value = String(settings.activityLevel);
}

/**
 * フォームから設定を作成する
 *
 * @returns {typeof DEFAULT_SETTINGS}
 */
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

/**
 * 设置プレビューを更新する
 */
function updateSettingsPreview() {
    const settings = buildSettingsFromForm();
    const bmr = calculateBmr(settings);
    const tdee = calculateTdee(bmr, settings.activityLevel);

    bmrResultText.textContent = `${bmr} kcal`;
    tdeeResultText.textContent = `${tdee} kcal`;
}

/**
 * 设置を保存する
 */
function saveUserSettings() {
    const personalSettings = buildSettingsFromForm();
    const settings = {
        ...loadSettings(),
        ...personalSettings,
        ...buildTargetSettingsFromForm(),
    };

    if (!validateSettings(settings)) {
        alert("请确认年龄、身高、体重、体脂率是否正确。");
        return;
    }

    saveSettings(settings);
    updateTargetDisplay();
    closeSettingsModal();

    alert("个人数据已保存");
}

/**
 * 设置値を検証する
 *
 * @param {typeof DEFAULT_SETTINGS} settings - 用户设置
 * @returns {boolean}
 */
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

/**
 * 保存済みの目标設定をフォームに反映する
 */
function fillTargetSettingsForm() {
    const settings = loadSettings();

    targetCalculationModeSelect.value = settings.targetCalculationMode;
    customDayTypeSelect.value = settings.customDayType;
    macroMethodSelect.value = settings.macroMethod;

    fixedProteinInput.value = settings.fixedProtein;
    fixedFatInput.value = settings.fixedFat;

    proteinPercentInput.value = settings.proteinPercent;
    carbsPercentInput.value = settings.carbsPercent;
    fatPercentInput.value = settings.fatPercent;

    setCalorieOffsetValue(settings.calorieOffset);
    toggleTargetModePanels();
}

/**
 * 目标設定フォームの表示を切り替える
 */
function toggleTargetModePanels() {
    if (targetCalculationModeSelect.value === "custom") {
        classicTargetPanel.classList.add("hidden");
        customTargetPanel.classList.remove("hidden");
    } else {
        classicTargetPanel.classList.remove("hidden");
        customTargetPanel.classList.add("hidden");
    }

    if (calorieOffsetSelect.value === "manual") {
        manualOffsetGroup.classList.remove("hidden");
    } else {
        manualOffsetGroup.classList.add("hidden");
    }

    if (macroMethodSelect.value === "percent") {
        fixedMacroPanel.classList.add("hidden");
        percentMacroPanel.classList.remove("hidden");
    } else {
        fixedMacroPanel.classList.remove("hidden");
        percentMacroPanel.classList.add("hidden");
    }

    updateMacroPercentHelp();
}

/**
 * 百分比合計のヘルプ表示を更新する
 */
function updateMacroPercentHelp() {
    const totalPercent = getNumberValue(proteinPercentInput)
        + getNumberValue(carbsPercentInput)
        + getNumberValue(fatPercentInput);

    macroPercentHelp.textContent = `当前合计：${totalPercent}%（建议为 100%）`;

    if (macroMethodSelect.value === "percent" && totalPercent !== 100) {
        macroPercentHelp.classList.add("is-warning");
    } else {
        macroPercentHelp.classList.remove("is-warning");
    }
}

/**
 * 目标設定を保存して画面更新する
 */
function saveTargetSettingsAndRefresh() {
    const settings = {
        ...loadSettings(),
        ...buildTargetSettingsFromForm(),
    };

    saveSettings(settings);
    toggleTargetModePanels();
    updateTargetDisplay();
}

/**
 * 目标設定イベントを設定する
 */
function bindTargetSettingEvents() {
    const targetSettingElements = [
        targetCalculationModeSelect,
        dietModeSelect,
        dayTypeSelect,
        customDayTypeSelect,
        calorieOffsetSelect,
        manualCalorieOffsetInput,
        macroMethodSelect,
        fixedProteinInput,
        fixedFatInput,
        proteinPercentInput,
        carbsPercentInput,
        fatPercentInput,
    ];

    targetSettingElements.forEach((element) => {
        element.addEventListener("input", saveTargetSettingsAndRefresh);
        element.addEventListener("change", saveTargetSettingsAndRefresh);
    });
}

/**
 * 餐食入力イベントを設定する
 */
function bindMealInputEvents() {
    actualProteinInput.addEventListener("input", () => {
        updateDiffDisplay();
        updateOverviewDisplay();
    });

    actualCarbsInput.addEventListener("input", () => {
        updateDiffDisplay();
        updateOverviewDisplay();
    });

    actualFatInput.addEventListener("input", () => {
        updateDiffDisplay();
        updateOverviewDisplay();
    });
}

saveButton.addEventListener("click", saveSelectedDateRecord);

if (saveWeightButton) {
    saveWeightButton.addEventListener("click", saveSelectedDateWeight);
}

if (exportDataButton) {
    exportDataButton.addEventListener("click", exportBackupData);
}

if (importDataButton) {
    importDataButton.addEventListener("click", importBackupData);
}

if (copyBackupButton) {
    copyBackupButton.addEventListener("click", copyBackupData);
}

prevMonthButton.addEventListener("click", moveToPrevMonth);
nextMonthButton.addEventListener("click", moveToNextMonth);
openIntroButton.addEventListener("click", openIntroModal);
closeIntroButton.addEventListener("click", closeIntroModal);

openSettingsButton.addEventListener("click", openSettingsModal);
if (openIntroButtonInPage) {
    openIntroButtonInPage.addEventListener("click", openIntroModal);
}

if (openSettingsButtonInPage) {
    openSettingsButtonInPage.addEventListener("click", openSettingsModal);
}
closeSettingsButton.addEventListener("click", closeSettingsModal);
saveSettingsButton.addEventListener("click", saveUserSettings);

userGenderSelect.addEventListener("change", updateSettingsPreview);
userAgeInput.addEventListener("input", updateSettingsPreview);
userHeightInput.addEventListener("input", updateSettingsPreview);
userWeightInput.addEventListener("input", updateSettingsPreview);
userBodyFatInput.addEventListener("input", updateSettingsPreview);
activityLevelSelect.addEventListener("change", updateSettingsPreview);

bindPageNavigationEvents();
fillTargetSettingsForm();
bindTargetSettingEvents();
bindMealInputEvents();

renderCalendar();
renderSelectedDateRecord();
updateTargetDisplay();
updateWeightDisplay();

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js");
    });
}