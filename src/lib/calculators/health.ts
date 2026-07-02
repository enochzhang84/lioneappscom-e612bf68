// 体育健康计算器：BMI / BMR/TDEE / 运动消耗 / 减脂目标
import type { CalculatorConfig } from "./types";

const BMI: CalculatorConfig = {
  key: "bmi",
  category: "health",
  title: "BMI 身体质量指数计算器",
  intro: "输入身高体重，计算 BMI (Body Mass Index) 与健康区间，判断是否超重或过轻。",
  inputs: [
    { key: "height", label: "身高", unit: "cm", defaultValue: 170, min: 50, max: 250, step: 0.1 },
    { key: "weight", label: "体重", unit: "kg", defaultValue: 65, min: 10, max: 300, step: 0.1 },
  ],
  outputs: [
    { key: "bmi", label: "BMI", primary: true },
    { key: "category", label: "体重分类" },
    { key: "idealMin", label: "理想体重下限", unit: "kg" },
    { key: "idealMax", label: "理想体重上限", unit: "kg" },
  ],
  compute: (v) => {
    const h = (Number(v.height) || 0) / 100;
    const w = Number(v.weight) || 0;
    if (h <= 0) return { bmi: 0, category: "-", idealMin: 0, idealMax: 0 };
    const bmi = w / (h * h);
    let cat = "正常";
    if (bmi < 18.5) cat = "偏瘦";
    else if (bmi < 24) cat = "正常";
    else if (bmi < 28) cat = "超重";
    else cat = "肥胖";
    return {
      bmi: Math.round(bmi * 10) / 10,
      category: cat,
      idealMin: Math.round(18.5 * h * h * 10) / 10,
      idealMax: Math.round(23.9 * h * h * 10) / 10,
    };
  },
  formulas: [
    "BMI = 体重(kg) ÷ 身高²(m²)",
    "亚洲成人分类：< 18.5 偏瘦；18.5-23.9 正常；24-27.9 超重；≥ 28 肥胖",
  ],
  examples: [
    { label: "170cm / 65kg", values: { height: 170, weight: 65 } },
    { label: "165cm / 55kg", values: { height: 165, weight: 55 } },
    { label: "180cm / 85kg", values: { height: 180, weight: 85 } },
  ],
  faqs: [
    { q: "BMI 有什么局限？", a: "BMI 未区分脂肪和肌肉，健身人群、老人、孕妇结果仅供参考。" },
    { q: "BMI 多少算健康？", a: "亚洲成人推荐 18.5-23.9。世界卫生组织标准放宽到 18.5-24.9。" },
  ],
};

const CALORIE: CalculatorConfig = {
  key: "calorie",
  category: "health",
  title: "每日卡路里 BMR/TDEE 计算器",
  intro: "使用 Mifflin-St Jeor 公式估算基础代谢率 (BMR) 与每日总消耗 (TDEE)，规划减脂、增肌摄入。",
  inputs: [
    { key: "gender", label: "性别", type: "select", defaultValue: "male",
      options: [{ value: "male", label: "男" }, { value: "female", label: "女" }] },
    { key: "age", label: "年龄", unit: "岁", defaultValue: 30, min: 10, max: 100, step: 1 },
    { key: "height", label: "身高", unit: "cm", defaultValue: 170, min: 100, max: 220, step: 0.1 },
    { key: "weight", label: "体重", unit: "kg", defaultValue: 65, min: 30, max: 200, step: 0.1 },
    { key: "activity", label: "活动量", type: "select", defaultValue: "1.55", options: [
      { value: "1.2", label: "久坐 (无运动)" },
      { value: "1.375", label: "轻度 (每周 1-3 次)" },
      { value: "1.55", label: "中度 (每周 3-5 次)" },
      { value: "1.725", label: "高强度 (每周 6-7 次)" },
      { value: "1.9", label: "极高 (体力劳动+训练)" },
    ] },
  ],
  outputs: [
    { key: "bmr", label: "BMR 基础代谢", unit: "kcal/天", format: "int" },
    { key: "tdee", label: "TDEE 每日总消耗", unit: "kcal/天", format: "int", primary: true },
    { key: "cut", label: "减脂建议摄入 (-20%)", unit: "kcal/天", format: "int" },
    { key: "bulk", label: "增肌建议摄入 (+15%)", unit: "kcal/天", format: "int" },
  ],
  compute: (v) => {
    const age = Number(v.age) || 0;
    const h = Number(v.height) || 0;
    const w = Number(v.weight) || 0;
    const act = Number(v.activity) || 1.2;
    const male = v.gender === "male";
    const bmr = 10 * w + 6.25 * h - 5 * age + (male ? 5 : -161);
    const tdee = bmr * act;
    return { bmr, tdee, cut: tdee * 0.8, bulk: tdee * 1.15 };
  },
  formulas: [
    "男：BMR = 10×W + 6.25×H − 5×Age + 5",
    "女：BMR = 10×W + 6.25×H − 5×Age − 161",
    "TDEE = BMR × 活动系数",
  ],
  faqs: [
    { q: "减脂应该吃多少？", a: "TDEE − 300~500 kcal，每周降 0.3-0.5kg 较健康。极端节食易反弹。" },
    { q: "活动系数怎么选？", a: "选低不选高，避免高估。以一周实际运动次数为准。" },
  ],
};

