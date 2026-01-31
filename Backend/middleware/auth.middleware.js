import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import prisma from "../config/prisma.js"


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Prioritize Authorization header over cookies for better cross-origin support
        const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken;

        if (!token) {
            throw new ApiError(401, "Unauthorized Request")
        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await prisma.user.findUnique({
            where: { id: decodeToken?._id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        })

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
        req.user = user;
        next()
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid token");
        } else if (err.name === 'TokenExpiredError') {
            throw new ApiError(401, "Token expired");
        } else if (err instanceof ApiError) {
            throw err;
        } else {
            throw new ApiError(401, "Authentication failed");
        }
    }
})

export const verifyAdminJWT = asyncHandler(async (req, res, next) => {
    try {
        // Prioritize Authorization header over cookies
        const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken;

        if (!token) {
            throw new ApiError(401, "Unauthorized Request")
        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await prisma.user.findUnique({
            where: { id: decodeToken?._id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        })

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Check if user has ADMIN role
        const isAdmin = user.roles.some(userRole => userRole.role.name === 'ADMIN')
        if (!isAdmin) {
            throw new ApiError(403, "Access denied. Admin privileges required.");
        }

        req.admin = user;
        next()
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid token");
        } else if (err.name === 'TokenExpiredError') {
            throw new ApiError(401, "Token expired");
        } else if (err instanceof ApiError) {
            throw err;
        } else {
            throw new ApiError(401, "Authentication failed");
        }
    }
})

export const verifyUserOrAdmin = asyncHandler(async (req, res, next) => {
    try {
        // Prioritize Authorization header over cookies
        const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken;

        if (!token) {
            throw new ApiError(401, "Unauthorized Request")
        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // Find user with roles
        const user = await prisma.user.findUnique({
            where: { id: decodeToken?._id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        })

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Check if user has ADMIN role
        const isAdmin = user.roles.some(userRole => userRole.role.name === 'ADMIN')

        if (isAdmin) {
            req.admin = user;
        } else {
            req.user = user;
        }

        return next();

    } catch (err) {
        console.error('Auth error:', err);
        if (err.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid token");
        } else if (err.name === 'TokenExpiredError') {
            throw new ApiError(401, "Token expired");
        } else if (err instanceof ApiError) {
            throw err;
        } else {
            throw new ApiError(401, "Authentication failed");
        }
    }
});

export const verifyVendor = asyncHandler(async (req, res, next) => {
    try {
        // Prioritize Authorization header over cookies
        const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken;

        if (!token) {
            throw new ApiError(401, "Unauthorized Request")
        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await prisma.user.findUnique({
            where: { id: decodeToken?._id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                roles: {
                    include: {
                        role: true
                    }
                },
                vendor: true
            }
        })

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Check if user has VENDOR role
        const isVendor = user.roles.some(userRole => userRole.role.name === 'VENDOR')
        if (!isVendor) {
            throw new ApiError(403, "Access denied. Vendor privileges required.");
        }

        req.user = user;
        next()
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid token");
        } else if (err.name === 'TokenExpiredError') {
            throw new ApiError(401, "Token expired");
        } else if (err instanceof ApiError) {
            throw err;
        } else {
            throw new ApiError(401, "Authentication failed");
        }
    }
});
