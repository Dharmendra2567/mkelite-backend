const User = require('./user.model');
const ErrorResponse = require('../../utils/errorResponse');

class UserService {
    async createUser(userData) {
        // Prevent setting admin role during registration via API unless authorized, but for now just standard creation
        const user = await User.create(userData);
        return user;
    }

    async findUserByEmailWithPassword(email) {
        return await User.findOne({ email }).select('+password');
    }

    async findUserById(id) {
        return await User.findById(id).lean(); // Optimization: use lean() for reads
    }

    async saveRefreshToken(userId, token) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await User.findByIdAndUpdate(userId, {
            $push: {
                refreshTokens: { token, expiresAt }
            }
        });
    }

    async verifyRefreshTokenInDb(userId, token) {
        const user = await User.findOne({
            _id: userId,
            'refreshTokens.token': token,
            'refreshTokens.expiresAt': { $gt: new Date() }
        });
        return !!user;
    }

    async removeRefreshToken(userId, token) {
        await User.findByIdAndUpdate(userId, {
            $pull: {
                refreshTokens: { token }
            }
        });
    }

    async clearExpiredRefreshTokens(userId) {
        await User.findByIdAndUpdate(userId, {
            $pull: {
                refreshTokens: { expiresAt: { $lt: new Date() } }
            }
        });
    }

    // Add other robust user operations here (update, delete, etc.)
    async findAllUsers(filter = {}) {
        return await User.find(filter).sort({ createdAt: -1 }).lean();
    }

    async adminUpdateUser(id, details) {
        let user = await User.findById(id).select('+password');

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        // Update fields manually to trigger .save() hooks (important for password hashing)
        Object.keys(details).forEach(key => {
            if (details[key] !== undefined) {
                user[key] = details[key];
            }
        });

        await user.save();
        
        // Remove password from returned object
        const result = user.toObject();
        delete result.password;
        return result;
    }

    async deleteUser(id) {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }
        return user;
    }

    async updateUserDetails(id, details) {
        // Exclude sensitive fields from generic update
        delete details.password;
        delete details.role;
        delete details.email; // Email changes usually require separate flow
        delete details.refreshTokens;

        const user = await User.findByIdAndUpdate(id, details, {
            new: true,
            runValidators: true
        }).lean();

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }
        return user;
    }
}

module.exports = new UserService();
