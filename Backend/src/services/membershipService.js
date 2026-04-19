const User = require("../model/User");
const Membership = require("../model/Membership");
const Payment = require("../model/Payment");
const {
  calculateMembershipAmount,
  normalizePlan,
  normalizeDuration,
  toTitleCase,
} = require("../utils/membershipPricing");

const normalizePaymentMethod = (method) => {
  if (!method || typeof method !== "string") return "Card";
  const normalized = method.toLowerCase();

  if (normalized === "upi") return "UPI";
  if (normalized === "netbanking") return "NetBanking";
  if (normalized === "cash") return "Cash";

  // card, wallet, emi and unknown methods are grouped into Card
  return "Card";
};

const applyMembershipPurchase = async ({
  userId,
  plan,
  duration,
  autoRenew = false,
  gateway = {},
}) => {
  const normalizedPlan = normalizePlan(plan);
  const normalizedDuration = normalizeDuration(duration);

  if (!normalizedPlan || !normalizedDuration) {
    throw new Error("Invalid membership plan or duration");
  }

  const billing = calculateMembershipAmount(normalizedPlan, normalizedDuration);
  if (!billing) {
    throw new Error("Unable to calculate membership amount");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const isRenewal = String(user.membershipType || "").toLowerCase() === normalizedPlan;
  const newMonthsRemaining = isRenewal
    ? Number(user.membershipDuration?.months_remaining || 0) + normalizedDuration
    : normalizedDuration;

  const newEndDate = new Date(now);
  newEndDate.setMonth(newEndDate.getMonth() + newMonthsRemaining);

  user.membershipType = toTitleCase(normalizedPlan);
  user.membershipDuration.months_remaining = newMonthsRemaining;
  user.membershipDuration.end_date = newEndDate;
  user.membershipDuration.last_renewal_date = now;
  user.membershipDuration.auto_renew = Boolean(autoRenew);
  user.status = "Active";

  if (!isRenewal) {
    user.membershipDuration.start_date = now;
  }

  if (!user.fitness_goals) {
    user.fitness_goals = {
      calorie_goal: 2200,
      protein_goal: 90,
      weight_goal: user.weight || 70,
    };
  } else if (
    user.fitness_goals.weight_goal === null ||
    user.fitness_goals.weight_goal === undefined
  ) {
    user.fitness_goals.weight_goal = user.weight || 70;
  }

  const membershipRecord = new Membership({
    user_id: user._id,
    plan: normalizedPlan,
    duration: normalizedDuration,
    start_date: now,
    end_date: newEndDate,
    price: billing.finalAmount,
    payment_method: "credit_card",
    card_last_four: gateway.cardLastFour || null,
    status: "Active",
    isRenewal,
  });

  const paymentRecord = new Payment({
    userId: user._id,
    membershipId: membershipRecord._id,
    amount: billing.finalAmount,
    currency: billing.currency,
    paymentFor: "Membership",
    paymentMethod: normalizePaymentMethod(gateway.paymentMethod),
    status: "Success",
    paymentDate: now,
    membershipPlan: normalizedPlan,
    isRenewal,
    provider: gateway.provider || null,
    providerOrderId: gateway.orderId || null,
    providerPaymentId: gateway.paymentId || undefined,
    providerSignature: gateway.signature || null,
    receipt: gateway.receipt || null,
    gatewayStatus: gateway.status || null,
    verifiedAt: gateway.verifiedAt || now,
    gatewayPayload: gateway.raw || null,
  });

  if (!Array.isArray(user.purchase_history)) {
    user.purchase_history = [];
  }
  user.purchase_history.push(paymentRecord._id);

  await Promise.all([user.save(), membershipRecord.save(), paymentRecord.save()]);

  return {
    user,
    membershipRecord,
    paymentRecord,
    billing,
  };
};

module.exports = {
  applyMembershipPurchase,
  normalizePaymentMethod,
};
