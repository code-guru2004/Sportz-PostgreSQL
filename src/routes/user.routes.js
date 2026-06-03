import express from "express";
import { getAthletes, getCoachDashboardStats } from "../controllers/user.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

router.get("/athletes",authorize("COACH","ADMIN"), getAthletes);
router.get(
    "/coach/dashboard-stats",
    authorize("COACH"),
    getCoachDashboardStats
  );
export default router;