const Animal = require('../models/Animal');
const Treatment = require('../models/Treatment');
const LabTest = require('../models/LabTest');
const Alert = require('../models/Alert');
const User = require('../models/User');

/**
 * Get regulator dashboard stats
 */
const getRegulatorDashboard = async () => {
  // Total registered farms
  const totalFarms = await User.distinct('_id', { role: 'farmer' });
  const totalFarmsCount = totalFarms.length;

  // Active MRL violations
  const activeViolations = await LabTest.countDocuments({ status: 'fail' });

  // AMU usage trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const treatments = await Treatment.find({
    dateGiven: { $gte: thirtyDaysAgo },
  });

  // Calculate monthly AMU usage
  const monthlyUsage = {};
  treatments.forEach((treatment) => {
    const month = new Date(treatment.dateGiven).toISOString().slice(0, 7);
    if (!monthlyUsage[month]) {
      monthlyUsage[month] = 0;
    }
    monthlyUsage[month] += treatment.dosage || 0;
  });

  // Compliance score
  const totalTests = await LabTest.countDocuments();
  const passedTests = await LabTest.countDocuments({ status: 'pass' });
  const complianceScore = totalTests > 0 ? (passedTests / totalTests) * 100 : 100;

  // High risk farms (farms with MRL violations)
  const violationsByFarm = await LabTest.aggregate([
    { $match: { status: 'fail' } },
    {
      $group: {
        _id: '$farmerId',
        violationCount: { $sum: 1 },
        lastTestDate: { $max: '$testDate' },
      },
    },
    { $sort: { violationCount: -1 } },
    { $limit: 10 },
  ]);

  const highRiskFarms = await Promise.all(
    violationsByFarm.map(async (farm) => {
      const farmer = await User.findById(farm._id).select('name email phone');
      const animals = await Animal.find({ farmerId: farm._id });
      
      return {
        farmerId: farm._id,
        farmerName: farmer?.name || 'Unknown',
        farmerEmail: farmer?.email || '',
        violationCount: farm.violationCount,
        lastTestDate: farm.lastTestDate,
        totalAnimals: animals.length,
      };
    })
  );

  // MRL violations trend (monthly)
  const violationsTrend = await LabTest.aggregate([
    { $match: { status: 'fail' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$testDate' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    success: true,
    data: {
      stats: {
        totalFarms: totalFarmsCount,
        activeViolations,
        complianceScore: Math.round(complianceScore),
        amuTrend: monthlyUsage,
      },
      highRiskFarms,
      violationsTrend: violationsTrend.map((v) => ({
        month: v._id,
        count: v.count,
      })),
    },
  };
};

/**
 * Get region-wise statistics (can be enhanced with geolocation data)
 */
const getRegionStats = async () => {
  // Group by state/district (if location data is available)
  const animals = await Animal.find({}).select('location');

  const regionStats = {};
  animals.forEach((animal) => {
    const state = animal.location?.state || 'Unknown';
    const district = animal.location?.district || 'Unknown';
    const key = `${state}-${district}`;

    if (!regionStats[key]) {
      regionStats[key] = {
        state,
        district,
        farms: 0,
        animals: 0,
        violations: 0,
      };
    }
    regionStats[key].animals += 1;
  });

  // Get violations by region
  const violations = await LabTest.find({ status: 'fail' })
    .populate('animalId', 'location');

  violations.forEach((test) => {
    const location = test.animalId?.location;
    if (location) {
      const key = `${location.state || 'Unknown'}-${location.district || 'Unknown'}`;
      if (regionStats[key]) {
        regionStats[key].violations += 1;
      }
    }
  });

  return {
    success: true,
    data: Object.values(regionStats),
  };
};

module.exports = {
  getRegulatorDashboard,
  getRegionStats,
};

