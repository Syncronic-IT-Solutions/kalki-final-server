import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import UserModel from '../../db/models/users/usersModel';

const JWT_SECRET = process.env.JWT_SECRET!;

const userslist = express.Router();

userslist.get('/getallusers', async (req: any, res: any) => {
  try {
    const users = await UserModel.findAll();
    if (!users.length) {
      return res.status(404).json({ error: 'No users found' });
    }
    res.status(200).json({ success: true, message: 'Users fetched successfully', users });
  } catch (err: any) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'An error occurred while fetching users.' });
  }
});

userslist.get('/getuserById/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findOne({ where: { userid: id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ success: true, message: 'User details fetched successfully', user });
  } catch (err: any) {
    console.error('Error fetching user details:', err.message);
    res.status(500).json({ error: 'An error occurred while fetching user details.' });
  }
});

userslist.put('/updateuserById/:id', async (req: any, res: any) => {
  const { id } = req.params;
  const { name, email, phone, location, status } = req.body;
  try {
    const user = await UserModel.findOne({ where: { userid: id } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    user.username = name || user.username;
    user.email = email || user.email;
    user.phonenumber = phone || user.phonenumber;
    user.address = location || user.address;
    user.status = status || user.status;
    await user.save();

    res.status(200).json({ success: true, message: 'User updated successfully', user });
  } catch (err: any) {
    console.error('Error updating user details:', err.message);
    res.status(500).json({ success: false, error: 'An error occurred while updating user details.' });
  }
});

export default userslist;


