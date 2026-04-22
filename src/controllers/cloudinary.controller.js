const cloudinary = require('../config/cloudinaryConfig');
const { successResponse, errorResponse } = require('../utils/response');

// ────────────────────────────────────────────────
// Upload: always to ROOT, any file type
// ────────────────────────────────────────────────
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'file is required');
    }

    // Safe filename: timestamp + sanitized original name (without extension)
    let fileName = req.body.fileName || 
      `${Date.now()}-${req.file.originalname.split('.')[0].replace(/[^a-zA-Z0-9-_]/g, '_')}`;

    // Keep original extension in public_id for clarity
    const extension = req.file.originalname.split('.').pop();
    if (extension && extension !== fileName) {
      fileName += `.${extension}`;
    }

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      public_id: fileName,           // no folder prefix → root level
      resource_type: 'auto',         // auto-detects image/video/raw/etc
      overwrite: true,
    });

    return successResponse(res, 201, 'File uploaded successfully', {
      assetId: uploadResponse.asset_id,
      url: uploadResponse.secure_url,
      name: uploadResponse.public_id.split('/').pop(),
      type: uploadResponse.resource_type,
      format: uploadResponse.format,
      fullPublicId: uploadResponse.public_id,
      bytes: uploadResponse.bytes,
      created_at: uploadResponse.created_at,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return errorResponse(res, 500, error.message || 'Failed to upload file');
  }
};

// ────────────────────────────────────────────────
// List: show ALL assets at root (no folders, no filtering by path)
// ────────────────────────────────────────────────
const listAssets = async (req, res) => {
  try {
    const {
      type = 'all',      // 'image', 'video', 'raw', 'all'
      sort = 'desc',     // 'asc' or 'desc' by created_at
      limit = 100,
      skip,              // next_cursor
    } = req.query;

    // Normalize type → Cloudinary does NOT accept 'all' as resource_type
    let resourceType;
    if (type === 'all') {
      resourceType = undefined; // omit → gets images + videos + raw + etc.
    } else if (['image', 'video', 'raw'].includes(type)) {
      resourceType = type;
    } else {
      resourceType = 'image'; // fallback to most common
    }

    const params = {
      type: 'upload',                         // your own uploads
      max_results: parseInt(limit) || 100,
      direction: sort.toLowerCase() === 'asc' ? 'asc' : 'desc',
    };

    if (resourceType) {
      params.resource_type = resourceType;
    }

    if (skip && skip !== '0') {
      params.next_cursor = skip;
    }

    console.log('Cloudinary API params:', params); // ← debug

    const result = await cloudinary.api.resources(params);

    const formatted = (result.resources || []).map(r => ({
      assetId: r.asset_id,
      asset_id: r.asset_id,
      name: r.public_id.split('/').pop(),
      display_name: r.public_id.split('/').pop(),
      url: r.secure_url,
      secure_url: r.secure_url,
      type: 'file',
      resource_type: r.resource_type,
      format: r.format || 'unknown',
      bytes: r.bytes,
      created_at: r.created_at,
      original_filename: r.original_filename || '',
      public_id: r.public_id,           // useful for delete
    }));

    return successResponse(res, 200, 'Assets retrieved', {
      assets: formatted,
      next_cursor: result.next_cursor || null,
      has_more: !!result.next_cursor,
    });
  } catch (error) {
    console.error('listAssets error details:', {
      message: error.message,
      http_code: error.http_code,
      response: error.response ? error.response.body : null,
      stack: error.stack?.slice(0, 300),
    });

    return errorResponse(res, 500, error.message || 'Failed to list assets');
  }
};

// File details (unchanged)
const getFileDetails = async (req, res) => {
  try {
    const { assetId } = req.params;
    if (!assetId) return errorResponse(res, 400, 'assetId is required');

    const details = await cloudinary.api.resource_by_asset_id(assetId);

    return successResponse(res, 200, 'File details retrieved', {
      assetId: details.asset_id,
      publicId: details.public_id,
      url: details.secure_url,
      name: details.public_id.split('/').pop(),
      type: details.resource_type,
      format: details.format,
      bytes: details.bytes,
      createdAt: details.created_at,
    });
  } catch (error) {
    console.error('getFileDetails error:', error);
    return errorResponse(res, 500, error.message || 'Failed to get details');
  }
};

// Delete (unchanged)
const deleteFile = async (req, res) => {
  try {
    const { assetId } = req.params;
    if (!assetId) return errorResponse(res, 400, 'assetId is required');

    const asset = await cloudinary.api.resource_by_asset_id(assetId);
    if (!asset?.public_id) return errorResponse(res, 404, 'Asset not found');

    const result = await cloudinary.uploader.destroy(asset.public_id, {
      resource_type: asset.resource_type,
      invalidate: true,
    });

    if (result.result !== 'ok') {
      return errorResponse(res, 400, `Delete failed: ${result.result}`);
    }

    return successResponse(res, 200, 'File deleted successfully');
  } catch (error) {
    console.error('deleteFile error:', error);
    return errorResponse(res, 500, error.message || 'Failed to delete file');
  }
};



/*
--------------------------------
Search Posts
--------------------------------
*/
async function searchPostsHandler(req, res) {
  try {
    const q = req.query.q || "";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const posts = await postModel.searchPosts(q, page, limit);

    return successResponse(res, 200, "Search results fetched", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Similar Posts
--------------------------------
*/
async function getSimilarPostsHandler(req, res) {
  try {
    const slug = req.params.slug;
    const posts = await postModel.getSimilarPosts(slug);

    return successResponse(res, 200, "Similar posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Recommended Posts
--------------------------------
*/
async function getRecommendedPostsHandler(req, res) {
  try {
    const posts = await postModel.getRecommendedPosts();

    return successResponse(res, 200, "Recommended posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Trending Posts
--------------------------------
*/
async function getTrendingPostsHandler(req, res) {
  try {
    const posts = await postModel.getTrendingPosts();

    return successResponse(res, 200, "Trending posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Latest Posts
--------------------------------
*/
async function getLatestPostsHandler(req, res) {
  try {
    const posts = await postModel.getLatestPosts();

    return successResponse(res, 200, "Latest posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Posts By Author
--------------------------------
*/
async function getPostsByAuthorHandler(req, res) {
  try {
    const authorId = parseInt(req.params.authorId, 10);
    const posts = await postModel.getPostsByAuthor(authorId);

    return successResponse(res, 200, "Author posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Archive
--------------------------------
*/
async function getArchivePostsHandler(req, res) {
  try {
    const year = req.query.year;
    const month = req.query.month;

    const posts = await postModel.getArchivePosts(year, month);

    return successResponse(res, 200, "Archive posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Featured Posts
--------------------------------
*/
async function getFeaturedPostsHandler(req, res) {
  try {
    const posts = await postModel.getFeaturedPosts();

    return successResponse(res, 200, "Featured posts retrieved", posts);
  } catch (err) {
    return errorResponse(res, err);
  }
}

/*
--------------------------------
Next / Previous Navigation
--------------------------------
*/
async function getPostNavigationHandler(req, res) {
  try {
    const slug = req.params.slug;

    const nav = await postModel.getPostNavigation(slug);

    return successResponse(res, 200, "Navigation posts retrieved", nav);
  } catch (err) {
    return errorResponse(res, err);
  }
}




module.exports = {
  uploadFile,
  listAssets,
  getFileDetails,
  deleteFile,
};