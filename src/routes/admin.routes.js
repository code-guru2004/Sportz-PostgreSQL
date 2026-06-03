// routes/admin.routes.js
import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  getPendingUsersController,
  getAllUsersController,
  approveUserController,
  rejectUserController,
  deleteUserController,
  toggleBlockUserController,
  getAnalyticsController,
  getUserDetailsController,
  filterUsersController
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect);
router.use(authorize("ADMIN"));

router.get("/pending-users", getPendingUsersController);
router.get("/users", getAllUsersController);
router.get("/analytics", getAnalyticsController);
router.post("/approve/:id", approveUserController);
router.post("/reject/:id", rejectUserController);
router.delete("/user/:id", deleteUserController);
router.post("/toggle-block/:id", toggleBlockUserController);
router.get("/users/:id", getUserDetailsController);
router.get("/users",filterUsersController);
export default router;