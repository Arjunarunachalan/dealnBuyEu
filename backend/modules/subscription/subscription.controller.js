import SubscriptionPlan from "./SubscriptionPlan.model.js";
import UserSubscription from "./UserSubscription.model.js";
import Post from "../post/Post.model.js";

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: GET /api/subscriptions/plans
// Returns all active plans for the request country
// ─────────────────────────────────────────────────────────────────────────────
export const getPlans = async (req, res) => {
  try {
    const country = req.country;

    const plans = await SubscriptionPlan.find({ country, isActive: true })
      .sort({ unlockThreshold: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch plans.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED: GET /api/subscriptions/my
// Returns user's active subscription + their post count
// ─────────────────────────────────────────────────────────────────────────────
export const getMySubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const country = req.country;

    const now = new Date();

    // Mark any expired subscriptions
    await UserSubscription.updateMany(
      { userId, status: "active", expiresAt: { $lt: now } },
      { $set: { status: "expired" } }
    );

    const [subscription, postCount] = await Promise.all([
      UserSubscription.findOne({ userId, status: "active" }).lean(),
      Post.countDocuments({ userId, country, isActive: true }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        subscription,
        postCount,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch subscription.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED: POST /api/subscriptions/activate-free
// Activate a plan using post count (free path)
// body: { planId: "silver" | "golden" | "platinum" }
// ─────────────────────────────────────────────────────────────────────────────
export const activateFreePlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const country = req.country;
    const { planId } = req.body;

    if (!planId || !["silver", "golden", "platinum"].includes(planId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid planId. Must be silver, golden, or platinum.",
      });
    }

    // Fetch plan definition
    const plan = await SubscriptionPlan.findOne({ planId, country, isActive: true }).lean();
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found for your country.",
      });
    }

    // Count user's posts
    const postCount = await Post.countDocuments({ userId, country, isActive: true });

    if (postCount < plan.unlockThreshold) {
      return res.status(403).json({
        success: false,
        message: `You need at least ${plan.unlockThreshold} active posts to unlock the ${plan.name} plan. You currently have ${postCount}.`,
        data: { required: plan.unlockThreshold, current: postCount },
      });
    }

    // Cancel any existing active subscription
    await UserSubscription.updateMany(
      { userId, status: "active" },
      { $set: { status: "cancelled" } }
    );

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.validityDays);

    const subscription = await UserSubscription.create({
      userId,
      planId,
      country,
      status: "active",
      activatedVia: "posts",
      activatedAt: new Date(),
      expiresAt,
    });

    return res.status(201).json({
      success: true,
      message: `${plan.name} plan activated successfully via posts!`,
      data: subscription,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to activate free plan.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED: POST /api/subscriptions/initiate-payment
// Returns the Stripe payment URL for the chosen plan
// body: { planId: "silver" | "golden" | "platinum" }
// ─────────────────────────────────────────────────────────────────────────────
export const initiatePayment = async (req, res) => {
  try {
    const country = req.country;
    const userId = req.user._id;
    const { planId } = req.body;

    if (!planId || !["silver", "golden", "platinum"].includes(planId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid planId.",
      });
    }

    const plan = await SubscriptionPlan.findOne({ planId, country, isActive: true }).lean();
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found for your country.",
      });
    }

    // Stripe URL from env — placeholder until real Stripe keys are added
    const stripeUrl = process.env.STRIPE_PAYMENT_URL;
    if (!stripeUrl) {
      return res.status(503).json({
        success: false,
        message: "Payment system is not configured yet. Please try again later.",
      });
    }

    // Build redirect URL with metadata for post-payment confirmation
    const paymentUrl = `${stripeUrl}?client_reference_id=${userId}&metadata[planId]=${planId}&metadata[country]=${country}`;

    return res.status(200).json({
      success: true,
      message: "Payment URL generated.",
      data: {
        paymentUrl,
        plan: {
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to initiate payment.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED: POST /api/subscriptions/confirm-payment
// Called after Stripe success redirect to activate the plan
// body: { planId, paymentRef }
// ─────────────────────────────────────────────────────────────────────────────
export const confirmPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const country = req.country;
    const { planId, paymentRef } = req.body;

    if (!planId || !["silver", "golden", "platinum"].includes(planId)) {
      return res.status(400).json({ success: false, message: "Invalid planId." });
    }

    if (!paymentRef) {
      return res.status(400).json({ success: false, message: "Payment reference is required." });
    }

    const plan = await SubscriptionPlan.findOne({ planId, country, isActive: true }).lean();
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found." });
    }

    // Cancel any existing active subscription
    await UserSubscription.updateMany(
      { userId, status: "active" },
      { $set: { status: "cancelled" } }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.validityDays);

    const subscription = await UserSubscription.create({
      userId,
      planId,
      country,
      status: "active",
      activatedVia: "payment",
      activatedAt: new Date(),
      expiresAt,
      paymentRef,
    });

    return res.status(201).json({
      success: true,
      message: `${plan.name} activated via payment!`,
      data: subscription,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to confirm payment.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET /api/admin/subscriptions/plans
// ─────────────────────────────────────────────────────────────────────────────
export const adminGetPlans = async (req, res) => {
  try {
    const country = req.country;
    const plans = await SubscriptionPlan.find({ country }).sort({ unlockThreshold: 1 }).lean();
    return res.status(200).json({ success: true, data: plans });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: PATCH /api/admin/subscriptions/plans/:id
// ─────────────────────────────────────────────────────────────────────────────
export const adminUpdatePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const allowed = [
      "name", "description", "features", "price",
      "unlockThreshold", "validityDays", "boostsPerMonth", "isActive",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update." });
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(id, updates, { new: true }).lean();

    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Plan updated successfully.",
      data: plan,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
