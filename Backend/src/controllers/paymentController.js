const crypto = require("crypto");
const https = require("https");
const Payment = require("../model/Payment");
const User = require("../model/User");
const {
  calculateMembershipAmount,
  normalizePlan,
  normalizeDuration,
} = require("../utils/membershipPricing");
const {
  applyMembershipPurchase,
  normalizePaymentMethod,
} = require("../services/membershipService");

const getRazorpayCredentials = () => ({
  keyId: process.env.RAZORPAY_KEY_ID || process.env.RZP_TEST_KEY,
  keySecret: process.env.RAZORPAY_KEY_SECRET || process.env.RZP_TEST_SECRET,
});

const buildBasicAuthHeader = (keyId, keySecret) => {
  const encoded = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return `Basic ${encoded}`;
};

const razorpayRequest = ({ method, path, body, keyId, keySecret }) =>
  new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: "api.razorpay.com",
      port: 443,
      path,
      method,
      headers: {
        Authorization: buildBasicAuthHeader(keyId, keySecret),
        "Content-Type": "application/json",
      },
    };

    if (payload) {
      options.headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const request = https.request(options, (response) => {
      let raw = "";
      response.on("data", (chunk) => {
        raw += chunk;
      });
      response.on("end", () => {
        let parsed = {};
        try {
          parsed = raw ? JSON.parse(raw) : {};
        } catch (error) {
          parsed = { raw };
        }

        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(parsed);
          return;
        }

        const error = new Error(parsed.error?.description || "Razorpay API request failed");
        error.statusCode = response.statusCode;
        error.details = parsed;
        reject(error);
      });
    });

    request.on("error", reject);
    if (payload) request.write(payload);
    request.end();
  });

const timingSafeCompare = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ""), "utf8");
  const rightBuffer = Buffer.from(String(right || ""), "utf8");
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { keyId, keySecret } = getRazorpayCredentials();
    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    const normalizedPlan = normalizePlan(req.body?.plan);
    const normalizedDuration = normalizeDuration(req.body?.duration);
    const autoRenew = Boolean(req.body?.autoRenew);

    if (!normalizedPlan || !normalizedDuration) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan or duration.",
      });
    }

    const billing = calculateMembershipAmount(normalizedPlan, normalizedDuration);
    if (!billing) {
      return res.status(400).json({
        success: false,
        message: "Unable to calculate payment amount.",
      });
    }

    const receipt = `gmr_${req.user._id}_${Date.now()}`.slice(0, 40);
    const order = await razorpayRequest({
      method: "POST",
      path: "/v1/orders",
      body: {
        amount: billing.finalAmount * 100,
        currency: billing.currency,
        receipt,
        notes: {
          userId: String(req.user._id),
          plan: billing.plan,
          duration: String(billing.duration),
          autoRenew: String(autoRenew),
        },
      },
      keyId,
      keySecret,
    });

    return res.json({
      success: true,
      keyId,
      order,
      meta: {
        plan: billing.plan,
        duration: billing.duration,
        amount: billing.finalAmount,
        currency: billing.currency,
        autoRenew,
      },
    });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create Razorpay order.",
      details: error.details || null,
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { keyId, keySecret } = getRazorpayCredentials();
    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay is not configured.",
      });
    }

    const orderId = req.body?.orderId;
    const paymentId = req.body?.paymentId;
    const signature = req.body?.signature;
    const plan = normalizePlan(req.body?.plan);
    const duration = normalizeDuration(req.body?.duration);
    const autoRenew = Boolean(req.body?.autoRenew);

    if (!orderId || !paymentId || !signature || !plan || !duration) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification fields.",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (!timingSafeCompare(expectedSignature, signature)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    const alreadyProcessed = await Payment.findOne({
      provider: "Razorpay",
      providerPaymentId: paymentId,
      status: "Success",
    });

    if (alreadyProcessed) {
      const existingUser = await User.findById(req.user._id || req.user.id).select(
        "membershipType membershipDuration status"
      );
      return res.json({
        success: true,
        message: "Payment already verified.",
        paymentId: alreadyProcessed._id,
        user: existingUser,
      });
    }

    const billing = calculateMembershipAmount(plan, duration);
    if (!billing) {
      return res.status(400).json({
        success: false,
        message: "Unable to calculate billing for verification.",
      });
    }

    const paymentDetails = await razorpayRequest({
      method: "GET",
      path: `/v1/payments/${paymentId}`,
      keyId,
      keySecret,
    });

    if (paymentDetails.order_id !== orderId) {
      return res.status(400).json({
        success: false,
        message: "Payment does not belong to the expected order.",
      });
    }

    const paidAmount = Number(paymentDetails.amount || 0) / 100;
    if (paidAmount !== billing.finalAmount) {
      return res.status(400).json({
        success: false,
        message: "Paid amount does not match expected amount.",
      });
    }

    const result = await applyMembershipPurchase({
      userId: req.user._id || req.user.id,
      plan,
      duration,
      autoRenew,
      gateway: {
        provider: "Razorpay",
        orderId,
        paymentId,
        signature,
        paymentMethod: normalizePaymentMethod(paymentDetails.method),
        cardLastFour: paymentDetails.card?.last4 || null,
        receipt: paymentDetails.notes?.receipt || null,
        status: paymentDetails.status || "captured",
        verifiedAt: new Date(),
        raw: paymentDetails,
      },
    });

    if (req.session && req.session.user) {
      req.session.user.membershipDuration = result.user.membershipDuration;
      req.session.user.membershipType = result.user.membershipType;
      req.session.user.status = result.user.status;
    }

    return res.json({
      success: true,
      message: "Payment verified and membership updated.",
      user: {
        membershipType: result.user.membershipType,
        membershipDuration: result.user.membershipDuration,
        status: result.user.status,
      },
      payment: {
        id: result.paymentRecord._id,
        amount: result.paymentRecord.amount,
        method: result.paymentRecord.paymentMethod,
      },
    });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Payment verification failed.",
      details: error.details || null,
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
