import axios from "axios";
import {prisma} from "../config/prisma.js";
import sendApprovalEmail from "../utils/sendApprovalEmail.js";

/*
|--------------------------------------------------------------------------
| Get Pending Users (status = PENDING)
|--------------------------------------------------------------------------
*/
export const getPendingUsersController = async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: {
        isVerified: true,
        approvalStatus: "PENDING",
        role: { not: "ADMIN" }
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        approvalStatus: true,
        isBlocked: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json({
      success: true,
      users: pendingUsers
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get All Users (supports filter by approvalStatus)
|--------------------------------------------------------------------------
*/
export const getAllUsersController = async (req, res) => {
  try {
    const { role, approvalStatus, isVerified, sport } = req.query;

    let whereCondition = {};

    if (role) whereCondition.role = role;
    if (approvalStatus) whereCondition.approvalStatus = approvalStatus;
    if (isVerified) whereCondition.isVerified = isVerified === "true";

    const users = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        approvalStatus: true,
        isBlocked: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true,
        profile: true
      },
      orderBy: { createdAt: "desc" }
    });

    // Filter by sport if provided (profile.sport)
    let filteredUsers = users;
    if (sport) {
      filteredUsers = users.filter(user => user.profile?.sport === sport.toUpperCase());
    }

    return res.status(200).json({
      success: true,
      users: filteredUsers
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Approve User
|--------------------------------------------------------------------------
*/
export const approveUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id; // from auth middleware

    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update user approval status
    await prisma.user.update({
      where: { id },
      data: {
        approvalStatus: "APPROVED",
        approvedById: adminId,
        approvedAt: new Date()
      }
    });

    const userName = user.profile?.fullName || user.username;

    // Send approval email
    await axios.post(
      `${process.env.EMAIL_SERVICE_URL}/api/email/send-status-email`,
      {
        email: user.email,
        name: userName,
        role: user.role,
        status: "approved",
        message: `Congratulations! Your ${user.role.toLowerCase()} account has been reviewed and approved. You can now log in to the Sports Training Management System and access all features available to ${user.role.toLowerCase()}s.`,
        actionUrl: `https://sportz-frontend-alpha.vercel.app/login`,
      }
    );

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Account Approved! 🎉",
        message: `Your ${user.role.toLowerCase()} account has been approved. You can now access the dashboard.`,
        type: "APPROVAL"
      }
    });

    return res.status(200).json({
      success: true,
      message: "User approved successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Reject User
|--------------------------------------------------------------------------
*/
export const rejectUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userName = user.profile?.fullName || user.username;

    // Update user status to REJECTED (instead of deleting)
    await prisma.user.update({
      where: { id },
      data: {
        approvalStatus: "REJECTED",
        approvedById: adminId,
        approvedAt: new Date(),
        rejectionReason: rejectionReason || "No specific reason provided."
      }
    });


    // Send reject email
    await axios.post(
      `${process.env.EMAIL_SERVICE_URL}/api/email/send-status-email`,
      {
        email: user.email,
        name: userName,
        role: user.role,
        status: "rejected",
        message:
        rejectionReason ||
        `We have reviewed your ${user.role.toLowerCase()} account registration. Unfortunately, we are unable to approve your application at this time. This could be due to incomplete information or not meeting the current requirements. Please contact support for more information.`,
      actionUrl: `https://sportz-frontend-alpha.vercel.app/contact`
      }
    );
    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Account Application Update",
        message: `Your account application has been reviewed and was not approved at this time. Reason: ${rejectionReason || "Please contact support for details."}`,
        type: "APPROVAL"
      }
    });

    return res.status(200).json({
      success: true,
      message: "User rejected"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete User
|--------------------------------------------------------------------------
*/
export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin users"
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Block/Unblock User
|--------------------------------------------------------------------------
*/
export const toggleBlockUserController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked }
    });

    return res.status(200).json({
      success: true,
      message: `User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      isBlocked: updatedUser.isBlocked
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Dashboard Analytics
|--------------------------------------------------------------------------
*/
export const getAnalyticsController = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalAthletes = await prisma.user.count({ where: { role: "ATHLETE" } });
    const totalCoaches = await prisma.user.count({ where: { role: "COACH" } });
    const pendingApprovals = await prisma.user.count({
      where: {
        isVerified: true,
        approvalStatus: "PENDING",
        role: { not: "ADMIN" }
      }
    });
    const totalSchedules = await prisma.schedule.count();
    const upcomingSchedules = await prisma.schedule.count({
      where: {
        date: { gte: new Date() }
      }
    });

    const recentUsers = await prisma.user.findMany({
      where: { role: { not: "ADMIN" } },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        approvalStatus: true,
        isBlocked: true,
        profileCompleted: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    const cricketSchedules = await prisma.schedule.count({
      where: { sport: "CRICKET" }
    });
    const footballSchedules = await prisma.schedule.count({
      where: { sport: "FOOTBALL" }
    });

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalAthletes,
        totalCoaches,
        pendingApprovals,
        totalSchedules,
        upcomingSchedules,
        schedulesBySport: {
          cricket: cricketSchedules,
          football: footballSchedules
        },
        recentUsers
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Particular User Full Details (Admin)
|--------------------------------------------------------------------------
*/
export const getUserDetailsController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        approvalStatus: true,
        isBlocked: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true,
        approvedById: true,
        approvedAt: true,
        rejectionReason: true,
        approvedBy: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: id },
      include: { documents: true }
    });

    let schedules = [];
    if (user.role === "COACH") {
      schedules = await prisma.schedule.findMany({
        where: { coachId: id },
        include: {
          coach: { select: { id: true, username: true, email: true } }
        },
        orderBy: { date: "desc" }
      });
    }
    if (user.role === "ATHLETE") {
      // If athlete-schedule relation exists, query here. For now empty.
      schedules = [];
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const documents = profile?.documents || [];
    const totalSchedules = schedules.length;
    const activeSchedules = schedules.filter(s => s.status === "SCHEDULED").length;
    const completedSchedules = schedules.filter(s => s.status === "COMPLETED").length;
    const unreadNotifications = notifications.filter(n => !n.isRead).length;

    return res.status(200).json({
      success: true,
      userDetails: {
        account: user,
        profile,
        documents,
        schedules,
        notifications,
        stats: {
          totalDocuments: documents.length,
          totalSchedules,
          activeSchedules,
          completedSchedules,
          unreadNotifications
        }
      }
    });
  } catch (error) {
    console.error("Get User Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


/*
|--------------------------------------------------------------------------
| Get user based on filters (Admin)
|--------------------------------------------------------------------------
*/
export const filterUsersController = async (req, res) => {
  try {
    const { role, approvalStatus, isVerified, sport, search } = req.query;

    let whereCondition = {};

    if (role) whereCondition.role = role;
    if (approvalStatus) whereCondition.approvalStatus = approvalStatus;
    if (isVerified) whereCondition.isVerified = isVerified === "true";
    if (sport) whereCondition.profile = { sport: sport.toUpperCase() };
    
    // Add search functionality (by username or email)
    if (search) {
      whereCondition.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        approvalStatus: true,
        isBlocked: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true,
        profile: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};