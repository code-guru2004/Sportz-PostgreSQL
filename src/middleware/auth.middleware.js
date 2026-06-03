import jwt from "jsonwebtoken";
import {prisma} from "../config/prisma.js"; // assuming default export, adjust if needed

/*
|--------------------------------------------------------------------------
| Protect Middleware
|--------------------------------------------------------------------------
*/

export const protect = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Token
    |--------------------------------------------------------------------------
    */

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    /*
    |--------------------------------------------------------------------------
    | Find User
    |--------------------------------------------------------------------------
    */

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Remove password from user object
    delete user.password;

    /*
    |--------------------------------------------------------------------------
    | Account Status Checks
    |--------------------------------------------------------------------------
    */

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account blocked"
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified"
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Profile Completion Check (Skip for profile completion routes)
    |--------------------------------------------------------------------------
    */
    
    // Check if the request is for profile completion
    const isProfileRoute = req.path === "/complete" || req.path === "/me" || req.path === "/me/update" || req.path === "/logout";
    
    // Only check profile completion for non-profile routes
    if (!isProfileRoute && !user.profileCompleted) {
      return res.status(403).json({
        success: false,
        message: "Profile completion required",
        redirectTo: "/complete-profile"
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Approval Status Check (Replaces isApproved boolean)
    |--------------------------------------------------------------------------
    */
    // Only check approval for non-profile routes and for non-admin users
    if (!isProfileRoute && user.role !== "ADMIN") {
      if (user.approvalStatus !== "APPROVED") {
        let message = "Account not approved";
        if (user.approvalStatus === "PENDING") {
          message = "Your account is pending approval. Please wait for admin review.";
        } else if (user.approvalStatus === "REJECTED") {
          message = "Your account has been rejected. Contact support for more information.";
        }
        return res.status(403).json({
          success: false,
          message
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Attach User
    |--------------------------------------------------------------------------
    */

    req.user = user;

    next();

  } catch (error) {
    console.log(error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Role Authorization
|--------------------------------------------------------------------------
*/

export const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden"
        });
      }

      next();

    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };
};