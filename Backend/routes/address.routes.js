import express from "express";
import {
  createAddress,
  deleteAddress,
  getAddressById,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from "../controllers/address.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// GET /api/v1/addresses - Get all addresses
router.get("/", getAddresses);

// GET /api/v1/addresses/:addressId - Get single address
router.get("/:addressId", getAddressById);

// POST /api/v1/addresses - Create address
router.post("/", createAddress);

// PUT /api/v1/addresses/:addressId - Update address
router.put("/:addressId", updateAddress);

// DELETE /api/v1/addresses/:addressId - Delete address
router.delete("/:addressId", deleteAddress);

// PATCH /api/v1/addresses/:addressId/default - Set as default
router.patch("/:addressId/default", setDefaultAddress);

export default router;
