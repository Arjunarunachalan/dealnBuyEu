import mongoose from 'mongoose';
import Ad from './ad.model.js';
import AdImpression from './adImpression.model.js';
import Redis from 'ioredis';

// Attempt to connect to Redis
let redis;
let useRedis = false;
try {
  redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 3) return null; // Stop retrying
      return Math.min(times * 50, 2000);
    }
  });

  redis.on('error', (err) => {
    console.warn('[AdService] Redis connection error, falling back to in-memory.', err.message);
    useRedis = false;
  });

  redis.on('connect', () => {
    console.log('[AdService] Connected to Redis successfully.');
    useRedis = true;
  });
} catch (e) {
  console.warn('[AdService] Failed to initialize Redis, using in-memory fallback.');
}

// In-memory fallbacks
const memDedupeCache = new Map();
const memFreqCache = new Map();
let memImpressionBuffer = [];

export const getAdsForPlacement = async ({ placement, count = 5, seenAdIds = [], country, userLat, userLng }) => {
  // 1. Build the aggregation pipeline
  const pipeline = [];

  // If user location is provided, start with $geoNear to calculate distance
  if (userLat != null && userLng != null) {
    pipeline.push({
      $geoNear: {
        near: { type: "Point", coordinates: [parseFloat(userLng), parseFloat(userLat)] },
        distanceField: "computed_distance",
        distanceMultiplier: 0.001, // Convert meters to kilometers
        spherical: true,
        query: {
          placement,
          active: true,
          country,
          start_date: { $lte: new Date() }
        }
      }
    });

    // Filter where distance is less than or equal to the ad's defined radius
    pipeline.push({
      $match: {
        $expr: { $lte: ["$computed_distance", "$radius"] }
      }
    });
  } else {
    // Fallback standard query if no user location is provided
    pipeline.push({
      $match: {
        placement,
        active: true,
        country,
        start_date: { $lte: new Date() }
      }
    });
  }

  // Common filters (end_date, target impressions, seen ads)
  const additionalMatch = {
    $expr: { $lt: ["$delivered_impressions", "$target_impressions"] }
  };

  // Only apply end_date filter if it exists on the ad
  additionalMatch.$or = [
    { end_date: { $exists: false } },
    { end_date: null },
    { end_date: { $gte: new Date() } }
  ];

  if (seenAdIds && seenAdIds.length > 0) {
    additionalMatch._id = { $nin: seenAdIds.map(id => new mongoose.Types.ObjectId(id)) }; // This works in aggregation $match
  }

  pipeline.push({ $match: additionalMatch });

  // 2. Execute pipeline to get eligible ads
  let eligibleAds = await Ad.aggregate(pipeline);

  if (!eligibleAds || eligibleAds.length === 0) return [];

  // 3. Score & Sort (Urgency)
  eligibleAds = eligibleAds.map(ad => {
    const urgency = (ad.target_impressions - ad.delivered_impressions) / ad.target_impressions;
    return { ...ad, urgency };
  });

  eligibleAds.sort((a, b) => b.urgency - a.urgency);

  // 4. Select Top 30%
  const topPercentageCount = Math.max(Math.ceil(eligibleAds.length * 0.3), Math.min(5, eligibleAds.length));
  const topPool = eligibleAds.slice(0, topPercentageCount);

  // 5. Randomize selection from the top pool
  for (let i = topPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [topPool[i], topPool[j]] = [topPool[j], topPool[i]];
  }

  return topPool.slice(0, count);
};

export const trackImpression = async ({ adId, sessionId, placement, userId }) => {
  const now = Date.now();
  const dedupeKey = `impression:${adId}:${sessionId}`;
  const freqKey = `session_ad_count:${adId}:${sessionId}`;

  if (useRedis) {
    // 1. Deduplication (3 minutes)
    const exists = await redis.get(dedupeKey);
    if (exists) return { success: false, reason: 'deduplicated' };

    // 2. Frequency Capping (max 3 per session)
    const count = await redis.incr(freqKey);
    if (count === 1) {
      await redis.expire(freqKey, 24 * 60 * 60); // Expire session count after 24h
    }
    if (count > 3) return { success: false, reason: 'frequency_cap_reached' };

    await redis.set(dedupeKey, '1', 'EX', 3 * 60); // 3 minutes lock

    // 3. Buffer impression
    const impressionData = JSON.stringify({ adId, sessionId, placement, userId, timestamp: now });
    await redis.lpush('impression_buffer', impressionData);

  } else {
    // In-memory Fallback Logic
    // Deduplication
    if (memDedupeCache.has(dedupeKey)) {
      const expiry = memDedupeCache.get(dedupeKey);
      if (now < expiry) return { success: false, reason: 'deduplicated' };
    }
    memDedupeCache.set(dedupeKey, now + (3 * 60 * 1000));

    // Cleanup old dedupe keys to prevent memory leak
    if (memDedupeCache.size > 10000) memDedupeCache.clear();

    // Frequency Cap
    const currentCount = memFreqCache.get(freqKey) || 0;
    if (currentCount >= 3) return { success: false, reason: 'frequency_cap_reached' };
    memFreqCache.set(freqKey, currentCount + 1);

    if (memFreqCache.size > 10000) memFreqCache.clear();

    // Buffer
    memImpressionBuffer.push({ adId, sessionId, placement, userId, timestamp: new Date(now) });
  }

  return { success: true };
};

// Flush worker: Runs every 10 seconds
const flushImpressions = async () => {
  let impressionsToProcess = [];

  try {
    if (useRedis) {
      const length = await redis.llen('impression_buffer');
      if (length > 0) {
        // Pop up to 100 impressions
        const batchSize = Math.min(length, 100);
        for (let i = 0; i < batchSize; i++) {
          const item = await redis.rpop('impression_buffer');
          if (item) impressionsToProcess.push(JSON.parse(item));
        }
      }
    } else {
      if (memImpressionBuffer.length > 0) {
        impressionsToProcess = [...memImpressionBuffer];
        memImpressionBuffer = []; // clear buffer
      }
    }

    if (impressionsToProcess.length === 0) return;

    // 1. Bulk insert to AdImpression log
    const bulkInsertData = impressionsToProcess.map(imp => ({
      adId: imp.adId,
      userId: imp.userId || null,
      sessionId: imp.sessionId,
      placement: imp.placement,
      timestamp: imp.timestamp || new Date()
    }));
    
    await AdImpression.insertMany(bulkInsertData);

    // 2. Increment delivered counts on Ads
    const adCounts = {};
    for (const imp of impressionsToProcess) {
      adCounts[imp.adId] = (adCounts[imp.adId] || 0) + 1;
    }

    const bulkUpdateOps = Object.keys(adCounts).map(adId => ({
      updateOne: {
        filter: { _id: adId },
        update: { $inc: { delivered_impressions: adCounts[adId] } }
      }
    }));

    if (bulkUpdateOps.length > 0) {
      await Ad.bulkWrite(bulkUpdateOps);
    }
  } catch (error) {
    console.error("[AdService] Error flushing impressions:", error);
    // If it fails, we put them back in the buffer to prevent loss
    if (useRedis && impressionsToProcess.length > 0) {
      const strings = impressionsToProcess.map(i => JSON.stringify(i));
      await redis.lpush('impression_buffer', ...strings).catch(e => console.error("Failed to restore buffer", e));
    } else if (!useRedis) {
      memImpressionBuffer.push(...impressionsToProcess);
    }
  }
};

// Start the worker
setInterval(flushImpressions, 10000); // 10 seconds
