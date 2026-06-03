import express from "express";

import {
    registerController,
    loginController,
    refreshTokenController,
    logoutController,
    verifyEmailController,
} from "../controllers/auth.controller.js";

import {
    protect
} from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, registerSchema, verifyEmailSchema } from "../validations/auth.validation.js";



const router = express.Router();



/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Register User
router.post(
    "/register",
    validate(registerSchema),
    registerController
);


// Login User
router.post(
    "/login",
    validate(loginSchema),
    loginController
);


// Refresh Access Token
router.post(
    "/refresh-token",
    refreshTokenController
);


// Verify Email OTP
router.post(
    "/verify-email",
    validate(verifyEmailSchema),
    verifyEmailController
);




/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

// Logout User
router.post(
    "/logout",
    protect,
    logoutController
);


// Get Current Logged In User
router.get(
    "/me",
    protect,
    async (req, res) => {

        return res.status(200).json({

            success: true,

            user: req.user
        });
    }
);



export default router;