const express = require('express');
const userRoutes = require('./user.routes');
const postRoutes = require('./post.routes');

const newsletterRoutes = require('./newsletter.routes');
const contactRoutes = require('./contact.routes');
const pageRoutes = require('./page.routes');
const searchRoutes = require('./search.routes');
const likeRoutes = require('./like.routes');
const bookmarkRoutes = require('./bookmark.routes');
const cookieRoutes = require('./cookie.routes');
const sitemapRoutes = require('./sitemap.routes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/contact', contactRoutes);
router.use('/pages', pageRoutes);
router.use('/search', searchRoutes);
router.use('/likes', likeRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/cookies', cookieRoutes);
router.use('/sitemap', sitemapRoutes);

module.exports = router;