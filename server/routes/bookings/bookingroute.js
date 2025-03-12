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
const config_1 = __importDefault(require("../../db/config"));
const BookingHistoryModel_1 = __importDefault(require("../../db/models/bookings/BookingHistoryModel"));
const PujaModel_1 = __importDefault(require("../../db/models/pujas/PujaModel"));
const usersModel_1 = __importDefault(require("../../db/models/users/usersModel"));
const PujaPackagesModel_1 = __importDefault(require("../../db/models/pujas/PujaPackagesModel"));
// Import the models for reviews, assigned tasks, and agent details
const ReviewsModel_1 = __importDefault(require("../../db/models/pujas/ReviewsModel"));
const AssignedTasks_1 = __importDefault(require("../../db/models/agent/AssignedTasks"));
const AgentDetails_1 = __importDefault(require("../../db/models/agent/AgentDetails"));
// Function to generate a custom unique ID
function generateCustomPujaId(prefix) {
    const randomNumber = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999
    return `${prefix}${randomNumber.toString().padStart(3, '0')}`; // Format the number with leading zeros
}
const bookingRouterdemo = express_1.default.Router();
// Route for booking a puja
bookingRouterdemo.post("/book-puja", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { puja_id, package_id, devotee_names, devotee_gothra, devotee_date_of_birth, // New field for dates of birth
    special_instructions, // New field for special instructions
    amount, discount_amount, coupon_code, total_amount, shipping_address, billing_address, is_shipping_address_same_as_billing, // New checkbox field
    payment_method, userid, // Assume `userid` is passed directly in the request body
    puja_date, // This should be passed from the client, in format "YYYY-MM-DD"
    puja_name, // New field for puja name
    package_name, // New field for package name
     } = req.body;
    // Validate the presence of `userid` and ensure it is a string (e.g., 'KSB1001')
    if (!userid || typeof userid !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing User ID.' });
    }
    // Validate other required fields
    if (!puja_id || !amount || !total_amount || !discount_amount ||
        !Array.isArray(devotee_names) || !Array.isArray(devotee_gothra) ||
        !Array.isArray(devotee_date_of_birth) ||
        !shipping_address || !billing_address || !payment_method ||
        !puja_date || !puja_name || !package_name) {
        return res.status(400).json({ error: 'All fields are required, and devotee_names, devotee_gothra, devotee_date_of_birth must be arrays.' });
    }
    // Check if the puja_date is in the correct format (YYYY-MM-DD)
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(puja_date);
    if (!isValidDate) {
        return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD.' });
    }
    const transaction = yield config_1.default.transaction();
    try {
        // Step 1: Generate a custom unique Puja ID (e.g., KSB123)
        const customBookingId = generateCustomPujaId('KSB');
        console.log("Generated custom Booking ID: ", customBookingId);
        // Parse the puja_date to ensure it's a Date object
        const parsedPujaDate = new Date(puja_date);
        // Step 2: Create a new booking
        const newBooking = yield BookingHistoryModel_1.default.create({
            booking_id: customBookingId,
            userid, // Store the `userid` as a string
            puja_id,
            package_id,
            devotee_names,
            devotee_gothra,
            devotee_date_of_birth, // Add this field
            special_instructions, // Add this field
            amount,
            discount_amount,
            coupon_code,
            total_amount,
            shipping_address,
            billing_address,
            is_shipping_address_same_as_billing, // Add this field
            payment_method,
            puja_name, // Directly use the puja_name from the request
            package_name, // Directly use the package_name from the request
            puja_date: parsedPujaDate
        }, { transaction });
        yield transaction.commit();
        res.status(201).json({ message: 'Puja booked successfully!', data: newBooking });
    }
    catch (error) {
        yield transaction.rollback();
        console.error('Error booking puja:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
}));
// Route for fetching all bookings
bookingRouterdemo.get("/get-bookings", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all bookings from the BookingHistoryModel
        const bookings = yield BookingHistoryModel_1.default.findAll({
            include: [
                {
                    model: usersModel_1.default,
                    as: 'user',
                    attributes: ['username'],
                },
                {
                    model: PujaModel_1.default,
                    as: 'puja',
                    attributes: ['puja_name', 'temple_name'],
                },
                {
                    model: PujaPackagesModel_1.default,
                    as: 'packages',
                    attributes: ['package_name'],
                },
                {
                    model: ReviewsModel_1.default,
                    as: 'reviews',
                    attributes: ['review_id', 'rating', 'review', 'uploads_url', 'verified_user'],
                },
                {
                    model: AssignedTasks_1.default,
                    as: 'assignedTasks',
                    attributes: ['agent_id', 'task_status', 'agent_commission'],
                    include: [
                        {
                            model: AgentDetails_1.default,
                            as: 'agent',
                            attributes: ['name'],
                        },
                    ],
                },
            ]
        });
        // Check if there are any bookings found
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found.' });
        }
        // Map through the bookings to fetch associated user, puja, and package information
        const result = bookings.map((booking) => {
            var _a, _b, _c, _d, _e, _f;
            return {
                booking_id: booking.booking_id,
                username: ((_a = booking.user) === null || _a === void 0 ? void 0 : _a.username) || 'Unknown', // Handle case where user is not found
                puja_name: ((_b = booking.puja) === null || _b === void 0 ? void 0 : _b.puja_name) || 'Unknown', // Handle case where puja is not found
                temple_name: ((_c = booking.puja) === null || _c === void 0 ? void 0 : _c.temple_name) || 'Unknown', // Handle case where puja is not found
                package_name: ((_e = (_d = booking.packages) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.package_name) || 'Unknown', // Handle case where package is not found
                reviews: ((_f = booking.reviews) === null || _f === void 0 ? void 0 : _f.map((review) => ({
                    review_id: review.review_id,
                    rating: review.rating,
                    comment: review.review,
                    uploads_url: review.uploads_url,
                    verified_user: review.verified_user,
                }))) || [],
                amount: booking.amount,
                puja_status: booking.puja_status,
                discount_amount: booking.discount_amount,
                total_amount: booking.total_amount,
                payment_method: booking.payment_method,
                booking_status: booking.booking_status,
                special_instructions: booking.special_instructions,
                devotee_names: booking.devotee_names,
                devotee_gothra: booking.devotee_gothra,
                devotee_date_of_birth: booking.devotee_date_of_birth,
                shipping_address: booking.shipping_address,
                billing_address: booking.billing_address,
                is_shipping_address_same_as_billing: booking.is_shipping_address_same_as_billing,
                puja_date: booking.puja_date,
                coupon_code: booking.coupon_code,
            };
        });
        // Return the result
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
}));
// Route for fetching a specific booking by its ID
bookingRouterdemo.get("/get-booking/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const { id } = req.params;
    try {
        const booking = yield BookingHistoryModel_1.default.findOne({
            where: { booking_id: id },
            include: [
                {
                    model: usersModel_1.default,
                    as: 'user',
                    attributes: ['username'],
                },
                {
                    model: PujaModel_1.default,
                    as: 'puja',
                    attributes: ['puja_name', 'temple_name'],
                },
                {
                    model: PujaPackagesModel_1.default,
                    as: 'packages',
                    attributes: ['package_name'],
                },
                {
                    model: ReviewsModel_1.default,
                    as: 'reviews',
                    attributes: ['review_id', 'rating', 'review', 'uploads_url', 'verified_user'],
                },
                {
                    model: AssignedTasks_1.default,
                    as: 'assignedTasks',
                    attributes: ['agent_id', 'task_status', 'agent_commission'],
                    include: [
                        {
                            model: AgentDetails_1.default,
                            as: 'agent',
                            attributes: ['name'],
                        },
                    ],
                },
            ],
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Count the number of pending and completed tasks
        const pendingTasksCount = ((_a = booking.assignedTasks) === null || _a === void 0 ? void 0 : _a.filter((task) => task.task_status === 'pending').length) || 0;
        const completedTasksCount = ((_b = booking.assignedTasks) === null || _b === void 0 ? void 0 : _b.filter((task) => task.task_status === 'completed').length) || 0;
        const result = {
            booking_id: booking.booking_id,
            username: (_c = booking.user) === null || _c === void 0 ? void 0 : _c.username,
            puja_name: (_d = booking.puja) === null || _d === void 0 ? void 0 : _d.puja_name,
            temple_name: (_e = booking.puja) === null || _e === void 0 ? void 0 : _e.temple_name,
            package_name: (_g = (_f = booking.packages) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.package_name,
            reviews: ((_h = booking.reviews) === null || _h === void 0 ? void 0 : _h.map((review) => ({
                review_id: review.review_id,
                rating: review.rating,
                review: review.review,
                uploads_url: review.uploads_url,
                verified_user: review.verified_user,
            }))) || [],
            amount: booking.amount,
            discount_amount: booking.discount_amount,
            total_amount: booking.total_amount,
            payment_method: booking.payment_method,
            booking_status: booking.booking_status,
            special_instructions: booking.special_instructions,
            devotee_names: booking.devotee_names,
            devotee_gothra: booking.devotee_gothra,
            devotee_date_of_birth: booking.devotee_date_of_birth,
            shipping_address: booking.shipping_address,
            billing_address: booking.billing_address,
            is_shipping_address_same_as_billing: booking.is_shipping_address_same_as_billing,
            puja_date: booking.puja_date,
            coupon_code: booking.coupon_code,
            puja_status: booking.puja_status,
            assigned_tasks: ((_j = booking.assignedTasks) === null || _j === void 0 ? void 0 : _j.map((task) => {
                var _a;
                return ({
                    agent_id: task.agent_id,
                    task_status: task.task_status,
                    agent_commission: task.agent_commission,
                    agent_name: (_a = task.agent) === null || _a === void 0 ? void 0 : _a.name,
                });
            })) || [],
            task_counts: {
                pending: pendingTasksCount,
                completed: completedTasksCount,
            },
        };
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Error fetching booking', error });
    }
}));
exports.default = bookingRouterdemo;
