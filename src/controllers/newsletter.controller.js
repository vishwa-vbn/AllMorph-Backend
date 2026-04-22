
const newsletterModel = require("../models/newsletter.model");
const { successResponse, errorResponse } = require("../utils/response");
const crypto = require("crypto");

async function subscribeHandler(req, res) {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, "Email is required");

    const token = crypto.randomBytes(32).toString("hex");
    const subscriber = await newsletterModel.subscribe(email, token);

    return successResponse(res, 201, "Subscribed successfully. Please verify your email.", {
      email: subscriber.email,
      verification_token: subscriber.verification_token, // In a real app, this would be sent via email
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getAllSubscribersHandler(req, res) {
  try {
    const subscribers = await newsletterModel.getAllSubscribers();
    return successResponse(res, 200, "Subscribers retrieved successfully", subscribers);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getSubscriberByIdHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const subscriber = await newsletterModel.getSubscriberById(id);
    if (!subscriber) return errorResponse(res, 404, "Subscriber not found");
    return successResponse(res, 200, "Subscriber retrieved successfully", subscriber);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function verifySubscriberHandler(req, res) {
  try {
    const { token } = req.params;
    const subscriber = await newsletterModel.verifySubscriber(token);
    if (!subscriber) return errorResponse(res, 400, "Invalid or expired verification token");
    return successResponse(res, 200, "Email verified successfully", subscriber);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function unsubscribeHandler(req, res) {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, "Email is required");
    const subscriber = await newsletterModel.unsubscribe(email);
    if (!subscriber) return errorResponse(res, 404, "Subscriber not found");
    return successResponse(res, 200, "Unsubscribed successfully", subscriber);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getSubscriberCountHandler(req, res) {
  try {
    const count = await newsletterModel.getSubscriberCount();
    return successResponse(res, 200, "Subscriber count retrieved successfully", { count });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

module.exports = {
  subscribeHandler,
  getAllSubscribersHandler,
  getSubscriberByIdHandler,
  verifySubscriberHandler,
  unsubscribeHandler,
  getSubscriberCountHandler,
};
