// controllers/dashboardController.js
const { Parser } = require("json2csv");
const Visitor = require("../models/Visitor");
const Pass = require("../models/Pass");
const CheckLog = require("../models/CheckLog");
const { ROLES } = require("../utils/constants");

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
        action: 'check-in',
        timestamp: { $gte: todayStart },
      }).then((ids) => ids.length),
      CheckLog.distinct("visitor", {
        ...checkFilter,
        action: 'check-in',
        timestamp: { $gte: weekStart },
      }).then((ids) => ids.length),
      Visitor.countDocuments({ ...visitorFilter, status: 'pending' }),
      Pass.countDocuments({ ...passFilter, isActive: true }),
      CheckLog.countDocuments({
        ...checkFilter,
        action: 'check-in',
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

// switched this one to promise chain - was having issues with the async version
const recentCheckIns = function(req, res, next) {
  const filter = { action: 'check-in' }
  if (req.user.role === ROLES.SECURITY) filter.location = req.user.location

  CheckLog.find(filter)
    .populate('visitor scannedBy')
    .sort({ timestamp: -1 })
    .limit(10)
    .lean()
    .then(function(items) {
      res.json({ success: true, data: items })
    })
    .catch(next)
}

const exportVisitors = function(req, res, next) {
  var filter = { isActive: true }
  if (req.user.role === ROLES.SECURITY) filter.location = req.user.location

  Visitor.find(filter)
    .populate('host', 'name email')
    .lean()
    .then(function(visitors) {
      const parser = new Parser({ fields: ['name', 'email', 'company', 'status', 'location', 'createdAt', 'host.name'] })
      const csv = parser.parse(visitors)
      res.header('Content-Type', 'text/csv')
      res.attachment('visitors.csv')
      res.send(csv)
    })
    .catch(next)
}

module.exports = { dashboardStats, recentCheckIns, exportVisitors };
