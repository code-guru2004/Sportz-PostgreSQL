// routes/profile.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  completeProfileController,
  getMyProfileController,
  updateProfileController
} from "../controllers/profile.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { completeProfileSchema } from "../validations/profile.validation.js";

const router = express.Router();

router.use(protect); // All routes require authentication

router.post("/complete",validate(completeProfileSchema), completeProfileController);
router.get("/me", getMyProfileController);
router.put("/update", updateProfileController);

export default router;