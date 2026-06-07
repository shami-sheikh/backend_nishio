import Notification from "../models/notification-model.js";

const createNotification = async ({ recipient, sender, type, post, reel, message }) => {
  // don't notify yourself
  if (String(recipient) === String(sender)) return;

  await Notification.create({ recipient, sender, type, post, reel, message });
};

export default createNotification;