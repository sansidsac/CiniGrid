import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['schedule_reminder', 'chat_message', 'task_update', 'scene_update'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    data: {
      itemId: String,
      itemType: String,
      itemTitle: String,
      scheduledDate: String,
      scheduledTime: String,
      scheduleInfo: String,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ projectId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, projectId: 1, createdAt: -1 });

// Virtual for formatted date
notificationSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Virtual for formatted time
notificationSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString();
});

// Static method to create schedule notification
notificationSchema.statics.createScheduleNotification = async function({
  itemId,
  itemType,
  itemTitle,
  scheduledDate,
  scheduledTime,
  projectId,
  senderId,
  recipientIds
}) {
  const isScene = itemType === 'scene';
  const scheduleInfo = scheduledDate 
    ? `on ${scheduledDate}${scheduledTime ? ` at ${scheduledTime}` : ''}`
    : 'soon';
  
  // Create separate notification documents for each recipient
  const notifications = [];
  
  for (const recipientId of recipientIds) {
    const notification = new this({
      type: 'schedule_reminder',
      title: `${isScene ? 'Scene' : 'Task'} Schedule Reminder`,
      message: `You are assigned to ${isScene ? 'scene' : 'task'} "${itemTitle}" ${scheduleInfo}`,
      recipientId: recipientId,
      sentBy: senderId,
      projectId,
      data: {
        itemId,
        itemType,
        itemTitle,
        scheduledDate,
        scheduledTime,
        scheduleInfo
      },
      read: false,
    });
    
    await notification.save();
    notifications.push(notification);
  }
  
  return notifications;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId, projectId = null) {
  const query = { recipientId: userId, read: false };
  if (projectId) {
    query.projectId = projectId;
  }
  return this.countDocuments(query);
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;