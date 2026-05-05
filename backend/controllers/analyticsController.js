// controllers/analyticsController.js
const CheckLog = require("../models/CheckLog");
const Visitor = require("../models/Visitor");
const { CHECK_ACTIONS, ROLES } = require("../utils/constants");

const buildVisitorLocationFilterFromReq = (req) => {
  if (req.user.role !== ROLES.SECURITY) return {};
  return { location: req.user.location };
};

const summary = async (req, res, next) => {
  try {
    const visitorLocationFilter = buildVisitorLocationFilterFromReq(req);

    const baseMatch = { action: CHECK_ACTIONS.CHECK_IN };
    if (req.user.role === ROLES.SECURITY) baseMatch.location = req.user.location;

    const now = new Date();
    const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const weekStart = new Date(dayStart);
    weekStart.setUTCDate(weekStart.getUTCDate() - 7);
    const monthStart = new Date(dayStart);
    monthStart.setUTCMonth(monthStart.getUTCMonth() - 1);

    const [daily, weekly, monthly, purposeBreakdown, topHosts] = await Promise.all([
      CheckLog.distinct("visitor", { ...baseMatch, timestamp: { $gte: dayStart } }).then((ids) => ids.length),
      CheckLog.distinct("visitor", { ...baseMatch, timestamp: { $gte: weekStart } }).then((ids) => ids.length),
      CheckLog.distinct("visitor", { ...baseMatch, timestamp: { $gte: monthStart } }).then((ids) => ids.length),
      Visitor.aggregate([
        { $match: { ...visitorLocationFilter, isActive: true } },
        { $group: { _id: { $ifNull: ["$purpose", "unknown"] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Visitor.aggregate([
        { $match: { ...visitorLocationFilter, isActive: true } },
        { $group: { _id: "$host", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "host",
          },
        },
        { $unwind: "$host" },
        { $project: { hostId: "$_id", hostName: "$host.name", email: "$host.email", count: 1 } },
      ]),
    ]);

    return res.json({
      success: true,
      data: {
        uniqueVisitorsDaily: daily,
        uniqueVisitorsWeekly: weekly,
        uniqueVisitorsMonthly: monthly,
        purposeBreakdown,
        topHostsByVisitorCount: topHosts,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const peakHours = async (req, res, next) => {
  try {
    const buckets = await CheckLog.aggregate([
      { $match: { action: CHECK_ACTIONS.CHECK_IN, ...(req.user.role === ROLES.SECURITY ? { location: req.user.location } : {}) } },
      {
        $group: {
          _id: { $hour: { date: "$timestamp", timezone: "UTC" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const heatmap = Array.from({ length: 24 }, (_, hour) => {
      const found = buckets.find((b) => b._id === hour);
      return { hour, count: found ? found.count : 0 };
    });

    return res.json({ success: true, data: heatmap });
  } catch (error) {
    return next(error);
  }
};

const averageDuration = async (req, res, next) => {
  try {
    const logs = await CheckLog.find({
      ...(req.user.role === ROLES.SECURITY ? { location: req.user.location } : {}),
    })
      .select("visitor pass action timestamp")
      .sort({ timestamp: 1 })
      .lean();

    const open = new Map();
    let totalMinutes = 0;
    let totalPairs = 0;

    for (const log of logs) {
      const key = `${log.visitor.toString()}:${log.pass.toString()}`;

      if (log.action === CHECK_ACTIONS.CHECK_IN) {
        open.set(key, log.timestamp);
      }

      if (log.action === CHECK_ACTIONS.CHECK_OUT) {
        const startTs = open.get(key);
        if (!startTs) continue;
        const diffMs = new Date(log.timestamp) - new Date(startTs);
        totalMinutes += diffMs / 60000;
        totalPairs += 1;
        open.delete(key);
      }
    }

    const avg = totalPairs ? totalMinutes / totalPairs : 0;

    return res.json({ success: true, data: { averageVisitMinutes: Number(avg.toFixed(2)), sampleSize: totalPairs } });
  } catch (error) {
    return next(error);
  }
};

module.exports = { summary, peakHours, averageDuration };
