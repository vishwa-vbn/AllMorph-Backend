const fs = require("fs");
const path = require("path");
const sitemapModel = require("../models/sitemap.model");
const { successResponse, errorResponse } = require("../utils/response");

// --- HELPER FUNCTION TO BUILD XML ---
function buildSitemapXml(urls, baseUrl) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Add base URL (Homepage)
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += `  </url>\n`;

  // 2. Process Posts
  urls.posts.forEach((post) => {
    xml += `  <url>\n`;
    // Update "/post/" if your frontend uses a different route structure for blog posts
    xml += `    <loc>${baseUrl}/post/${post.slug}</loc>\n`;
    if (post.updated_at) {
      try {
        const dateObj = new Date(post.updated_at);
        if (!isNaN(dateObj)) {
          xml += `    <lastmod>${dateObj.toISOString()}</lastmod>\n`;
        }
      } catch (e) {}
    }
    xml += `  </url>\n`;
  });

  // 3. Process Pages
  urls.pages.forEach((page) => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/${page.slug}</loc>\n`;
    if (page.updated_at) {
      try {
        const dateObj = new Date(page.updated_at);
        if (!isNaN(dateObj)) {
          xml += `    <lastmod>${dateObj.toISOString()}</lastmod>\n`;
        }
      } catch (e) {}
    }
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
}

// --- UPDATED GENERATOR HANDLER ---
async function storeLogHandler(req, res) {
  try {
    // 1. Fetch real active URLs from your database
    const activeUrls = await sitemapModel.getActiveUrls();
    // Total count = posts + pages + 1 (for the homepage itself)
    const total_urls = activeUrls.posts.length + activeUrls.pages.length + 1;

    // 2. Build the XML content
    // Replace with your actual domain or use an environment variable (e.g., process.env.FRONTEND_URL)
    const baseUrl = process.env.FRONTEND_URL || "https://yourdomain.com";
    const sitemapContent = buildSitemapXml(activeUrls, baseUrl);

    // 3. Write the sitemap.xml to your 'public' folder
    const publicDir = path.join(__dirname, "../public");

    // Create the public directory if it doesn't already exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const sitemapPath = path.join(publicDir, "sitemap.xml");
    fs.writeFileSync(sitemapPath, sitemapContent, "utf8");

    // 4. Store the ACTUAL log count in the database
    const log = await sitemapModel.storeLog(total_urls);

    return successResponse(
      res,
      201,
      "Sitemap generated and log stored successfully",
      log,
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getAllLogsHandler(req, res) {
  try {
    const logs = await sitemapModel.getAllLogs();
    return successResponse(
      res,
      200,
      "Sitemap logs retrieved successfully",
      logs,
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getLatestLogHandler(req, res) {
  try {
    const log = await sitemapModel.getLatestLog();
    if (!log) return errorResponse(res, 404, "No sitemap logs found");
    return successResponse(
      res,
      200,
      "Latest sitemap log retrieved successfully",
      log,
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function deleteLogHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const deletedLog = await sitemapModel.deleteLog(id);

    if (!deletedLog)
      return errorResponse(res, 404, "Sitemap log record not found");

    return successResponse(
      res,
      200,
      "Sitemap log deleted successfully",
      deletedLog,
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

module.exports = {
  storeLogHandler,
  getAllLogsHandler,
  getLatestLogHandler,
  deleteLogHandler,
};
