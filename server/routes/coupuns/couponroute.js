"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CouponModel_1 = __importDefault(require("../../db/models/coupons/CouponModel"));
const CouponUsageHistoryModel_1 = __importDefault(require("../../db/models/coupons/CouponUsageHistoryModel")); // Adjust import path
const couponRouter = express_1.default.Router();
couponRouter.post('/coupon-create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { coupon_code, description, discount_amount, valid_from, valid_to, status, usage_limit_per_user, discount_type, discount_percentage, maximum_discount_amount } = req.body;
        // Validate required fields
        if (!coupon_code || !description || !discount_amount || !valid_from || !valid_to || !status || usage_limit_per_user === undefined || !discount_type) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code, discount amount, valid dates, status, usage limit, and discount type are required',
            });
        }
        // Validate the discount_type and its related fields (percentage and maximum discount amount)
        if (!['percentage', 'fixed'].includes(discount_type)) {
            return res.status(400).json({
                success: false,
                message: 'Discount type must be either "percentage" or "fixed"',
            });
        }
        if (discount_type === 'percentage') {
            if (discount_percentage === undefined || discount_percentage < 0 || discount_percentage > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Discount percentage must be between 0 and 100',
                });
            }
        }
        if (discount_type === 'fixed' && (maximum_discount_amount === undefined || maximum_discount_amount < 0)) {
            return res.status(400).json({
                success: false,
                message: 'Maximum discount amount must be a positive number for fixed discounts',
            });
        }
        // Validate valid_from and valid_to dates
        if (new Date(valid_from) >= new Date(valid_to)) {
            return res.status(400).json({
                success: false,
                message: 'Valid from date must be earlier than valid to date',
            });
        }
        // Check if coupon code already exists
        const existingCoupon = yield CouponModel_1.default.findOne({ where: { coupon_code } });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists',
            });
        }
        // Create a new coupon
        const newCoupon = yield CouponModel_1.default.create({
            coupon_code,
            description,
            discount_amount,
            valid_from,
            valid_to,
            status,
            usage_limit_per_user,
            discount_type,
            discount_percentage,
            maximum_discount_amount,
            created_at: new Date(),
            updated_at: new Date(),
        });
        res.status(200).json({
            success: true,
            message: 'Coupon created successfully',
            coupon: newCoupon,
        });
    }
    catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create coupon',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}));
