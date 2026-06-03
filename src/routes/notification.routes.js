// routes/notification.routes.js
import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  getMyNotificationsController,
  markAsReadController,
  markAllAsReadController,
  createNotification
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protect);
router.post("/",authorize("ADMIN","COACH"), createNotification);
router.get("/", getMyNotificationsController);
router.put("/:id/read", markAsReadController);
router.put("/read-all", markAllAsReadController);

export default router;