import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Middleware to check if user has any of the required roles
 * @param {...string} allowedRoles - List of allowed role names (e.g., 'ADMIN', 'VENDOR', 'CUSTOMER')
 */
export const hasRole = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized - Please login first");
    }

    // Extract role names from user's roles
    const userRoles = req.user.roles.map((userRole) => userRole.role.name);

    // Check if user has any of the allowed roles
    const hasRequiredRole = allowedRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      throw new ApiError(
        403,
        `Access denied. Required roles: ${allowedRoles.join(", ")}`
      );
    }

    next();
  });
};

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = hasRole("ADMIN");

/**
 * Middleware to check if user is a vendor
 */
export const isVendor = hasRole("VENDOR");

/**
 * Middleware to check if user is a customer
 */
export const isCustomer = hasRole("CUSTOMER");

/**
 * Middleware to check if user is vendor or admin
 */
export const isVendorOrAdmin = hasRole("VENDOR", "ADMIN");

/**
 * Middleware to check if resource belongs to user or user is admin
 */
export const isOwnerOrAdmin = (getOwnerId) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized - Please login first");
    }

    const userRoles = req.user.roles.map((userRole) => userRole.role.name);
    const isAdmin = userRoles.includes("ADMIN");

    if (isAdmin) {
      return next();
    }

    // Get the owner ID from the request (could be from params, body, or fetched resource)
    const ownerId = typeof getOwnerId === "function" 
      ? await getOwnerId(req) 
      : req.params.userId || req.user.id;

    if (req.user.id !== ownerId) {
      throw new ApiError(
        403,
        "Access denied. You can only access your own resources"
      );
    }

    next();
  });
};
