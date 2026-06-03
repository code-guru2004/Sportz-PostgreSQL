// routes/schedule.routes.js
import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  createScheduleController,
  getSchedulesController,
  updateScheduleController,
  deleteScheduleController,
  getScheduleByIdController
} from "../controllers/schedule.controller.js";

const router = express.Router();

router.use(protect);

// Public routes (all authenticated users)
router.get("/", getSchedulesController);

// Coach only routes
router.post("/", authorize("COACH", "ADMIN"), createScheduleController);
router.get("/:id", getScheduleByIdController); // Get schedule by ID (public)
router.put("/:id", authorize("COACH", "ADMIN"), updateScheduleController);
router.delete("/:id", authorize("COACH", "ADMIN"), deleteScheduleController);

export default router;