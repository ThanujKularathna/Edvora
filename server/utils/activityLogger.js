const Activity = require('../models/activityModel');

const logActivity = async (userId, action, details = '', req = null) => {
  try {
    const activityData = {
      user: userId,
      action,
      details
    };

    if (req) {
      activityData.ipAddress = req.ip || req.connection.remoteAddress;
      activityData.userAgent = req.get('User-Agent');
    }

    await Activity.create(activityData);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity };