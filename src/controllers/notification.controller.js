import {prisma} from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| Create Notification
|--------------------------------------------------------------------------
*/
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type = "INFO", metadata = {} } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "userId, title and message are required",
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        metadata: metadata, // Prisma will handle JSON automatically
      },
    });

    return res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get My Notifications
|--------------------------------------------------------------------------
*/
export const getMyNotificationsController = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware (Prisma uses 'id')
    const { limit = 50, offset = 0 } = req.query;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Mark Notification as Read
|--------------------------------------------------------------------------
*/
export const markAsReadController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId, // ensure notification belongs to the user
      },
      data: { isRead: true },
    });

    if (notification.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Fetch updated notification to return it
    const updatedNotification = await prisma.notification.findUnique({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Mark All as Read
|--------------------------------------------------------------------------
*/
export const markAllAsReadController = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};