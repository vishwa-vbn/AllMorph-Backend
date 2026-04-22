
const contactModel = require("../models/contact.model");
const { successResponse, errorResponse } = require("../utils/response");

async function sendMessageHandler(req, res) {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return errorResponse(res, 400, "All fields are required");
    }
    const newMessage = await contactModel.createMessage(req.body);
    return successResponse(res, 201, "Message sent successfully", newMessage);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getAllMessagesHandler(req, res) {
  try {
    const messages = await contactModel.getAllMessages();
    return successResponse(res, 200, "Messages retrieved successfully", messages);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getMessageByIdHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const message = await contactModel.getMessageById(id);
    if (!message) return errorResponse(res, 404, "Message not found");
    return successResponse(res, 200, "Message retrieved successfully", message);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function updateMessageStatusHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!status) return errorResponse(res, 400, "Status is required");
    const updatedMessage = await contactModel.updateMessageStatus(id, status);
    if (!updatedMessage) return errorResponse(res, 404, "Message not found");
    return successResponse(res, 200, "Message status updated successfully", updatedMessage);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function deleteMessageHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const deletedMessage = await contactModel.deleteMessage(id);
    if (!deletedMessage) return errorResponse(res, 404, "Message not found");
    return successResponse(res, 200, "Message deleted successfully", deletedMessage);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getUnreadMessagesHandler(req, res) {
  try {
    const messages = await contactModel.getUnreadMessages();
    return successResponse(res, 200, "Unread messages retrieved successfully", messages);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getUnreadMessagesCountHandler(req, res) {
  try {
    const count = await contactModel.getUnreadMessagesCount();

    return successResponse(
      res,
      200,
      "Unread messages count retrieved successfully",
      { count }
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

module.exports = {
  sendMessageHandler,
  getAllMessagesHandler,
  getMessageByIdHandler,
  updateMessageStatusHandler,
  deleteMessageHandler,
  getUnreadMessagesHandler,
  getUnreadMessagesCountHandler
};
