// analytics stuff - took a while to figure out mongo aggregations
// most of these i figured out from the mongodb docs and stack overflow
const CheckLog = require('../models/CheckLog')
const Visitor = require('../models/Visitor')

const summary = async (req, res) => {
  try {
    const now = new Date()

    // start of today (midnight)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // 7 days back
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)

    // 30 days back
    const monthStart = new Date(todayStart)
    monthStart.setDate(monthStart.getDate() - 30)

    // im using countDocuments on each date range separately
    // probably could do this in one aggregation but this is easier to read
    const totalToday = await Visitor.countDocuments({
      createdAt: { $gte: todayStart }
    })

    const totalWeek = await Visitor.countDocuments({
      createdAt: { $gte: weekStart }
    })

    const totalMonth = await Visitor.countDocuments({
      createdAt: { $gte: monthStart }
    })

    const pendingCount = await Visitor.countDocuments({ status: 'pending' })

    // group visitors by purpose to show the breakdown chart
    const purposeBreakdown = await Visitor.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$purpose',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    // top hosts - this aggregation was hard to figure out
    // basically: group by host, count how many visitors each host has,
    // then join with the users collection to get their name and email
    // the $lookup is like a SQL JOIN
    const topHosts = await Visitor.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$host',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'hostInfo'
        }
      },
      // $unwind turns the array into a single object
      // (lookup always returns an array even if theres only one match)
      { $unwind: '$hostInfo' },
      {
        $project: {
          hostName: '$hostInfo.name',
          email: '$hostInfo.email',
          count: 1
        }
      }
    ])

    res.json({
      success: true,
      data: {
        uniqueVisitorsDaily: totalToday,
        uniqueVisitorsWeekly: totalWeek,
        uniqueVisitorsMonthly: totalMonth,
        pendingCount: pendingCount,
        purposeBreakdown: purposeBreakdown,
        topHostsByVisitorCount: topHosts
      }
    })
  } catch (err) {
    console.log('analytics summary error:', err)
    res.status(500).json({ success: false, message: 'Failed to get analytics' })
  }
}

const peakHours = function(req, res) {
  // group check-in logs by hour to see which hours are busiest
  CheckLog.aggregate([
    { $match: { action: 'check-in' } },
    {
      $group: {
        _id: { $hour: '$timestamp' },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ])
  .then(function(byHour) {
    // build a full 24-hour array with zeros where there are no check-ins
    // so the chart shows all hours not just the ones with data
    const heatmap = []
    for (let hour = 0; hour < 24; hour++) {
      const found = byHour.find(function(b) { return b._id === hour })
      heatmap.push({ hour: hour, count: found ? found.count : 0 })
    }
    res.json({ success: true, data: heatmap })
  })
  .catch(function(err) {
    console.log('peak hours error:', err)
    res.status(500).json({ success: false, message: 'Something went wrong' })
  })
}

const averageDuration = async (req, res) => {
  try {
    // get all check-ins and check-outs then match them up manually
    // probably not the most efficient way but i couldnt figure out how to do this
    // in a single aggregation pipeline
    const checkIns = await CheckLog.find({ action: 'check-in' }).lean()
    const checkOuts = await CheckLog.find({ action: 'check-out' }).lean()

    let totalMinutes = 0
    let matchedCount = 0

    for (let i = 0; i < checkOuts.length; i++) {
      const out = checkOuts[i]

      // find the most recent check-in for this visitor before this check-out
      const matchingCheckIn = checkIns.find(function(ci) {
        // need to convert to string because mongoose returns ObjectId objects
        const sameVisitor = String(ci.visitor) === String(out.visitor)
        const isBeforeCheckout = new Date(ci.timestamp) < new Date(out.timestamp)
        return sameVisitor && isBeforeCheckout
      })

      if (matchingCheckIn === undefined) {
        continue
      }

      const checkInTime = new Date(matchingCheckIn.timestamp)
      const checkOutTime = new Date(out.timestamp)
      const diffMs = checkOutTime - checkInTime
      const diffMinutes = diffMs / 1000 / 60  // convert to minutes

      totalMinutes += diffMinutes
      matchedCount++
    }

    let avgMinutes = 0
    if (matchedCount > 0) {
      avgMinutes = totalMinutes / matchedCount
    }

    res.json({
      success: true,
      data: {
        averageVisitMinutes: Math.round(avgMinutes * 100) / 100,
        sampleSize: matchedCount
      }
    })
  } catch (err) {
    console.log('average duration error:', err)
    res.status(500).json({ success: false, message: 'Failed to calculate duration' })
  }
}

module.exports = { summary, peakHours, averageDuration }
