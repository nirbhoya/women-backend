
import express from "express";
import { authMiddleware, adminMiddleware, authenticateAdmin } from "../middlewares/auth.middleware";
import { register, login, getProfile, updateProfile} from "../controllers/authController";
import {getFollowing, getFollowers, followUser} from "../controllers/follower.controllers";
import { getUsers, getCommunityPosts, getOrders, createCategory,  createAdmin, loginAdmin, addProductHandler, getAllProducts, getProductById, getAllCategories, getCategoryById, getAdmin, changeAdminPassword, removeCategory, deleteProduct, getAllOrders, deleteOrder  } from "../controllers/adminController";
import { addComment, createPost, deletePost, followPost, getAllPosts, getComments, getPostFollowers, getPostsByCategory, getSavedPosts, getUserPosts, savePost, searchPostsByCategory, toggleLikePost, updatePost } from "../controllers/post.controller";
import { addToCart, getCart } from "../controllers/addtocart";
import { placeOrder } from "../controllers/order.controller";
import bcrypt from "bcrypt";
import axios from "axios";
import jwt from "jsonwebtoken";
import { getPartnerProfile, getUserByPartnerId } from "../controllers/partnerController";
import multer from "multer";


const uploadProfileImage = multer({ dest: 'uploads/profileImages/' });
const uploadProductImages = multer({ dest: 'uploads/PostImage/' });
const uploadPostImage = multer({ dest: 'uploads//' });
// import { getNotifications, updateProfile } from "../controllers/notification";
import { forgetPassword, resetPassword, verifyOtp } from "../controllers/forget";
import  { uploadMultipleImages, uploadSingleImage } from "../multer/multer";
import { createMenstrualHealth, updateMenstrualHealth } from "../controllers/question.controller";
import { getNotifications } from "../controllers/notification";
import { addCounselor, deleteCounselor, getAllCounselors, getCounselorById, loginCounselor, updateCounselor, updateCounselorPassword } from "../controllers/counseller";
import { createMentalHealthPost, getMentalHealthPosts, getMentalHealthPostById,  updateMentalHealthPost, deleteMentalHealthPost } from "../controllers/mentalhelta";
import { PostAdmin, GetAllPostsAdmin, UpdatePost, DeletePost} from "../controllers/admin.post.controller";

// import { createPost, getPostsByCategory } from "../controllers/postController";
// import { addToCart, placeOrder } from "../controllers/orderController";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Auth Routes
router.post("/register", register);
router.post("/login", login);


// User Routes
router.get("/users/getProfile", authMiddleware,getProfile);
router.get("/users/getPosts", authMiddleware,getUserPosts);
router.put("/users/Posts/:id", authMiddleware, uploadMultipleImages(),updatePost);
router.delete("/users/Posts/:postId", authMiddleware, deletePost);
router.post("/orders", authMiddleware, addToCart);
router.get("/users/order",authMiddleware,getCart)
router.get("/admin/all-orders",getAllOrders)
router.delete("/admin/remove-order/:id",deleteOrder)
router.get("/admin/mental", getMentalHealthPosts);
// router.delete("/admin/mental/:id", deleteMentalHealthPost);
router.delete("/admin/mental/:id", deleteMentalHealthPost);

router.get("/admin/:id", authMiddleware, getMentalHealthPostById);
// router.post("/order", authMiddleware, placeOrder);
router.put("/users/updateprofile", authMiddleware, uploadSingleImage('image'), updateProfile)

//post
// router.post("/post", authMiddleware, uploadProductImages.array('image',10),createPost );
router.post("/post", authMiddleware, uploadMultipleImages(), createPost);


router.post("/post/follow/:postId", followPost );
router.post("/post/saved/:postId", authMiddleware,savePost)
router.get("/post/followers/:postId",getPostFollowers);
router.get("/post", getAllPosts)
router.get("/post/search", searchPostsByCategory)
router.get("/post/saved", authMiddleware,getSavedPosts)
router.get("/posts/category/:category", getPostsByCategory);


///like comments
router.put("/like/:postId", authMiddleware, toggleLikePost);
router.post("/comment/:postId", authMiddleware, addComment);

// Get all comments
router.get("/:postId/comments", getComments);

//forget password
router.post("/forget-password", forgetPassword); // Step 1: Request OTP
router.post("/verify-otp", verifyOtp);           // Step 2: Verify OTP
router.post("/reset-password", resetPassword);   // Step 3: Reset password

// // Admin Routes
router.get("/admin/users", authMiddleware, adminMiddleware, getUsers);
router.get("/admin/posts", authMiddleware, adminMiddleware, getCommunityPosts);
router.get("/admin/orders", authMiddleware, adminMiddleware, getOrders);
router.get("/admin/post/get",GetAllPostsAdmin)
router.post("/admin/category",authenticateAdmin, createCategory);
router.delete("/admin/category/:categoryId",authenticateAdmin, removeCategory );
router.post("/admin/create",createAdmin)
router.post("/admin/login", loginAdmin); 
router.post("/admin/change-password",authenticateAdmin, changeAdminPassword)

// router.post("/admin/post/mental",  authMiddleware, upload.single('image'),createMentalHealthPost);
router.post("/admin/post/mental", authMiddleware, adminMiddleware, uploadMultipleImages(), createMentalHealthPost);
// router.post("/admin/post",authMiddleware,upload.single('image'), PostAdmin);
router.post("/admin/post", authMiddleware, adminMiddleware, uploadMultipleImages(), PostAdmin);

router.put("/admin/post/:id", authMiddleware,upload.single('image'), updateMentalHealthPost);
router.put("/admin/post/:id", authMiddleware, adminMiddleware, upload.single('image'), UpdatePost);
router.delete("/admin/post/:postId", authMiddleware, adminMiddleware, DeletePost);

// router.get("/admin/apost", authMiddleware,upload.single('image'), GetAllPostsAdmin);


//products

// router.post("/admin/addProduct", authMiddleware,upload.array('images'), addProductHandler);
router.post("/admin/addProduct", authMiddleware,uploadMultipleImages(), addProductHandler);
router.delete("/admin/product/:id", deleteProduct); 
router.get("/allproducts", getAllProducts);
router.get("/products/:id", authMiddleware, getProductById);
router.get("/allcategory", getAllCategories);
router.get("/category/:categoryId", authMiddleware, getCategoryById);


//Notification
router.get("/notifications",authMiddleware, getNotifications);

//question
router.post("/question",authMiddleware,createMenstrualHealth)
router.put("/question",authMiddleware,updateMenstrualHealth)

//PartnerROute
router.get("/partner/:partnerId", getUserByPartnerId); // ✅ Get User by Partner ID; // ✅ Get User's Partner ID
router.get("/partner/profile/:userId", getPartnerProfile); 

//followers users

router.post("/users/follow/:userId", authMiddleware,followUser); 
router.get("/users/followers/:userId",getFollowers); 
router.get("/users/following/:userId", getFollowing); 




// Routes counseller
router.post("/admin/add", uploadMultipleImages(), authenticateAdmin,addCounselor); // Admin adds counselor
router.post("/counseller/login", loginCounselor)
router.get("/all", getAllCounselors); // Get all counselors
router.get("/:id", getCounselorById); // Get counselor by ID
router.delete("/admin/counselor/:id", deleteCounselor);
router.put("/update/:id",authMiddleware, updateCounselor); // Admin deletes counselor
router.put("/password/:id", updateCounselorPassword); // Admin deletes counselor


export default router;
