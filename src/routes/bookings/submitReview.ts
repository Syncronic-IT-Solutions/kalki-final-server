import { Request, Response, Router } from 'express';
import ReviewsModel from '../../db/models/pujas/ReviewsModel';
import PujaModel from '../../db/models/pujas/PujaModel';
import UserModel from '../../db/models/users/usersModel';
import BookingHistoryModel from "../../db/models/bookings/BookingHistoryModel"; // Assuming BookingHistoryModel exists

const createReview = Router();

// Define the POST route for submitting a review
createReview.post('/submitReview', async (req: any, res: any) => {
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
    const puja = await PujaModel.findByPk(puja_id);

    if (!puja) {
      return res.status(404).json({
        error: 'Puja not found',
        message: `No Puja found with id ${puja_id}`,
      });
    }

    // Check if the booking_id exists in the BookingHistoryModel
    const booking = await BookingHistoryModel.findOne({ where: { booking_id } });

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: `No booking found with id ${booking_id}`,
      });
    }

    // Create the review
    const newReview = await ReviewsModel.create({
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
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return res.status(500).json({
      error: 'Database error',
      details: error.message,
    });
  }
});

// Endpoint to get reviews by puja_id and fetch associated user data
createReview.get('/getReviewsByPuja/:puja_id', async (req: any, res: any) => {
    const { puja_id } = req.params;
  
    try {
      // Fetch reviews by puja_id and include associated booking data and user data
      const reviews = await ReviewsModel.findAll({
        where: { puja_id },
        include: [
          {
            model: BookingHistoryModel,
            as: 'booking', // Alias for the relationship
            attributes: ['booking_id', 'userid', 'puja_id'], // Specify the fields you want to include from the booking
          },
          {
            model: UserModel, // Include the UserModel to fetch user data
            as: 'users',  // Alias for the relationship
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
        data: reviews.map((review: any) => {
          // Map reviews to include the username and other data
          return {
            review_id: review.review_id,
            rating: review.rating,
            review: review.review,
            uploads_url: review.uploads_url,
            verified_user: review.verified_user,
            username: review.user ? review.user.username : null,  // Fetch username from the included user data
            puja_id: review.puja_id,
            booking_id: review.booking.booking_id,
            user_id: review.booking.userid,
          };
        }),
      });
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({
        error: 'Database error',
        details: error.message,
      });
    }
  });
  
  

export default createReview;
