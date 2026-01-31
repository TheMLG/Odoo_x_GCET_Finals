import { Router } from "express";
import {
  changeVendorPassword,
  createProduct,
  deleteProduct,
  deleteVendorOrder,
  generateVendorInvoicePDF,
  getVendorInvoices,
  getVendorOrders,
  getVendorProduct,
  getVendorProducts,
  getVendorProfile,
  getVendorStats,
  updateOrderStatus,
  updateProduct,
  updateVendorProfile,
  updateVendorUser,
} from "../controllers/vendor.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { isVendor } from "../middleware/role.middleware.js";

const router = Router();

// All vendor routes require authentication and vendor role
router.use(verifyJWT, isVendor);

// Vendor profile routes
router.route("/profile").get(getVendorProfile).put(updateVendorProfile);
router.route("/profile/user").put(updateVendorUser);
router.route("/profile/change-password").post(changeVendorPassword);

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
router.route("/invoices/:orderId/pdf").get(generateVendorInvoicePDF);

// Vendor dashboard stats
router.route("/stats").get(getVendorStats);

export default router;
