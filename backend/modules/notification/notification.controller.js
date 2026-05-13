import Notification from "./Notification.model.js";

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const country = req.country;

    // Get notifications targeted to this user directly OR broadcast to "all" in their country
    // Exclude notifications they have cleared
    const notifications = await Notification.find({
      $or: [
        { targetAudience: "all", country },
        { targetUserIds: userId }
      ],
      clearedBy: { $ne: userId }
    })
    .sort({ createdAt: -1 })
    .limit(50);

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Server error fetching notifications" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await Notification.findByIdAndUpdate(id, {
      $addToSet: { readBy: userId }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const country = req.country;

    // Find all unread notifications targeted at this user
    const notifications = await Notification.find({
      $or: [
        { targetAudience: "all", country },
        { targetUserIds: userId }
      ],
      readBy: { $ne: userId }
    });

    if (notifications.length > 0) {
      await Notification.updateMany(
        { _id: { $in: notifications.map(n => n._id) } },
        { $addToSet: { readBy: userId } }
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error marking all as read" });
  }
};

export const clearNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await Notification.findByIdAndUpdate(id, {
      $addToSet: { clearedBy: userId }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error clearing notification" });
  }
};
