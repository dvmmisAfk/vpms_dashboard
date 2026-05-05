// controllers/dashboardController.js
const { Parser } = require("json2csv");
const Visitor = require("../models/Visitor");
const Pass = require("../models/Pass");
const CheckLog = require("../models/CheckLog");
const { VISITOR_STATUSES, CHECK_ACTIONS, ROLES } = require("../utils/constants");

const startOfUtcDay = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
};

const utcDaysAgo = (days) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
};

const dashboardStats = async (req, res, next) => {
  try {
    const visitorFilter = { isActive: true };
    const passFilter = {};
    const checkFilter = {};

    const isSecurityScoped = req.user.role === ROLES.SECURITY;

    const todayStart = startOfUtcDay();
    const weekStart = utcDaysAgo(7);

    if (isSecurityScoped) {
      visitorFilter.location = req.user.location;
      passFilter.location = req.user.location;
      checkFilter.location = req.user.location;
    }

    const [
      totalVisitorsToday,
      totalVisitorsWeek,
      pendingApprovals,
      activePasses,
      checkInsNow,
    ] = await Promise.all([
      CheckLog.distinct("visitor", {
        ...checkFilter,
        action: CHECK_ACTIONS.CHECK_IN,
        timestamp: { $gte: todayStart },
      }).then((ids) => ids.length),
      CheckLog.distinct("visitor", {
        ...checkFilter,
        action: CHECK_ACTIONS.CHECK_IN,
        timestamp: { $gte: weekStart },
      }).then((ids) => ids.length),
      Visitor.countDocuments({ ...visitorFilter, status: VISITOR_STATUSES.PENDING }),
      Pass.countDocuments({ ...passFilter, isActive: true }),
      CheckLog.countDocuments({
        ...checkFilter,
        action: CHECK_ACTIONS.CHECK_IN,
        timestamp: { $gte: todayStart },
      }),
    ]);

    const checkInRate = totalVisitorsToday ? ((checkInsNow / totalVisitorsToday) * 100).toFixed(2) : 0;

    return res.json({
      success: true,
      data: {
        totalVisitorsToday,
        totalVisitorsWeek,
        pendingApprovals,
        activePasses,
        checkedInNow: checkInsNow,
        checkInRate: Number(checkInRate),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const recentCheckIns = async (req, res, next) => {
  try {
    const filter = { action: CHECK_ACTIONS.CHECK_IN };
    if (req.user.role === ROLES.SECURITY) filter.location = req.user.location;
    const items = await CheckLog.find(filter).populate("visitor scannedBy").sort({ timestamp: -1 }).limit(10).lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    return next(error);
  }
};

const exportVisitors = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.user.role === ROLES.SECURITY) filter.location = req.user.location;

    const visitors = await Visitor.find(filter).populate("host", "name email").lean();

    const parser = new Parser({ fields: ["name", "email", "company", "status", "location", "createdAt", "host.name"] });
    const csv = parser.parse(visitors);

    res.header("Content-Type", "text/csv");
    res.attachment("visitors.csv");
    return res.send(csv);
  } catch (error) {
    return next(error);
  }
};

module.exports = { dashboardStats, recentCheckIns, exportVisitors };
