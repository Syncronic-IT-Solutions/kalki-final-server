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
const express_1 = require("express");
const ReviewsModel_1 = __importDefault(require("../../db/models/pujas/ReviewsModel"));
const PujaModel_1 = __importDefault(require("../../db/models/pujas/PujaModel"));
const usersModel_1 = __importDefault(require("../../db/models/users/usersModel"));
const BookingHistoryModel_1 = __importDefault(require("../../db/models/bookings/BookingHistoryModel")); // Assuming BookingHistoryModel exists
const createReview = (0, express_1.Router)();
// Define the POST route for submitting a review
createReview.post('/submitReview', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { puja_id, booking_id, userid, rating, review, uploads_url, verified_user } = req.body;
    // Validate incoming data
    if (!puja_id || !booking_id || !userid || !rating || !review) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'puja_id, booking_id, userid, rating, and review are required',
        });
    }
    // Validate the rating value (1 to 5)
    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            error: 'Invalid rating',
            message: 'Rating must be between 1 and 5',
        });
    }
    // Check if the puja_id exists in the database
    try {
        const puja = yield PujaModel_1.default.findByPk(puja_id);
        if (!puja) {
            return res.status(404).json({
                error: 'Puja not found',
                message: `No Puja found with id ${puja_id}`,
            });
        }
        // Check if the booking_id exists in the BookingHistoryModel
        const booking = yield BookingHistoryModel_1.default.findOne({ where: { booking_id } });
        if (!booking) {
            return res.status(404).json({
                error: 'Booking not found',
                message: `No booking found with id ${booking_id}`,
            });
        }
        // Create the review
        const newReview = yield ReviewsModel_1.default.create({
            puja_id,
            booking_id,
            userid,
            rating,
            review,
            uploads_url: uploads_url || [], // If no upload URL provided, set an empty array
            verified_user: verified_user || false, // Default to false if not provided
        });
        // Return success response with the created review data
        return res.status(201).json({
            message: 'Review submitted successfully',
            data: newReview,
        });
    }
    catch (error) {
        console.error('Error submitting review:', error);
        return res.status(500).json({
            error: 'Database error',
            details: error.message,
        });
    }
}));
// Endpoint to get reviews by puja_id and fetch associated user data
createReview.get('/getReviewsByPuja/:puja_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { puja_id } = req.params;
    try {
        // Fetch reviews by puja_id and include associated booking data and user data
        const reviews = yield ReviewsModel_1.default.findAll({
            where: { puja_id },
            include: [
                {
                    model: BookingHistoryModel_1.default,
                    as: 'booking', // Alias for the relationship
                    attributes: ['booking_id', 'userid', 'puja_id'], // Specify the fields you want to include from the booking
                },
                {
                    model: usersModel_1.default, // Include the UserModel to fetch user data
                    as: 'users', // Alias for the relationship
                    attributes: ['userid', 'username'], // Specify the fields you want to include from the user model
                },
            ],
        });
        if (!reviews || reviews.length === 0) {
            return res.status(404).json({
                error: 'No reviews found',
                message: `No reviews found for puja_id: ${puja_id}`,
            });
        }
        return res.status(200).json({
            message: 'Reviews fetched successfully',
            data: reviews.map((review) => {
                // Map reviews to include the username and other data
                return {
                    review_id: review.review_id,
                    rating: review.rating,
                    review: review.review,
                    uploads_url: review.uploads_url,
                    verified_user: review.verified_user,
                    username: review.user ? review.user.username : null, // Fetch username from the included user data
                    puja_id: review.puja_id,
                    booking_id: review.booking.booking_id,
                    user_id: review.booking.userid,
                };
            }),
        });
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({
            error: 'Database error',
            details: error.message,
        });
    }
}));
exports.default = createReview;
