import {prisma} from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| Create Schedule (Coach Only)
|--------------------------------------------------------------------------
*/
export const createScheduleController = async (req, res) => {
  try {
    const {
      title,
      sport,
      date,
      time,
      location,
      description,
      duration,
      maxParticipants,
    } = req.body;

    if (!title || !sport || !date || !time || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const schedule = await prisma.schedule.create({
      data: {
        title,
        sport,
        date: new Date(date),
        time,
        location,
        description,
        duration: duration || 60,
        maxParticipants: maxParticipants || 50,
        coachId: req.user.id,
      },
    });

    // Notify all athletes (approved, verified, not blocked)
    const athletes = await prisma.user.findMany({
      where: {
        role: "ATHLETE",
        approvalStatus: "APPROVED",   // changed from isApproved: true
        isVerified: true,
        isBlocked: false,
      },
      select: { id: true },
    });

    if (athletes.length > 0) {
      const notifications = athletes.map((athlete) => ({
        userId: athlete.id,
        title: "New Training Schedule",
        message: `A new ${sport.toLowerCase()} training session "${title}" has been scheduled on ${new Date(date).toLocaleDateString()} at ${time}`,
        type: "SCHEDULE",
        metadata: {
          scheduleId: schedule.id,
          actionUrl: `/schedules/${schedule.id}`,
        },
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      schedule,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get All Schedules (Filtered by sport for athletes)
|--------------------------------------------------------------------------
*/
export const getSchedulesController = async (req, res) => {
  try {
    const where = {};

    // If user is athlete, only show schedules for their sport
    if (req.user.role === "ATHLETE") {
      const profile = await prisma.profile.findUnique({
        where: { userId: req.user.id },
        select: { sport: true },
      });
      if (profile) {
        where.sport = profile.sport;
      }
    }

    // Filter by sport param if provided
    if (req.query.sport) {
      where.sport = req.query.sport;
    }

    // Date filters
    if (req.query.startDate) {
      where.date = { gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      where.date = { ...where.date, lte: new Date(req.query.endDate) };
    }

    // Only show future schedules by default
    if (req.query.showPast !== "true") {
      where.date = { ...where.date, gte: new Date() };
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        coach: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return res.status(200).json({
      success: true,
      schedules,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Schedule (Coach Only - Own Schedules)
|--------------------------------------------------------------------------
*/
export const updateScheduleController = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check schedule exists and belongs to coach
    const schedule = await prisma.schedule.findFirst({
      where: {
        id,
        coachId: req.user.id,
      },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found or you don't have permission",
      });
    }

    // Prepare update data (convert date if present)
    const updateData = { ...updates };
    if (updates.date) {
      updateData.date = new Date(updates.date);
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete Schedule (Coach Only - Own Schedules)
|--------------------------------------------------------------------------
*/
export const deleteScheduleController = async (req, res) => {
  try {
    const { id } = req.params;

    // Check schedule exists and belongs to coach
    const schedule = await prisma.schedule.findFirst({
      where: {
        id,
        coachId: req.user.id,
      },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found or you don't have permission",
      });
    }

    await prisma.schedule.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// get schedule by id (public)
export const getScheduleByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        coach: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    return res.status(200).json({
      success: true,
      schedule,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};