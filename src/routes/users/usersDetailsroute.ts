import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import UserModel from '../../db/models/users/usersModel';

const JWT_SECRET = process.env.JWT_SECRET!;

const userDetailsUpdate = express.Router();
// Middleware to parse JSON
userDetailsUpdate.use(express.json());


userDetailsUpdate.put('/update-profile', async (req: any, res: any) => {
    console.log('Request body:', req.body);

    const { username, email, gender, address, profile_pic_url } = req.body;
    const { phonenumber } = req.body.temple;

    if (!username || !email) {
        console.log('Missing username or email.');
        return res.status(400).json({ error: 'Name and email are required.' });
    }

    console.log('Fetching user with phonenumber:', phonenumber);

    try {
        const user = await UserModel.findOne({ where: { phonenumber } });

        if (!user) {
            console.log('User not found for phonenumber:', phonenumber);
            return res.status(404).json({ error: 'User not found.' });
        }

        console.log('User found:', user);

        user.username = username;
        user.email = email;
        user.gender = gender;
        user.address = address;
        user.profile_pic_url = profile_pic_url;

        console.log('Saving updated user:', user);

        await user.save();

        res.status(200).json({ success: true, message: 'Profile updated successfully', user });
    } catch (err: any) {
        console.error('Error during profile update:', err);
        res.status(500).json({ error: 'An error occurred while updating the profile.', details: err.message });
    }
});

userDetailsUpdate.put('/update-user/:id', async (req: any, res: any) => {
    console.log('Request body:', req.body);

    const { username, email, gender, address, status } = req.body;
    const userId = req.params.id;  // Get userId from URL parameter

    // Check if username and email are provided
    if (!username || !email) {
        console.log('Missing username or email.');
        return res.status(400).json({ error: 'Username and email are required.' });
    }

    console.log('Fetching user with userId:', userId);

    try {
        // Find the user by userId
        const user = await UserModel.findOne({ where: { userid: userId } });

        if (!user) {
            console.log('User not found for userId:', userId);
            return res.status(404).json({ error: 'User not found.' });
        }

        console.log('User found:', user);

        // Update the user's profile information
        user.username = username;
        user.email = email;
        user.gender = gender;
        user.address = address;
        user.status = status;

        console.log('Saving updated user:', user);

        // Save the updated user data
        await user.save();

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                username: user.username,
                email: user.email,
                gender: user.gender,
                address: user.address,
                status: user.status,
                updated: user.updatedAt, // You might want to include the updated time
            },
        });
    } catch (err: any) {
        console.error('Error during profile update:', err);
        res.status(500).json({ error: 'An error occurred while updating the profile.', details: err.message });
    }
});



userDetailsUpdate.post('/change-password', async (req: any, res: any) => {
    const { password, new_password } = req.body;
    const { phonenumber } = req.body.temple; // Retrieve phone_number from the decoded token

    if (!password || !new_password) {
        return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    try {
        // Find the user using the phone_number from the token
        const user = await UserModel.findOne({ where: { phonenumber } });

        if (!user || !user.otp_verified) {
            return res.status(400).json({ error: 'User not found or OTP not verified.' });
        }

        // Check if the current password is correct
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid current password.' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(new_password, 10);

        // Update the user's password
        await user.update({ password: hashedNewPassword });

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error: any) {
        console.error('Error changing password:', error.message);
        res.status(500).json({ error: `Failed to change password: ${error.message}` });
    }
});

userDetailsUpdate.get('/getuserDetails', async (req: any, res: any) => {
    const { phonenumber } = req.body.temple; // Extract phone_number from the decoded token

    try {
        const user = await UserModel.findOne({ where: { phonenumber } });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ success: true, message: 'User details fetched successfully', user });
    } catch (err: any) {
        console.error('Error fetching user details:', err.message);
        res.status(500).json({ error: 'An error occurred while fetching user details.' });
    }
});

userDetailsUpdate.post('/logout', (req: any, res: any) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(400).json({ success: false, message: 'Token not found.' });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, JWT_SECRET) as { phone_number: string };

        // The token is verified and the user can be logged out
        // You can add logic here if you need to record the logout event in the database
        res.status(200).json({ success: true, message: 'Logout successful.' });
    } catch (error: any) {
        console.error('Error logging out:', error.message);
        res.status(500).json({ success: false, message: 'Failed to log out.', error: error.message });
    }
});

export default userDetailsUpdate;