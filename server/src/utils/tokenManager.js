const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

/**
 * Generate Access Token (short-lived)
 */
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '1d',
    });
};

/**
 * Generate Refresh Token (long-lived, stored in DB)
 */
const generateRefreshToken = async (userId, ipAddress) => {
    // Create a random refresh token
    const token = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    // Save refresh token to database
    const refreshToken = await RefreshToken.create({
        token,
        userId,
        expiresAt,
        createdByIp: ipAddress,
    });

    return token;
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = async (token) => {
    try {
        // Verify JWT signature
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        // Check if token exists in database and is active
        const refreshToken = await RefreshToken.findOne({ token });

        if (!refreshToken || !refreshToken.isActive) {
            throw new Error('Invalid or expired refresh token');
        }

        return decoded.id;
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};

/**
 * Revoke Refresh Token
 */
const revokeRefreshToken = async (token, ipAddress) => {
    const refreshToken = await RefreshToken.findOne({ token });

    if (!refreshToken || !refreshToken.isActive) {
        throw new Error('Invalid token');
    }

    // Revoke token
    refreshToken.revokedAt = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
};

/**
 * Revoke all refresh tokens for a user
 */
const revokeAllUserTokens = async (userId, ipAddress) => {
    await RefreshToken.updateMany(
        { userId, revokedAt: null },
        { revokedAt: Date.now(), revokedByIp: ipAddress }
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
};
