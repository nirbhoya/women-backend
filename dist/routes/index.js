"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const authController_1 = require("../controllers/authController");
const follower_controllers_1 = require("../controllers/follower.controllers");
const adminController_1 = require("../controllers/adminController");
const post_controller_1 = require("../controllers/post.controller");
const addtocart_1 = require("../controllers/addtocart");
const partnerController_1 = require("../controllers/partnerController");
const multer_1 = __importDefault(require("multer"));
const uploadProfileImage = (0, multer_1.default)({ dest: 'uploads/profileImages/' });
const uploadProductImages = (0, multer_1.default)({ dest: 'uploads/PostImage/' });
const uploadPostImage = (0, multer_1.default)({ dest: 'uploads//' });
// import { getNotifications, updateProfile } from "../controllers/notification";
const forget_1 = require("../controllers/forget");
const multer_2 = require("../multer/multer");
const question_controller_1 = require("../controllers/question.controller");
const notification_1 = require("../controllers/notification");
const counseller_1 = require("../controllers/counseller");
const mentalhelta_1 = require("../controllers/mentalhelta");
const admin_post_controller_1 = require("../controllers/admin.post.controller");
// import { createPost, getPostsByCategory } from "../controllers/postController";
// import { addToCart, placeOrder } from "../controllers/orderController";
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: "uploads/" });
// Auth Routes
router.post("/register", authController_1.register);
router.post("/login", authController_1.login);
// User Routes
router.get("/users/getProfile", auth_middleware_1.authMiddleware, authController_1.getProfile);
router.get("/users/getPosts", auth_middleware_1.authMiddleware, post_controller_1.getUserPosts);
router.put("/users/Posts/:id", auth_middleware_1.authMiddleware, (0, multer_2.uploadMultipleImages)(), post_controller_1.updatePost);
router.delete("/users/Posts/:postId", auth_middleware_1.authMiddleware, post_controller_1.deletePost);
router.post("/orders", auth_middleware_1.authMiddleware, addtocart_1.addToCart);
router.get("/users/order", auth_middleware_1.authMiddleware, addtocart_1.getCart);
router.get("/admin/all-orders", adminController_1.getAllOrders);
router.delete("/admin/remove-order/:id", adminController_1.deleteOrder);
router.get("/admin/mental", mentalhelta_1.getMentalHealthPosts);
// router.delete("/admin/mental/:id", deleteMentalHealthPost);
router.delete("/admin/mental/:id", mentalhelta_1.deleteMentalHealthPost);
router.get("/admin/:id", auth_middleware_1.authMiddleware, mentalhelta_1.getMentalHealthPostById);
// router.post("/order", authMiddleware, placeOrder);
router.put("/users/updateprofile", auth_middleware_1.authMiddleware, (0, multer_2.uploadSingleImage)('image'), authController_1.updateProfile);
//post
// router.post("/post", authMiddleware, uploadProductImages.array('image',10),createPost );
router.post("/post", auth_middleware_1.authMiddleware, (0, multer_2.uploadMultipleImages)(), post_controller_1.createPost);
router.post("/post/follow/:postId", post_controller_1.followPost);
router.post("/post/saved/:postId", auth_middleware_1.authMiddleware, post_controller_1.savePost);
router.get("/post/followers/:postId", post_controller_1.getPostFollowers);
router.get("/post", post_controller_1.getAllPosts);
router.get("/post/search", post_controller_1.searchPostsByCategory);
router.get("/post/saved", auth_middleware_1.authMiddleware, post_controller_1.getSavedPosts);
router.get("/posts/category/:category", post_controller_1.getPostsByCategory);
///like comments
router.put("/like/:postId", auth_middleware_1.authMiddleware, post_controller_1.toggleLikePost);
router.post("/comment/:postId", auth_middleware_1.authMiddleware, post_controller_1.addComment);
// Get all comments
router.get("/:postId/comments", post_controller_1.getComments);
//forget password
router.post("/forget-password", forget_1.forgetPassword); // Step 1: Request OTP
router.post("/verify-otp", forget_1.verifyOtp); // Step 2: Verify OTP
router.post("/reset-password", forget_1.resetPassword); // Step 3: Reset password
// // Admin Routes
router.get("/admin/users", auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, adminController_1.getUsers);
router.get("/admin/posts", auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, adminController_1.getCommunityPosts);
router.get("/admin/orders", auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, adminController_1.getOrders);
router.get("/admin/post/get", admin_post_controller_1.GetAllPostsAdmin);
router.post("/admin/category", auth_middleware_1.authenticateAdmin, adminController_1.createCategory);
router.delete("/admin/category/:categoryId", auth_middleware_1.authenticateAdmin, adminController_1.removeCategory);
router.post("/admin/create", adminController_1.createAdmin);
router.post("/admin/login", adminController_1.loginAdmin);
router.post("/admin/change-password", auth_middleware_1.authenticateAdmin, adminController_1.changeAdminPassword);
// router.post("/admin/post/mental",  authMiddleware, upload.single('image'),createMentalHealthPost);
router.post("/admin/post/mental", auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, (0, multer_2.uploadMultipleImages)(), mentalhelta_1.createMentalHealthPost);
// router.post("/admin/post",authMiddleware,upload.single('image'), PostAdmin);
router.post("/admin/post", auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, (0, multer_2.uploadMultipleImages)(), admin_post_controller_1.PostAdmin);
router.put("/admin/post/:id", auth_middleware_1.authMiddleware, upload.single('image'), mentalhelta_1.updateMentalHealthPost);
router.put("/admin/post/:id", auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, upload.single('image'), admin_post_controller_1.UpdatePost);
router.delete("/admin/post/:postId", auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_post_controller_1.DeletePost);
// router.get("/admin/apost", authMiddleware,upload.single('image'), GetAllPostsAdmin);
//products
// router.post("/admin/addProduct", authMiddleware,upload.array('images'), addProductHandler);
router.post("/admin/addProduct", auth_middleware_1.authMiddleware, (0, multer_2.uploadMultipleImages)(), adminController_1.addProductHandler);
router.delete("/admin/product/:id", adminController_1.deleteProduct);
router.get("/allproducts", adminController_1.getAllProducts);
router.get("/products/:id", auth_middleware_1.authMiddleware, adminController_1.getProductById);
router.get("/allcategory", adminController_1.getAllCategories);
router.get("/category/:categoryId", auth_middleware_1.authMiddleware, adminController_1.getCategoryById);
//Notification
router.get("/notifications", auth_middleware_1.authMiddleware, notification_1.getNotifications);
//question
router.post("/question", auth_middleware_1.authMiddleware, question_controller_1.createMenstrualHealth);
router.put("/question", auth_middleware_1.authMiddleware, question_controller_1.updateMenstrualHealth);
//PartnerROute
router.get("/partner/:partnerId", partnerController_1.getUserByPartnerId); // ✅ Get User by Partner ID; // ✅ Get User's Partner ID
router.get("/partner/profile/:userId", partnerController_1.getPartnerProfile);
//followers users
router.post("/users/follow/:userId", auth_middleware_1.authMiddleware, follower_controllers_1.followUser);
router.get("/users/followers/:userId", follower_controllers_1.getFollowers);
router.get("/users/following/:userId", follower_controllers_1.getFollowing);
// Routes counseller
router.post("/admin/add", (0, multer_2.uploadMultipleImages)(), auth_middleware_1.authenticateAdmin, counseller_1.addCounselor); // Admin adds counselor
router.post("/counseller/login", counseller_1.loginCounselor);
router.get("/all", counseller_1.getAllCounselors); // Get all counselors
router.get("/:id", counseller_1.getCounselorById); // Get counselor by ID
router.delete("/admin/counselor/:id", counseller_1.deleteCounselor);
router.put("/update/:id", auth_middleware_1.authMiddleware, counseller_1.updateCounselor); // Admin deletes counselor
router.put("/password/:id", counseller_1.updateCounselorPassword); // Admin deletes counselor
exports.default = router;
