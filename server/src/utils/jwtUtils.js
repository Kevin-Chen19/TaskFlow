//	JWT 工具函数（生成/验证 token）
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for a user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
//	生成 JWT token
export const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    phone: user.phone
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
	//验证 JWT token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

/**
 * Middleware to authenticate requests using JWT
 */
//必需认证中间件
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format'
      });
    }

    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

/**
 * Optional authentication middleware - allows both authenticated and unauthenticated access
 */
//可选认证中间件
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};

/**
 * Middleware to check if user is admin (placeholder - add role field to users table as needed)
 */
//管理员权限中间件（预留）
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Add role checking logic here when roles are implemented
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({
  //     success: false,
  //     message: 'Admin access required'
  //   });
  // }

  next();
};
