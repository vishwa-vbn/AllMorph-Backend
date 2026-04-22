
const pageModel = require("../models/page.model");
const { successResponse, errorResponse } = require("../utils/response");

async function createPageHandler(req, res) {
  try {
    const { slug, title, content } = req.body;
    if (!slug || !title || !content) {
      return errorResponse(res, 400, "Slug, title, and content are required");
    }
    const newPage = await pageModel.createPage(req.body);
    return successResponse(res, 201, "Page created successfully", newPage);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getAllPagesHandler(req, res) {
  try {
    const pages = await pageModel.getAllPages();
    return successResponse(res, 200, "Pages retrieved successfully", pages);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getPageBySlugHandler(req, res) {
  try {
    const { slug } = req.params;
    const page = await pageModel.getPageBySlug(slug);
    if (!page) return errorResponse(res, 404, "Page not found");
    return successResponse(res, 200, "Page retrieved successfully", page);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function updatePageHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedPage = await pageModel.updatePage(id, req.body);
    if (!updatedPage) return errorResponse(res, 404, "Page not found");
    return successResponse(res, 200, "Page updated successfully", updatedPage);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function deletePageHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const deletedPage = await pageModel.deletePage(id);
    if (!deletedPage) return errorResponse(res, 404, "Page not found");
    return successResponse(res, 200, "Page deleted successfully", deletedPage);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getPublishedPagesHandler(req, res) {
  try {
    const pages = await pageModel.getPublishedPages();
    return successResponse(res, 200, "Published pages retrieved successfully", pages);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

module.exports = {
  createPageHandler,
  getAllPagesHandler,
  getPageBySlugHandler,
  updatePageHandler,
  deletePageHandler,
  getPublishedPagesHandler,
};
