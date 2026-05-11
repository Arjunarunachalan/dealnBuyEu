import express from 'express';
import * as adController from './ad.controller.js';
import { protect, optionalAuth } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Fetch ads for placement (uses POST to easily send seenAdIds array)
router.post('/fetch', optionalAuth, adController.getAds);

// Track impression
router.post('/track-impression', optionalAuth, adController.trackImpression);

// Create Ad (Test Bypass)
router.post('/create', protect, adController.createAd);

// My Campaigns (Advertiser Dashboard)
router.get('/my-campaigns', protect, adController.getMyCampaigns);

export default router;
