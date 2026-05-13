import * as adService from './ad.service.js';
import Ad from './ad.model.js';
import User from '../../models/User.js';
import { sendMail } from '../../utils/mailer.js';
import { getAdLiveEmailHtml } from '../../templates/adLiveEmail.js';
import { decryptField } from '../../utils/fieldEncryption.js';

export const getAds = async (req, res) => {
  try {
    const { placement, count, seenAdIds, userLat, userLng } = req.body;
    const country = req.country; // Set by countryGateway
    
    if (!placement || !country) {
      return res.status(400).json({ success: false, message: 'Placement and country are required' });
    }

    const ads = await adService.getAdsForPlacement({
      placement,
      count: count || 5,
      seenAdIds: seenAdIds || [],
      country,
      userLat,
      userLng
    });

    res.status(200).json({ success: true, data: ads });
  } catch (error) {
    console.error('[AdController] getAds error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching ads' });
  }
};

export const trackImpression = async (req, res) => {
  try {
    const { adId, sessionId, placement } = req.body;
    // userId is optional, we get it from auth middleware if logged in
    const userId = req.user ? req.user._id : null;

    if (!adId || !sessionId || !placement) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = await adService.trackImpression({ adId, sessionId, placement, userId });

    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false, message: result.reason }); // Not a 400 error, just discarded
    }
  } catch (error) {
    console.error('[AdController] trackImpression error:', error);
    res.status(500).json({ success: false, message: 'Server error tracking impression' });
  }
};

export const createAd = async (req, res) => {
  try {
    const { title, description, url, images, city, lat, lng, radius, placement, targetCategory, targetImpressions } = req.body;
    
    // Ensure we have a valid country from gateway
    const country = req.country;
    if (!country) return res.status(400).json({ success: false, message: 'Country is required' });

    // Validate geo coordinates
    if (lat == null || lng == null) {
      return res.status(400).json({ success: false, message: 'Precise GPS location (lat, lng) is required for ad targeting.' });
    }

    // Sanitize images if they are blob URLs (blob URLs don't work across clients)
    // Replace them with a random unsplash placeholder for testing
    let processedImages = images || [];
    if (processedImages.length > 0 && processedImages[0].startsWith('blob:')) {
      processedImages = ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400'];
    }

    const newAd = new Ad({
      advertiser: req.user._id,
      title,
      description,
      url,
      images: processedImages,
      city,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)] // GeoJSON is [longitude, latitude]
      },
      radius: parseInt(radius) || 10,
      country,
      placement,
      targetCategory: targetCategory || null,
      target_impressions: targetImpressions,
      delivered_impressions: 0,
      status: 'active' // Bypassing payment for now
    });

    await newAd.save();

    // Send "Ad is Live" email to the advertiser (non-blocking)
    try {
      const advertiser = await User.findById(req.user._id).lean();
      if (advertiser) {
        const advertiserEmail = decryptField(advertiser.email);
        const advertiserName = decryptField(advertiser.name) || "Advertiser";
        sendMail({
          to: advertiserEmail,
          subject: `🚀 Your Ad "${title}" is Now Live – DealNBuy EU`,
          html: getAdLiveEmailHtml({
            name: advertiserName,
            adTitle: title,
            city: city || "Your Area",
            radius: parseInt(radius) || 10,
            placement: placement || "homepage",
            targetImpressions: targetImpressions || 0,
            adImageUrl: processedImages[0] || "",
            frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
          }),
        }).catch(err => console.error("Ad live email failed:", err.message));
      }
    } catch (emailErr) {
      console.error("[AdController] Failed to send ad live email:", emailErr.message);
    }

    res.status(201).json({ success: true, data: newAd });
  } catch (error) {
    console.error('[AdController] createAd error:', error);
    res.status(500).json({ success: false, message: 'Server error creating ad' });
  }
};

export const getMyCampaigns = async (req, res) => {
  try {
    const userId = req.user._id;

    const campaigns = await Ad.find({ advertiser: userId })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    const stats = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.active).length,
      totalImpressions: campaigns.reduce((sum, c) => sum + (c.delivered_impressions || 0), 0),
      totalTargetImpressions: campaigns.reduce((sum, c) => sum + (c.target_impressions || 0), 0),
    };

    res.status(200).json({ success: true, data: { campaigns, stats } });
  } catch (error) {
    console.error('[AdController] getMyCampaigns error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching campaigns' });
  }
};
