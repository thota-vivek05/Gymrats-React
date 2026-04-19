const PLAN_RATES = {
  basic: 299,
  gold: 599,
  platinum: 999,
};

const DURATION_DISCOUNTS = {
  1: 0,
  3: 0.15,
  6: 0.25,
  12: 0.33,
};

const VALID_DURATIONS = Object.keys(DURATION_DISCOUNTS).map(Number);
const VALID_PLANS = Object.keys(PLAN_RATES);

const toTitleCase = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const normalizePlan = (plan) => {
  if (!plan || typeof plan !== "string") return null;
  const normalized = plan.trim().toLowerCase();
  return VALID_PLANS.includes(normalized) ? normalized : null;
};

const normalizeDuration = (duration) => {
  const parsed = Number(duration);
  if (!Number.isInteger(parsed)) return null;
  return VALID_DURATIONS.includes(parsed) ? parsed : null;
};

const calculateMembershipAmount = (plan, duration) => {
  const normalizedPlan = normalizePlan(plan);
  const normalizedDuration = normalizeDuration(duration);

  if (!normalizedPlan || !normalizedDuration) {
    return null;
  }

  const baseAmount = PLAN_RATES[normalizedPlan] * normalizedDuration;
  const discountPct = DURATION_DISCOUNTS[normalizedDuration] || 0;
  const finalAmount = Math.round(baseAmount * (1 - discountPct));

  return {
    plan: normalizedPlan,
    planTitle: toTitleCase(normalizedPlan),
    duration: normalizedDuration,
    baseAmount,
    discountPct,
    finalAmount,
    currency: "INR",
  };
};

module.exports = {
  PLAN_RATES,
  DURATION_DISCOUNTS,
  VALID_DURATIONS,
  VALID_PLANS,
  toTitleCase,
  normalizePlan,
  normalizeDuration,
  calculateMembershipAmount,
};
