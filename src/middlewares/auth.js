const ErrorResponse = require('../utils/errorResponse');
const User = require('../modules/user/user.model');

exports.protect = async (request, reply) => {
    let token;

    if (
        request.headers.authorization &&
        request.headers.authorization.startsWith('Bearer')
    ) {
        token = request.headers.authorization.split(' ')[1];
    } else if (request.cookies?.token) {
        token = request.cookies.token;
    }

    if (!token) {
        throw new ErrorResponse('Not authorized to access this route', 401);
    }

    try {
        const decoded = request.server.jwt.verify(token);
        request.user = await User.findById(decoded.id);
        if (!request.user) {
            throw new ErrorResponse('User not found', 404);
        }
    } catch (err) {
        throw new ErrorResponse('Not authorized to access this route', 401);
    }
};

exports.authorize = (...roles) => {
    return async (request, reply) => {
        // Universal Admin access: Admins can access any role-restricted route
        if (request.user.role === 'admin') {
            return;
        }

        if (!roles.includes(request.user.role)) {
            throw new ErrorResponse(
                `User role ${request.user.role} is not authorized to access this route`,
                403
            );
        }
    };
};
