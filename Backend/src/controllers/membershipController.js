const User = require('../model/User');
const Trainer = require('../model/Trainer');
const Payment = require('../model/Payment');
const Membership = require('../model/Membership');
// Extend user membership
// Extend user membership


// Inside your extendMembership function...
// Extend user membership
const extendMembership = async (req, res) => {
    try {
        const { additionalMonths, autoRenew } = req.body;
        
        // Support both JWT (req.user) and Session (req.session)
        const userId = req.user ? (req.user._id || req.user.id) : (req.session?.user?.id);

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // ==========================================
        // 1. DYNAMIC AMOUNT CALCULATION
        // ==========================================
        const months = parseInt(additionalMonths) || 1;
        const userPlan = user.membershipType ? user.membershipType.toLowerCase() : 'basic';

        // NEW PRICING RULES
        const monthlyRates = {
            basic: 299,     // ₹299/month
            gold: 599,      // ₹599/month
            platinum: 999   // ₹999/month
        };

        const ratePerMonth = monthlyRates[userPlan] || 299;
        let totalAmount = ratePerMonth * months;

        // APPLY DISCOUNTS
        if (months === 3) {
            totalAmount = totalAmount * 0.85; // 15% Discount
        } else if (months === 6) {
            totalAmount = totalAmount * 0.75; // 25% Discount
        }

        // ==========================================
        // 2. UPDATE USER MEMBERSHIP
        // ==========================================
        await user.extendMembership(months);
        
        if (typeof autoRenew !== 'undefined') {
            user.membershipDuration.auto_renew = autoRenew;
        }

        // ==========================================
        // 3. CREATE PAYMENT RECEIPT
        // ==========================================
        const paymentRecord = new Payment({
            userId: userId,
            amount: Math.round(totalAmount), // Round to the nearest whole rupee
            currency: 'INR',
            paymentFor: 'Membership',
            paymentMethod: 'Card',
            status: 'Success',
            membershipPlan: userPlan,
            isRenewal: true
        });
        
        // Save both User update and Payment receipt simultaneously
        await Promise.all([
            user.save(),
            paymentRecord.save()
        ]);

        // Update session if it exists (for legacy support)
        if (req.session && req.session.user) {
            req.session.user.membershipDuration = user.membershipDuration;
            req.session.user.status = user.status;
        }

        res.json({
            success: true,
            message: 'Membership extended successfully',
            user: {
                membershipDuration: user.membershipDuration,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Error extending membership:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
// Toggle auto-renew
const toggleAutoRenew = async (req, res) => {
    try {
        const userId = req.session?.user?.id || (req.user ? req.user.id : null);
        
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.membershipDuration.auto_renew = !user.membershipDuration.auto_renew;
        await user.save();

        res.json({ 
            message: `Auto-renew ${user.membershipDuration.auto_renew ? 'enabled' : 'disabled'}`,
            auto_renew: user.membershipDuration.auto_renew
        });
    } catch (error) {
        console.error('Error toggling auto-renew:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get membership status
const getMembershipStatus = async (req, res) => {
    try {
        const userId = req.session?.user?.id || (req.user ? req.user.id : null);
        
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            membershipType: user.membershipType,
            months_remaining: user.membershipDuration.months_remaining,
            end_date: user.membershipDuration.end_date,
            status: user.status,
            isActive: user.isMembershipActive()
        });
    } catch (error) {
        console.error('Error getting membership status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    extendMembership,
    getMembershipStatus,
    toggleAutoRenew
};