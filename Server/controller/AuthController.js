import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'access_secret_123', {
    expiresIn: '15m' // Short-lived access token
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_SECRET || 'refresh_secret_456', {
    expiresIn: '7d' // Long-lived refresh token
  });
};
// REGISTER USER (To create our test account)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password before saving to DB
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 2. Compare incoming plain password with stored bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Send token & user data back to React (Chunk 5)
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

    // Verify Refresh Token
    jwt.verify(refreshToken, process.env.REFRESH_SECRET || 'refresh_secret_456', (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid or expired refresh token' });

      // Generate fresh short-lived Access Token
      const newAccessToken = generateAccessToken(decoded.id);
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// LOGOUT CONTROLLER (Clears Cookie)
export const logoutUser = async (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out successfully' });
};