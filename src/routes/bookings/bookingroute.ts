import express, { Request, Response } from 'express';
import sequelizeConnection from '../../db/config';
import BookingHistoryModel from '../../db/models/bookings/BookingHistoryModel';
import PujaModel from '../../db/models/pujas/PujaModel';
import UserModel from '../../db/models/users/usersModel';
import PujaPackagesModel from '../../db/models/pujas/PujaPackagesModel';

// Import the models for reviews, assigned tasks, and agent details
import ReviewsModel from '../../db/models/pujas/ReviewsModel';
import AssignedTasksModel from '../../db/models/agent/AssignedTasks';
import AgentDetailsModel from '../../db/models/agent/AgentDetails';
import { parse } from 'path';


// Function to generate a custom unique ID
function generateCustomPujaId(prefix: string): string {
    const randomNumber = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999
    return `${prefix}${randomNumber.toString().padStart(3, '0')}`; // Format the number with leading zeros
}

const bookingRouterdemo = express.Router();

// Route for booking a puja
bookingRouterdemo.post("/book-puja", async (req: any, res: any) => {
    const {
        puja_id,
        package_id,
        devotee_names,
        devotee_gothra,
        devotee_date_of_birth,  // New field for dates of birth
        special_instructions,   // New field for special instructions
        amount,
        discount_amount,
        coupon_code,
        total_amount,
        shipping_address,
        billing_address,
        is_shipping_address_same_as_billing,  // New checkbox field
        payment_method,
        userid, // Assume `userid` is passed directly in the request body
        puja_date, // This should be passed from the client, in format "YYYY-MM-DD"
        puja_name, // New field for puja name
        package_name, // New field for package name
    } = req.body;

    // Validate the presence of `userid` and ensure it is a string (e.g., 'KSB1001')
    if (!userid || typeof userid !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing User ID.' });
    }

    // Validate other required fields
    if (
        !puja_id || !amount || !total_amount || !discount_amount || 
        !Array.isArray(devotee_names) || !Array.isArray(devotee_gothra) || 
        !Array.isArray(devotee_date_of_birth) || 
        !shipping_address || !billing_address || !payment_method || 
        !puja_date || !puja_name || !package_name
    ) {
        return res.status(400).json({ error: 'All fields are required, and devotee_names, devotee_gothra, devotee_date_of_birth must be arrays.' });
    }

    // Check if the puja_date is in the correct format (YYYY-MM-DD)
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(puja_date);
    if (!isValidDate) {
        return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD.' });
    }

    const transaction = await sequelizeConnection.transaction();

    try {
        // Step 1: Generate a custom unique Puja ID (e.g., KSB123)
        const customBookingId = generateCustomPujaId('KSB');
        console.log("Generated custom Booking ID: ", customBookingId);

        // Parse the puja_date to ensure it's a Date object
        const parsedPujaDate = new Date(puja_date);

        // Step 2: Create a new booking
        const newBooking = await BookingHistoryModel.create(
            {
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
            },
            { transaction }
        );

        await transaction.commit();

        res.status(201).json({ message: 'Puja booked successfully!', data: newBooking });
    } catch (error: any) {
        await transaction.rollback();
        console.error('Error booking puja:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});


// Route for fetching all bookings
bookingRouterdemo.get("/get-bookings", async (req: any, res: any) => {
    try {
        // Fetch all bookings from the BookingHistoryModel
        const bookings = await BookingHistoryModel.findAll({
            include: [
                {
                    model: UserModel,
                    as: 'user', 
                    attributes: ['username'],
                },
                {
                    model: PujaModel,
                    as: 'puja',
                    attributes: ['puja_name', 'temple_name'],
                },
                {
                    model: PujaPackagesModel,
                    as: 'packages',
                    attributes: ['package_name'],
                },
                {
                    model: ReviewsModel,
                    as: 'reviews',
                    attributes: ['review_id', 'rating', 'review', 'uploads_url', 'verified_user'],
                },
                {
                    model: AssignedTasksModel,
                    as: 'assignedTasks',
                    attributes: ['agent_id', 'task_status', 'agent_commission'],
                    include: [
                        {
                            model: AgentDetailsModel,
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
        const result = bookings.map((booking: any) => {
            return {
                booking_id: booking.booking_id,
                username: booking.user?.username || 'Unknown', // Handle case where user is not found
                puja_name: booking.puja?.puja_name || 'Unknown', // Handle case where puja is not found
                temple_name: booking.puja?.temple_name || 'Unknown', // Handle case where puja is not found
                package_name: booking.packages?.[0]?.package_name || 'Unknown', // Handle case where package is not found
                reviews: booking.reviews?.map((review: any) => ({
                    review_id: review.review_id,
                    rating: review.rating,
                    comment: review.review,
                    uploads_url: review.uploads_url,
                    verified_user: review.verified_user,
                })) || [],
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
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
});

// Route for fetching a specific booking by its ID
bookingRouterdemo.get("/get-booking/:id", async (req: any, res: any) => {
    const { id } = req.params;

    try {
        const booking = await BookingHistoryModel.findOne({
            where: { booking_id: id },
            include: [
                {
                    model: UserModel,
                    as: 'user',
                    attributes: ['username'],
                },
                {
                    model: PujaModel,
                    as: 'puja',
                    attributes: ['puja_name', 'temple_name'],
                },
                {
                    model: PujaPackagesModel,
                    as: 'packages',
                    attributes: ['package_name'],
                },
                {
                    model: ReviewsModel,
                    as: 'reviews',
                    attributes: ['review_id', 'rating', 'review', 'uploads_url', 'verified_user'],
                },
                {
                    model: AssignedTasksModel,
                    as: 'assignedTasks',
                    attributes: ['agent_id', 'task_status', 'agent_commission'],
                    include: [
                        {
                            model: AgentDetailsModel,
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
        const pendingTasksCount = booking.assignedTasks?.filter((task: any) => task.task_status === 'pending').length || 0;
        const completedTasksCount = booking.assignedTasks?.filter((task: any) => task.task_status === 'completed').length || 0;

        const result = {
            booking_id: booking.booking_id,
            username: booking.user?.username,
            puja_name: booking.puja?.puja_name,
            temple_name: booking.puja?.temple_name,
            package_name: booking.packages?.[0]?.package_name,
            reviews: booking.reviews?.map((review: any) => ({
                review_id: review.review_id,
                rating: review.rating,
                review: review.review,
                uploads_url: review.uploads_url,
                verified_user: review.verified_user,
            })) || [],
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
            assigned_tasks: booking.assignedTasks?.map((task: any) => ({
                agent_id: task.agent_id,
                task_status: task.task_status,
                agent_commission: task.agent_commission,
                agent_name: task.agent?.name,
            })) || [],
            task_counts: {
                pending: pendingTasksCount,
                completed: completedTasksCount,
            },
        };

        res.status(200).json(result);
    } catch (error: unknown) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Error fetching booking', error });
    }
});

export default bookingRouterdemo;