// Get all coupons
couponRouter.get('/coupons', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all coupons from the database
        const coupons = yield CouponModel_1.default.findAll();
        // Return the coupons in the response
        res.status(200).json({
            success: true,
            coupons: coupons,
        });
    }
    catch (error) {
        console.error('Error fetching coupons:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Failed to fetch coupons',
            error: errorMessage,
        });
    }
}));
// Get coupon by ID
couponRouter.get('/coupon/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const couponId = req.params.id;
    try {
        // Fetch the coupon by its ID
        const coupon = yield CouponModel_1.default.findOne({ where: { coupon_id: couponId } });
        // If coupon is not found
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: `Coupon with ID ${couponId} not found`,
            });
        }
        // Return the coupon details in the response
        res.status(200).json({
            success: true,
            coupon: coupon,
        });
    }
    catch (error) {
        console.error('Error fetching coupon by ID:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Failed to fetch coupon by ID',
            error: errorMessage,
        });
    }
}));
// Redeem a coupon (User-side)
couponRouter.post('/coupon-redeem', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userid, coupon_code } = req.body;
    if (!userid || !coupon_code) {
        return res.status(400).json({ success: false, message: 'User ID and coupon code are required' });
    }
    try {
        // Find the coupon by coupon code
        const coupon = yield CouponModel_1.default.findOne({ where: { coupon_code } });
        if (!coupon) {
            return res.status(400).json({ success: false, message: 'Coupon not found' });
        }
        // Check if the coupon is expired
        if (coupon.valid_to < new Date()) {
            return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }
        // Find the user's usage history for this coupon
        const userCouponUsage = yield CouponUsageHistoryModel_1.default.findOne({
            where: {
                userid,
                coupon_id: coupon.coupon_id, // Using integer type for coupon_id, no need to convert
            },
        });
        // If the user has used the coupon, check if they have exceeded the usage limit
        if (userCouponUsage && userCouponUsage.usage_count >= coupon.usage_limit_per_user) {
            return res.status(400).json({
                success: false,
                message: 'You have exceeded the usage limit for this coupon',
            });
        }
        // Update the usage count or create a new usage record
        if (userCouponUsage) {
            yield userCouponUsage.update({ usage_count: userCouponUsage.usage_count + 1 });
        }
        else {
            yield CouponUsageHistoryModel_1.default.create({
                userid,
                coupon_id: coupon.coupon_id, // Using the coupon_id directly (integer)
                usage_count: 1,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }
        res.status(200).json({
            success: true,
            message: 'Coupon redeemed successfully',
        });
    }
    catch (error) {
        console.error('Error redeeming coupon:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: 'Failed to redeem coupon', error: errorMessage });
    }
}));
couponRouter.put('/update-coupon/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const couponId = req.params.id;
    const { coupon_code, description, discount_amount, valid_from, valid_to, status, usage_limit_per_user, discount_type, discount_percentage, maximum_discount_amount, } = req.body;
    // Validate required fields
    if (!coupon_code || !description || !discount_amount || !valid_from || !valid_to || !status || usage_limit_per_user === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Coupon code, description, discount amount, valid dates, status, and usage limit are required',
        });
    }
    try {
        // Find the coupon by ID
        const coupon = yield CouponModel_1.default.findOne({ where: { coupon_id: couponId } });
        // If the coupon is not found, return a 404 error
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: `Coupon with ID ${couponId} not found`,
            });
        }
        // Update the coupon details
        coupon.coupon_code = coupon_code;
        coupon.description = description;
        coupon.discount_amount = discount_amount;
        coupon.valid_from = valid_from;
        coupon.valid_to = valid_to;
        coupon.status = status;
        coupon.usage_limit_per_user = usage_limit_per_user;
        coupon.discount_type = discount_type;
        coupon.discount_percentage = discount_percentage;
        coupon.maximum_discount_amount = maximum_discount_amount;
        //coupon.updated_at = new Date();  // Update the timestamp
        // Save the updated coupon
        yield coupon.save();
        res.status(200).json({
            success: true,
            message: 'Coupon updated successfully',
            coupon: coupon,
        });
    }
    catch (error) {
        console.error('Error updating coupon:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Failed to update coupon',
            error: errorMessage,
        });
    }
}));
// couponRouter.get('/user/:userId/usage-history', async (req: any, res: any) => {
//   const userId = req.params.userId;
//   try {
//     // Fetch coupon usage history for the given user ID
//     const usageHistory = await CouponUsageModel.findAll({
//       where: { user_id: userId },
//       include: [
//         {
//           model: CouponModel,
//           as: 'coupon',
//           attributes: ['coupon_code'],
//         },
//       ],
//       order: [['used_at', 'DESC']], // Sort by most recent usage
//     });
//     if (!usageHistory || usageHistory.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No coupon usage history found for user ID ${userId}`,
//       });
//     }
//     res.status(200).json({
//       success: true,
//       usage_history: usageHistory,
//     });
//   } catch (error) {
//     console.error('Error fetching user coupon usage history:', error);
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch user coupon usage history',
//       error: errorMessage,
//     });
//   }
// });
couponRouter.post('/user/coupon/usage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userid, coupon_id } = req.body;
    if (!userid || !coupon_id) {
        return res.status(400).json({ message: 'User ID and Coupon ID are required' });
    }
    try {
        // Check if the coupon usage record already exists
        const existingUsage = yield CouponUsageHistoryModel_1.default.findOne({
            where: { userid, coupon_id },
        });
        if (existingUsage) {
            // If record exists, update usage_count
            existingUsage.usage_count += 1;
            yield existingUsage.save();
            return res.status(200).json({ message: 'Coupon usage count updated', usage: existingUsage });
        }
        else {
            // If no record exists, create a new one
            const newUsage = yield CouponUsageHistoryModel_1.default.create({
                userid,
                coupon_id,
                usage_count: 1, // Start with 1 use
            });
            return res.status(201).json({ message: 'Coupon usage record created', usage: newUsage });
        }
    }
    catch (error) {
        console.error('Error creating/updating coupon usage:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
// 2. Endpoint to get coupon usage for a specific user
couponRouter.get('/user/coupon/usage/:userid/:coupon_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userid, coupon_id } = req.params;
    try {
        const usage = yield CouponUsageHistoryModel_1.default.findOne({
            where: { userid, coupon_id },
        });
        if (!usage) {
            return res.status(404).json({ message: 'Usage record not found' });
        }
        return res.status(200).json(usage);
    }
    catch (error) {
        console.error('Error fetching coupon usage:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
// 3. Endpoint to get all coupon usages (optional)
couponRouter.get('/user/coupon/usages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usages = yield CouponUsageHistoryModel_1.default.findAll();
        // If no data found, return a message
        if (usages.length === 0) {
            return res.status(404).json({ message: 'No coupon usage records found' });
        }
        return res.status(200).json(usages);
    }
    catch (error) {
        console.error('Error fetching all coupon usages:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.default = couponRouter;
