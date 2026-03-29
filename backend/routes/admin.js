const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All admin routes require authentication + admin role
router.use(verifyToken, adminMiddleware);

// ===== Dashboard Stats =====
router.get('/stats', adminController.getDashboardStats);

// ===== User Management =====
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/ban', adminController.toggleUserBan);
router.patch('/users/:id/role', adminController.changeUserRole);

// ===== Listing Management =====
router.get('/listings', adminController.getAllListings);
router.delete('/listings/:id', adminController.deleteAnyListing);
router.patch('/listings/:id/status', adminController.changeListingStatus);

// ===== Offer Management =====
router.get('/offers', adminController.getAllOffers);
router.delete('/offers/:id', adminController.deleteOffer);

// ===== Category Management (CRUD) =====
router.get('/categories', adminController.getCategoryStats);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// ===== Audit & Activity Logs =====
router.get('/audit-log', adminController.getAuditLog);
router.get('/activity-log', adminController.getAdminActivityLog);

// ===== Reports & Analytics =====
router.get('/reports/categories', adminController.getCategoryReport);
router.get('/reports/top-sellers', adminController.getTopSellers);
router.get('/reports/recent-activity', adminController.getRecentActivity);
router.get('/reports/db-objects', adminController.getDBObjects);

module.exports = router;