const EXERCISE_BURN: CalculatorConfig = {
  key: "exercise-burn",
  category: "health",
  title: "运动卡路里消耗计算器",
  intro: "基于 MET 值和体重，估算不同运动方式的卡路里消耗。数据参考 Compendium of Physical Activities。",
  inputs: [
    { key: "weight", label: "体重", unit: "kg", defaultValue: 65, min: 20, max: 200, step: 0.1 },
    { key: "minutes", label: "运动时长", unit: "分钟", defaultValue: 30, min: 1, max: 600, step: 1 },
    { key: "met", label: "运动类型 (MET)", type: "select", defaultValue: "8.0", options: [
      { value: "3.5", label: "散步 慢速 (3.5)" },
      { value: "4.3", label: "快走 (4.3)" },
      { value: "8.0", label: "慢跑 (8.0)" },
      { value: "11.0", label: "跑步 10km/h (11.0)" },
      { value: "7.5", label: "骑行 中速 (7.5)" },
      { value: "8.0", label: "游泳 蛙泳 (8.0)" },
      { value: "6.0", label: "力量训练 (6.0)" },
      { value: "7.3", label: "篮球 (7.3)" },
      { value: "7.0", label: "羽毛球 (7.0)" },
      { value: "3.0", label: "瑜伽 (3.0)" },
      { value: "5.5", label: "跳绳 慢 (5.5)" },
      { value: "12.3", label: "跳绳 快 (12.3)" },
    ] },
  ],
  outputs: [
    { key: "kcal", label: "消耗热量", unit: "kcal", format: "int", primary: true },
    { key: "perHour", label: "每小时消耗", unit: "kcal/h", format: "int" },
    { key: "fatGrams", label: "相当于脂肪", unit: "克", format: "int", hint: "1 克脂肪 ≈ 7.7 kcal" },
  ],
  compute: (v) => {
    const w = Number(v.weight) || 0;
    const m = Number(v.minutes) || 0;
    const met = Number(v.met) || 0;
    const kcal = met * w * (m / 60);
    return { kcal, perHour: met * w, fatGrams: kcal / 7.7 };
  },
  formulas: [
    "消耗 kcal = MET × 体重(kg) × 时长(小时)",
    "1 kg 脂肪 ≈ 7700 kcal",
  ],
  faqs: [
    { q: "什么是 MET？", a: "MET 代表代谢当量，1 MET = 静坐时的能耗率 (~1 kcal/kg/h)。数值越高越激烈。" },
  ],
};

const WEIGHT_LOSS: CalculatorConfig = {
  key: "weight-loss",
  category: "health",
  title: "减脂目标计算器",
  intro: "设定目标体重与周期，计算每日所需热量缺口，评估目标是否合理。",
  inputs: [
    { key: "current", label: "当前体重", unit: "kg", defaultValue: 75, min: 30, max: 300, step: 0.1 },
    { key: "target", label: "目标体重", unit: "kg", defaultValue: 65, min: 30, max: 300, step: 0.1 },
    { key: "weeks", label: "计划周期", unit: "周", defaultValue: 12, min: 1, max: 104, step: 1 },
    { key: "tdee", label: "当前 TDEE", unit: "kcal/天", defaultValue: 2200, min: 800, step: 10, hint: "可先用卡路里计算器估算" },
  ],
  outputs: [
    { key: "loss", label: "需减重", unit: "kg" },
    { key: "perWeek", label: "每周需减", unit: "kg" },
    { key: "deficit", label: "每日热量缺口", unit: "kcal", format: "int", primary: true },
    { key: "intake", label: "建议每日摄入", unit: "kcal", format: "int" },
    { key: "safety", label: "健康度评估" },
  ],
  compute: (v) => {
    const cur = Number(v.current) || 0;
    const tgt = Number(v.target) || 0;
    const w = Math.max(1, Number(v.weeks) || 1);
    const tdee = Number(v.tdee) || 0;
    const loss = cur - tgt;
    const perWeek = loss / w;
    const deficit = (loss * 7700) / (w * 7);
    const intake = tdee - deficit;
    let safety = "健康范围";
    if (perWeek > 1) safety = "过快 (每周 >1kg，易掉肌肉)";
    else if (perWeek < 0) safety = "增重计划";
    else if (intake < 1200) safety = "过低 (男 <1500 / 女 <1200 不建议)";
    return {
      loss: Math.round(loss * 10) / 10,
      perWeek: Math.round(perWeek * 100) / 100,
      deficit,
      intake,
      safety,
    };
  },
  formulas: [
    "1 kg 脂肪 ≈ 7700 kcal",
    "每日热量缺口 = 需减公斤 × 7700 ÷ 天数",
    "健康减脂：每周 0.3-1 kg，日缺口 300-750 kcal",
  ],
  faqs: [
    { q: "减脂速度多快合适？", a: "每周 0.3-1 kg。太快掉肌肉、代谢下降、易反弹。" },
  ],
};

export const HEALTH_CALCS: CalculatorConfig[] = [BMI, CALORIE, EXERCISE_BURN, WEIGHT_LOSS];
