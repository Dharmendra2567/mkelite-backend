const userService = require('./user.service');
const tokenService = require('./token.service');
const ErrorResponse = require('../../utils/errorResponse');
const User = require('./user.model');

exports.register = async (request, reply) => {
    const user = await userService.createUser(request.body);
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);

    await userService.saveRefreshToken(user._id, refreshToken);

    sendTokenResponse(accessToken, refreshToken, 201, reply, 'User registered successfully', user);
};

exports.login = async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
        throw new ErrorResponse('Please provide an email and password', 400);
    }

    const user = await userService.findUserByEmailWithPassword(email);

    if (!user) {
        throw new ErrorResponse('Invalid credentials', 401);
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        throw new ErrorResponse('Invalid credentials', 401);
    }

    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);

    await userService.saveRefreshToken(user._id, refreshToken);

    sendTokenResponse(accessToken, refreshToken, 200, reply, 'Login successful', user);
};

exports.refresh = async (request, reply) => {
    const token = request.cookies?.refreshToken || request.body?.refreshToken;

    if (!token) {
        throw new ErrorResponse('Refresh token is required', 400);
    }

    try {
        const decoded = tokenService.verifyRefreshToken(token);
        const isValid = await userService.verifyRefreshTokenInDb(decoded.id, token);

        if (!isValid) {
            throw new ErrorResponse('Invalid or expired refresh token', 401);
        }

        const user = await userService.findUserById(decoded.id);
        const accessToken = tokenService.generateAccessToken(user);

        return {
            success: true,
            message: 'Token refreshed successfully',
            data: { accessToken }
        };
    } catch (err) {
        throw new ErrorResponse('Invalid refresh token', 401);
    }
};

exports.logout = async (request, reply) => {
    const token = request.cookies?.refreshToken || request.body?.refreshToken;

    if (token) {
        await userService.removeRefreshToken(request.user.id, token);
    }

    reply
        .clearCookie('refreshToken', { path: '/api/v1/auth' })
        .send({
            success: true,
            message: 'Logged out successfully',
            data: null
        });
};

exports.getMe = async (request, reply) => {
    const user = await userService.findUserById(request.user.id);
    return {
        success: true,
        message: 'User details retrieved successfully',
        data: user
    };
};

exports.updateDetails = async (request, reply) => {
    const user = await userService.updateUserDetails(request.user.id, request.body);
    return {
        success: true,
        message: 'User details updated successfully',
        data: user
    };
};

exports.getEmployers = async (request, reply) => {
    const employers = await User.find({ role: 'employer' }).select('firstName lastName email phoneNumber');
    return {
        success: true,
        message: 'Employers retrieved successfully',
        data: employers.map(e => ({
            id: e._id,
            name: `${e.firstName} ${e.lastName}`, // In this system, firstName+lastName often represents business name for employers
            email: e.email,
            phoneNumber: e.phoneNumber
        }))
    };
};

exports.getUsers = async (request, reply) => {
    const { role } = request.query;
    const filter = role ? { role } : {};
    const users = await userService.findAllUsers(filter);
    return {
        success: true,
        message: 'Users retrieved successfully',
        data: users.map(u => ({
            id: u._id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            phoneNumber: u.phoneNumber,
            role: u.role,
            isActive: u.isActive,
            createdAt: u.createdAt
        }))
    };
};

exports.adminCreateUser = async (request, reply) => {
    const user = await userService.createUser(request.body);
    return {
        success: true,
        message: 'User created successfully by admin',
        data: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        }
    };
};

exports.adminUpdateUser = async (request, reply) => {
    const user = await userService.adminUpdateUser(request.params.id, request.body);
    return {
        success: true,
        message: 'User updated successfully by admin',
        data: user
    };
};

exports.deleteUser = async (request, reply) => {
    await userService.deleteUser(request.params.id);
    return {
        success: true,
        message: 'User deleted successfully',
        data: null
    };
};

const sendTokenResponse = (accessToken, refreshToken, statusCode, reply, message, user) => {
    const cookieOptions = {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/api/v1/auth' // Broadened path so logout can also access it
    };

    reply
        .status(statusCode)
        .setCookie('refreshToken', refreshToken, cookieOptions)
        .send({
            success: true,
            message,
            data: {
                accessToken,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role
                }
            }
        });
};

