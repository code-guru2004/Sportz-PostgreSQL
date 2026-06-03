import {prisma} from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| Get Coach Dashboard Stats
|--------------------------------------------------------------------------
| Returns:
| - Active schedules
| - Total schedules
| - Total players of coach's sport
*/

export const getCoachDashboardStats = async (req, res) => {
  try {
    const coachId = req.user.id; // from auth middleware

    // Check coach exists
    const coach = await prisma.user.findUnique({
      where: { id: coachId }
    });

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found",
      });
    }

    // Get coach profile to know sport
    const coachProfile = await prisma.profile.findUnique({
      where: { userId: coachId }
    });

    if (!coachProfile) {
      return res.status(404).json({
        success: false,
        message: "Coach profile not found",
      });
    }

    const coachSport = coachProfile.sport;

    // Total schedules of coach
    const totalSchedules = await prisma.schedule.count({
      where: { coachId }
    });

    // Active schedules (status SCHEDULED)
    const activeSchedules = await prisma.schedule.count({
      where: {
        coachId,
        status: "SCHEDULED"
      }
    });

    // Total athletes (users with role ATHLETE, approved, verified, not blocked, and profile with same sport)
    const totalPlayersOfSport = await prisma.profile.count({
      where: {
        sport: coachSport,
        user: {
          role: "ATHLETE",
          isVerified: true,
          approvalStatus: "APPROVED",   // replaced isApproved: true
          isBlocked: false
        }
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        sport: coachSport,
        activeSchedules,
        totalSchedules,
        totalPlayersOfSport,
      },
    });

  } catch (error) {
    console.error("Coach Dashboard Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Athletes By Sport
|--------------------------------------------------------------------------
| Example:
| GET /api/users/athletes?sport=CRICKET
| GET /api/users/athletes?sport=FOOTBALL
*/

export const getAthletes = async (req, res) => {
  try {
    const { sport } = req.query;

    if (!sport) {
      return res.status(400).json({
        success: false,
        message: "Sport is required",
      });
    }

    // Find all profiles with given sport, where the related user is an ATHLETE, verified, approved, not blocked
    const profiles = await prisma.profile.findMany({
      where: {
        sport: sport.toUpperCase(),
        user: {
          role: "ATHLETE",
          isVerified: true,
          approvalStatus: "APPROVED",   // replaced isApproved: true
          isBlocked: false
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            role: true
          }
        }
      }
    });

    // Transform to match original response structure
    const athletes = profiles.map(profile => ({
      ...profile,
      user: profile.user
    }));

    return res.status(200).json({
      success: true,
      count: athletes.length,
      athletes
    });

  } catch (error) {
    console.error("Get Athletes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch athletes",
      error: error.message,
    });
  }
};