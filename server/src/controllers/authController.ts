import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { User } from '../models';
import { generateToken, hashPassword, comparePassword } from '../utils/auth';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, first_name, last_name }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    // Return user data without password
    const userResponse = user.toJSON();
    const { password: _, ...userWithoutPassword } = userResponse;

    const response: AuthResponse = {
      token,
      user: userWithoutPassword
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update online status
    await user.update({ is_online: true, last_seen: new Date() });

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    // Return user data without password
    const userResponse = user.toJSON();
    const { password: _, ...userWithoutPassword } = userResponse;

    const response: AuthResponse = {
      token,
      user: userWithoutPassword
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { first_name, last_name, avatar_url } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      avatar_url: avatar_url || user.avatar_url
    });

    const updatedUser = user.toJSON();
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: any, res: Response) => {
  try {
    await User.update(
      { is_online: false, last_seen: new Date() },
      { where: { id: req.user.id } }
    );

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsers = async (req: any, res: Response) => {
  try {
    const { search } = req.query;
    const currentUserId = req.user.id;

    let whereClause: any = {
      id: { [Op.ne]: currentUserId } // Exclude current user
    };

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [
        ['is_online', 'DESC'], // Online users first
        ['last_seen', 'DESC'],  // Then by last seen
        ['username', 'ASC']     // Finally alphabetically
      ]
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};