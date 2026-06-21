import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../models/User';
import { config } from '../config';
import { JwtPayload, UserRole } from '../types';
import { ApiError } from '../utils/ApiError';

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    department?: string;
  }) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw ApiError.conflict('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcrypt.saltRounds);

    const user = await User.create({
      ...data,
      password: hashedPassword,
      role: data.role || UserRole.STUDENT,
    });

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw ApiError.unauthorized('User not found or inactive');
      }
      const tokens = this.generateTokens(user);
      return tokens;
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private generateTokens(user: UserDocument) {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiry,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry,
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
