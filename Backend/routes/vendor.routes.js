import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  deleteVendorOrder,
  getVendorInvoices,
  getVendorOrders,
  getVendorProduct,
  getVendorProducts,
  getVendorProfile,
  getVendorStats,
  updateOrderStatus,
  updateProduct,
  updateVendorProfile,
} from "../controllers/vendor.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { isVendor } from "../middleware/role.middleware.js";

const router = Router();

// All vendor routes require authentication and vendor role
router.use(verifyJWT, isVendor);

// Vendor profile routes
router.route("/profile").get(getVendorProfile).put(updateVendorProfile);

// Vendor products routes
router
  .route("/products")
  .get(getVendorProducts)
  .post(upload.single("productImage"), createProduct);

router
  .route("/products/:productId")
  .get(getVendorProduct)
  .put(upload.single("productImage"), updateProduct)
  .delete(deleteProduct);

// Vendor orders routes
router.route("/orders").get(getVendorOrders);
router.route("/orders/:orderId/status").patch(updateOrderStatus);
router.route("/orders/:orderId").delete(deleteVendorOrder);

// Vendor invoices routes
router.route("/invoices").get(getVendorInvoices);

// Vendor dashboard stats
router.route("/stats").get(getVendorStats);

export default router;
