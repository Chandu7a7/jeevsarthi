const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const Treatment = require('../models/Treatment');
const Alert = require('../models/Alert');
const BlockchainRecord = require('../models/BlockchainRecord');
const LabTest = require('../models/LabTest');
const Animal = require('../models/Animal');
const { ROLES } = require('../constants/roles');

// Get dashboard statistics for Super Admin
exports.getSuperAdminDashboard = async (req, res) => {
  try {
    const { _id: adminId } = req.user;

    // Total states onboarded (unique states with state admins)
    const statesOnboarded = await User.distinct('state', {
      role: 'state_admin',
      isActive: true,
    });

    // Total farms (farmers with farmer profiles)
    const totalFarms = await FarmerProfile.countDocuments();

    // Total veterinarians
    const totalVets = await User.countDocuments({ role: 'vet', isActive: true });

    // AMU Usage Trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const amuUsage = await Treatment.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // MRL Violations - Group by status (pass/fail)
    const mrlViolationsRaw = await LabTest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Transform and ensure both categories exist
    const mrlViolationsMap = {};
    mrlViolationsRaw.forEach(item => {
      mrlViolationsMap[item._id] = item.count;
    });

    const mrlViolations = [
      {
        _id: 'Pass',
        name: 'Pass',
        count: mrlViolationsMap['pass'] || 0,
      },
      {
        _id: 'Fail (Violation)',
        name: 'Fail (Violation)',
        count: mrlViolationsMap['fail'] || 0,
      },
    ];

    // Drug Categories Usage - Use drugType from Treatment model
    const drugCategories = await Treatment.aggregate([
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$drugType', 'antibiotic'] },
              then: 'Antibiotic',
              else: {
                $cond: {
                  if: { $eq: ['$drugType', 'antiparasitic'] },
                  then: 'Antiparasitic',
                  else: {
                    $cond: {
                      if: { $eq: ['$drugType', 'vaccine'] },
                      then: 'Vaccine',
                      else: {
                        $cond: {
                          if: { $eq: ['$drugType', 'vitamin'] },
                          then: 'Vitamin',
                          else: 'Other',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // State-wise Performance
    const statePerformance = await FarmerProfile.aggregate([
      {
        $group: {
          _id: '$state',
          totalFarms: { $sum: 1 },
          avgCompliance: { $avg: '$amuComplianceScore' },
          violations: { $sum: '$violationsHistory.violation' },
        },
      },
      { $sort: { avgCompliance: -1 } },
      { $limit: 10 },
    ]);

    // Latest State Reports
    const latestReports = await FarmerProfile.find()
      .populate('farmerId', 'name email')
      .sort({ updatedAt: -1 })
      .limit(5);

    // High-risk States (based on violations)
    const highRiskStates = await FarmerProfile.aggregate([
      {
        $group: {
          _id: '$state',
          violations: { $sum: '$violationsHistory.violation' },
          warnings: { $sum: '$violationsHistory.warning' },
        },
      },
      {
        $match: {
          $or: [{ violations: { $gt: 0 } }, { warnings: { $gt: 5 } }],
        },
      },
      { $sort: { violations: -1 } },
      { $limit: 5 },
    ]);

    // AMU Usage by State (for Heatmap)
    const farmersInStates = await FarmerProfile.aggregate([
      {
        $group: {
          _id: '$state',
          farmerIds: { $push: '$farmerId' },
        },
      },
    ]);

    const amuUsageByState = await Promise.all(
      farmersInStates.map(async (state) => {
        const amuCount = await Treatment.countDocuments({
          farmerId: { $in: state.farmerIds },
          createdAt: { $gte: thirtyDaysAgo },
        });

        return {
          state: state._id || 'Unknown',
          count: amuCount,
        };
      })
    );

    // MRL Violations by State (for India Map Heatmap)
    const mrlViolationsByState = await Promise.all(
      farmersInStates.map(async (state) => {
        // Get farmers in this state
        const farmerIds = state.farmerIds || [];
        
        // Get lab tests for animals belonging to farmers in this state
        const animalsInState = await Animal.find({
          farmerId: { $in: farmerIds },
        }).select('_id');

        const animalIds = animalsInState.map(a => a._id);

        // Count total tests and failed tests for this state
        const totalTests = await LabTest.countDocuments({
          animalId: { $in: animalIds },
        });

        const failedTests = await LabTest.countDocuments({
          animalId: { $in: animalIds },
          status: 'fail',
        });

        const passTests = totalTests - failedTests;
        const violationRate = totalTests > 0 ? (failedTests / totalTests) * 100 : 0;

        return {
          state: state._id || 'Unknown',
          totalTests,
          failedTests,
          passTests,
          violationRate: violationRate.toFixed(2),
          // Determine risk level based on violation rate
          riskLevel: violationRate > 10 ? 'high' : violationRate > 5 ? 'medium' : 'low',
        };
      })
    );

    // Sort by violation rate (highest first)
    mrlViolationsByState.sort((a, b) => parseFloat(b.violationRate) - parseFloat(a.violationRate));

    res.json({
      success: true,
      data: {
        kpis: {
          totalStates: statesOnboarded.length,
          totalFarms,
          totalVets,
          amuTrendLast30Days: amuUsage.length,
        },
        charts: {
          amuUsageTrend: amuUsage,
          mrlViolations: mrlViolations,
          drugCategories: drugCategories.length > 0 ? drugCategories : [],
          amuUsageByState: amuUsageByState,
          mrlViolationsByState: mrlViolationsByState,
        },
        tables: {
          statePerformance,
          latestReports,
          highRiskStates,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching super admin dashboard',
      error: error.message,
    });
  }
};

// Create State Admin
exports.createStateAdmin = async (req, res) => {
  try {
    const { name, email, phone, state, password } = req.body;

    // Validation
    if (!name || !email || !phone || !state || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Create state admin
    const stateAdmin = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: 'state_admin',
      state,
      createdBy: req.user._id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'State Admin created successfully',
      data: {
        id: stateAdmin._id,
        name: stateAdmin.name,
        email: stateAdmin.email,
        state: stateAdmin.state,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating state admin',
      error: error.message,
    });
  }
};

// Get all State Admins
exports.getStateAdmins = async (req, res) => {
  try {
    const { search, state, status } = req.query;
    const query = { role: 'state_admin' };

    console.log('Get State Admins Query Params:', { search, state, status });

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (state && state.trim() !== '') {
      query.state = state.trim();
    }

    if (status && status.trim() !== '') {
      // Handle status filter: 'active' or 'inactive'
      if (status.trim() === 'active') {
        query.isActive = true;
      } else if (status.trim() === 'inactive') {
        query.isActive = false;
      }
    }

    console.log('MongoDB Query:', JSON.stringify(query, null, 2));

    const stateAdmins = await User.find(query)
      .select('-password')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    console.log(`Found ${stateAdmins.length} State Admins`);

    res.json({
      success: true,
      data: stateAdmins,
      count: stateAdmins.length,
    });
  } catch (error) {
    console.error('Error fetching state admins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching state admins',
      error: error.message,
    });
  }
};

// Update State Admin
exports.updateStateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, state, isActive, password } = req.body;

    const stateAdmin = await User.findOne({ _id: id, role: 'state_admin' });
    if (!stateAdmin) {
      return res.status(404).json({
        success: false,
        message: 'State Admin not found',
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== stateAdmin.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }
      stateAdmin.email = email.toLowerCase();
    }

    if (name) stateAdmin.name = name;
    if (phone) stateAdmin.phone = phone;
    if (state) stateAdmin.state = state;
    if (isActive !== undefined) stateAdmin.isActive = isActive;
    
    // Update password if provided
    if (password) {
      stateAdmin.password = password;
    }

    await stateAdmin.save();

    // Return user without password
    const updatedAdmin = await User.findById(id).select('-password');

    res.json({
      success: true,
      message: 'State Admin updated successfully',
      data: updatedAdmin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating state admin',
      error: error.message,
    });
  }
};

// Delete State Admin
exports.deleteStateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const stateAdmin = await User.findOne({ _id: id, role: 'state_admin' });
    if (!stateAdmin) {
      return res.status(404).json({
        success: false,
        message: 'State Admin not found',
      });
    }

    // Check if this state admin has created any district admins
    const districtAdminsCount = await User.countDocuments({ 
      createdBy: id,
      role: 'district_admin'
    });

    if (districtAdminsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete State Admin. ${districtAdminsCount} District Admin(s) are associated with this account. Please reassign or delete them first.`,
      });
    }

    // Delete the state admin
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'State Admin deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting state admin',
      error: error.message,
    });
  }
};

// Get State Admin Dashboard
exports.getStateAdminDashboard = async (req, res) => {
  try {
    const { state } = req.user;

    // Total districts with district admins
    const districts = await User.distinct('district', {
      role: 'district_admin',
      state,
      isActive: true,
    });

    // Total farms in state
    const totalFarms = await FarmerProfile.countDocuments({ state });

    // Pending violations
    const pendingViolations = await Alert.countDocuments({
      'data.state': state,
      status: 'pending',
      severity: { $in: ['warning', 'critical'] },
    });

    // Active treatments - need to join with FarmerProfile
    const farmersInState = await FarmerProfile.distinct('farmerId', { state });
    const activeTreatments = await Treatment.countDocuments({
      farmerId: { $in: farmersInState },
      status: 'active',
    });

    // Vet count
    const vetCount = await User.countDocuments({
      role: 'vet',
      isActive: true,
      state,
    });

    // Lab count (assuming labs have state in their profile)
    const labCount = await User.countDocuments({
      role: 'lab',
      isActive: true,
      state,
    });

    // District-wise AMU usage
    const districtAMU = await FarmerProfile.aggregate([
      { $match: { state } },
      {
        $group: {
          _id: '$district',
          farmCount: { $sum: 1 },
          avgCompliance: { $avg: '$amuComplianceScore' },
        },
      },
    ]);

    // 7-day MRL alerts trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const mrlTrend = await Alert.aggregate([
      {
        $match: {
          'data.state': state,
          type: 'mrl_violation',
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent treatments - reuse farmersInState from above
    const recentTreatments = await Treatment.find({
      farmerId: { $in: farmersInState },
    })
      .populate('animalId', 'pashuAadhaarId species breed')
      .populate('vetId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // District leaderboard
    const districtLeaderboard = await FarmerProfile.aggregate([
      { $match: { state } },
      {
        $group: {
          _id: '$district',
          avgCompliance: { $avg: '$amuComplianceScore' },
          farmCount: { $sum: 1 },
          violations: { $sum: '$violationsHistory.violation' },
        },
      },
      { $sort: { avgCompliance: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        kpis: {
          totalDistricts: districts.length,
          totalFarms,
          pendingViolations,
          activeTreatments,
          vetCount,
          labCount,
        },
        charts: {
          districtAMU,
          mrlTrend,
        },
        tables: {
          recentTreatments,
          districtLeaderboard,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching state admin dashboard',
      error: error.message,
    });
  }
};

// Create District Admin
exports.createDistrictAdmin = async (req, res) => {
  try {
    const { name, email, phone, district, password } = req.body;
    const { state } = req.user; // State admin's state

    if (!name || !email || !phone || !district || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Create district admin
    const districtAdmin = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: 'district_admin',
      state,
      district,
      createdBy: req.user._id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'District Admin created successfully',
      data: {
        id: districtAdmin._id,
        name: districtAdmin.name,
        email: districtAdmin.email,
        state: districtAdmin.state,
        district: districtAdmin.district,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating district admin',
      error: error.message,
    });
  }
};

// Get all District Admins
exports.getDistrictAdmins = async (req, res) => {
  try {
    const { state } = req.user;
    const { search, district, status } = req.query;
    const query = { role: 'district_admin', state };

    console.log('Get District Admins Query Params:', { search, district, status, state });

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (district && district.trim() !== '') {
      query.district = district.trim();
    }

    if (status && status.trim() !== '') {
      // Handle status filter: 'active' or 'inactive'
      if (status.trim() === 'active') {
        query.isActive = true;
      } else if (status.trim() === 'inactive') {
        query.isActive = false;
      }
    }

    console.log('MongoDB Query:', JSON.stringify(query, null, 2));

    const districtAdmins = await User.find(query)
      .select('-password')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    console.log(`Found ${districtAdmins.length} District Admins`);

    res.json({
      success: true,
      data: districtAdmins,
      count: districtAdmins.length,
    });
  } catch (error) {
    console.error('Error fetching district admins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching district admins',
      error: error.message,
    });
  }
};

// Update District Admin
exports.updateDistrictAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, district, isActive, password } = req.body;
    const { state } = req.user; // State admin's state

    const districtAdmin = await User.findOne({ 
      _id: id, 
      role: 'district_admin',
      state // Ensure the district admin belongs to this state admin's state
    });
    
    if (!districtAdmin) {
      return res.status(404).json({
        success: false,
        message: 'District Admin not found or does not belong to your state',
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== districtAdmin.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }
      districtAdmin.email = email.toLowerCase();
    }

    if (name) districtAdmin.name = name;
    if (phone) districtAdmin.phone = phone;
    if (district) districtAdmin.district = district;
    if (isActive !== undefined) districtAdmin.isActive = isActive;
    
    // Update password if provided
    if (password) {
      districtAdmin.password = password;
    }

    await districtAdmin.save();

    // Return user without password
    const updatedAdmin = await User.findById(id).select('-password');

    res.json({
      success: true,
      message: 'District Admin updated successfully',
      data: updatedAdmin,
    });
  } catch (error) {
    console.error('Error updating district admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating district admin',
      error: error.message,
    });
  }
};

// Delete District Admin
exports.deleteDistrictAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.user; // State admin's state

    const districtAdmin = await User.findOne({ 
      _id: id, 
      role: 'district_admin',
      state // Ensure the district admin belongs to this state admin's state
    });
    
    if (!districtAdmin) {
      return res.status(404).json({
        success: false,
        message: 'District Admin not found or does not belong to your state',
      });
    }

    // Delete the district admin
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'District Admin deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting district admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting district admin',
      error: error.message,
    });
  }
};

// Get District Admin Dashboard
exports.getDistrictAdminDashboard = async (req, res) => {
  try {
    const { state, district } = req.user;

    // Total farms in district
    const totalFarms = await FarmerProfile.countDocuments({ state, district });

    // Get all farmers in district (used for multiple queries)
    const farmersInDistrict = await FarmerProfile.distinct('farmerId', { state, district });
    
    // Total animals in district
    const totalAnimals = await Animal.countDocuments({ farmerId: { $in: farmersInDistrict } });

    // Active consultations - need to join with FarmerProfile
    const Consultation = require('../models/Consultation');
    const activeConsultations = await Consultation.countDocuments({
      status: { $in: ['pending', 'accepted', 'ongoing'] },
      farmerId: { $in: farmersInDistrict },
    });

    // High-risk farms
    const highRiskFarms = await FarmerProfile.countDocuments({
      state,
      district,
      $or: [
        { amuComplianceScore: { $lt: 70 } },
        { 'violationsHistory.violation': { $gt: 0 } },
      ],
    });

    // AMR Risk Score Graph (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const amrRisk = await Treatment.aggregate([
      {
        $match: {
          farmerId: { $in: farmersInDistrict },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $lookup: {
          from: 'drugs',
          localField: 'drugId',
          foreignField: '_id',
          as: 'drug',
        },
      },
      { $unwind: '$drug' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          avgRisk: { $avg: '$drug.amrRiskScore' || 50 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent treatments - reuse farmersInDistrict from above
    const recentTreatments = await Treatment.find({
      farmerId: { $in: farmersInDistrict },
    })
      .populate('animalId', 'pashuAadhaarId species breed')
      .populate('vetId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Violations list
    const violations = await Alert.find({
      'data.state': state,
      'data.district': district,
      severity: { $in: ['warning', 'critical'] },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Pending withdrawals - reuse farmersInDistrict from above
    const pendingWithdrawals = await Treatment.find({
      farmerId: { $in: farmersInDistrict },
      status: 'active',
      withdrawalEndDate: { $gte: new Date() },
    }).countDocuments();

    res.json({
      success: true,
      data: {
        kpis: {
          totalFarms,
          totalAnimals,
          activeConsultations,
          highRiskFarms,
        },
        charts: {
          amrRisk,
        },
        tables: {
          recentTreatments,
          violations,
          pendingWithdrawals,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching district admin dashboard',
      error: error.message,
    });
  }
};

// Get National Analytics
exports.getNationalAnalytics = async (req, res) => {
  try {
    // AMU/MRL Analytics for entire India
    const amuTrend = await Treatment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const stateWiseAMU = await FarmerProfile.aggregate([
      {
        $group: {
          _id: '$state',
          totalFarms: { $sum: 1 },
          avgCompliance: { $avg: '$amuComplianceScore' },
          violations: { $sum: '$violationsHistory.violation' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const mrlAnalytics = await LabTest.aggregate([
      {
        $group: {
          _id: '$result',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        amuTrend,
        stateWiseAMU,
        mrlAnalytics,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching national analytics',
      error: error.message,
    });
  }
};

// Get State Analytics
exports.getStateAnalytics = async (req, res) => {
  try {
    const { state } = req.user;

    const districtWiseAMU = await FarmerProfile.aggregate([
      { $match: { state } },
      {
        $group: {
          _id: '$district',
          totalFarms: { $sum: 1 },
          avgCompliance: { $avg: '$amuComplianceScore' },
        },
      },
    ]);

    const farmersInState = await FarmerProfile.distinct('farmerId', { state });
    const amuTrend = await Treatment.aggregate([
      {
        $match: {
          farmerId: { $in: farmersInState },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        districtWiseAMU,
        amuTrend,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching state analytics',
      error: error.message,
    });
  }
};

// Get District Analytics
exports.getDistrictAnalytics = async (req, res) => {
  try {
    const { state, district } = req.user;

    const farmersInDistrict = await FarmerProfile.distinct('farmerId', { state, district });
    const amuTrend = await Treatment.aggregate([
      {
        $match: {
          farmerId: { $in: farmersInDistrict },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const mrlViolations = await LabTest.aggregate([
      {
        $lookup: {
          from: 'farmerprofiles',
          localField: 'farmerId',
          foreignField: 'farmerId',
          as: 'profile',
        },
      },
      { $unwind: '$profile' },
      {
        $match: {
          'profile.state': state,
          'profile.district': district,
          result: 'failed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        amuTrend,
        mrlViolations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching district analytics',
      error: error.message,
    });
  }
};

// Get Farms List
exports.getFarmsList = async (req, res) => {
  try {
    const { state, district, role } = req.user;
    const { search, state: filterState, district: filterDistrict, compliance } = req.query;

    let query = {};

    // Apply filters based on admin level
    if (role === 'state_admin') {
      query.state = state;
    } else if (role === 'district_admin') {
      query.state = state;
      query.district = district;
    }

    if (filterState) query.state = filterState;
    if (filterDistrict) query.district = filterDistrict;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { farmRegistrationId: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
      ];
    }

    if (compliance) {
      if (compliance === 'good') {
        query.amuComplianceScore = { $gte: 80 };
      } else if (compliance === 'warning') {
        query.amuComplianceScore = { $gte: 60, $lt: 80 };
      } else if (compliance === 'critical') {
        query.amuComplianceScore = { $lt: 60 };
      }
    }

    const farms = await FarmerProfile.find(query)
      .populate('farmerId', 'name email phone')
      .sort({ createdAt: -1 });

    // Get animal counts for each farm
    const farmsWithCounts = await Promise.all(
      farms.map(async (farm) => {
        const animalCount = await Animal.countDocuments({ farmerId: farm.farmerId });
        return {
          ...farm.toObject(),
          totalAnimals: animalCount,
        };
      })
    );

    res.json({
      success: true,
      data: farmsWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching farms list',
      error: error.message,
    });
  }
};

// Get Veterinarians List
exports.getVeterinariansList = async (req, res) => {
  try {
    const { state, district, role } = req.user;
    const { search, state: filterState, district: filterDistrict } = req.query;

    const VetProfile = require('../models/Vet');

    // Base query for User model
    let userQuery = { role: 'vet', isActive: true };

    // Base query for VetProfile - filter by state/district from clinicAddress
    let vetProfileQuery = {};

    // Apply role-based filtering using VetProfile's clinicAddress.state
    if (role === 'state_admin' && state) {
      vetProfileQuery['clinicAddress.state'] = state;
    } else if (role === 'district_admin' && state) {
      vetProfileQuery['clinicAddress.state'] = state;
      // Note: VetProfile doesn't have district field, only state in clinicAddress
      // If district filtering is needed, we'd need to add district to VetProfile
    }

    // Apply filters from query params
    if (filterState) {
      vetProfileQuery['clinicAddress.state'] = filterState;
    }

    // Search in VetProfile
    if (search && search.trim() !== '') {
      vetProfileQuery.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { registrationNumber: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    console.log('Veterinarians Query - VetProfile:', JSON.stringify(vetProfileQuery, null, 2));

    // Find VetProfiles matching the criteria
    const vetProfiles = await VetProfile.find(vetProfileQuery)
      .populate('vetId', 'name email phone onlineStatus isActive')
      .sort({ createdAt: -1 });

    console.log(`Found ${vetProfiles.length} Vet Profiles`);

    // Get vet IDs from profiles
    const vetIds = vetProfiles.map(profile => profile.vetId?._id).filter(Boolean);

    // If we have vet IDs, filter User query by them
    if (vetIds.length > 0) {
      userQuery._id = { $in: vetIds };
    } else if (Object.keys(vetProfileQuery).length > 0) {
      // If we have filters but no matching profiles, return empty
      return res.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    // Also apply search to User model if no VetProfile search
    if (search && search.trim() !== '' && !vetProfileQuery.$or) {
      userQuery.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Get users (vets) matching the query
    const vets = await User.find(userQuery)
      .select('-password')
      .sort({ createdAt: -1 });

    console.log(`Found ${vets.length} Veterinarian Users`);

    // Combine User data with VetProfile data
    const vetsWithProfiles = await Promise.all(
      vets.map(async (vet) => {
        const vetProfile = await VetProfile.findOne({ vetId: vet._id });
        const prescriptionCount = await Treatment.countDocuments({ vetId: vet._id });

        return {
          _id: vet._id,
          name: vetProfile?.name || vet.name,
          email: vetProfile?.email || vet.email,
          phone: vetProfile?.mobile || vet.phone,
          registrationNumber: vetProfile?.registrationNumber || 'N/A',
          district: vetProfile?.clinicAddress?.city || 'N/A', // Using city as district approximation
          state: vetProfile?.clinicAddress?.state || 'N/A',
          onlineStatus: vet.onlineStatus || false,
          totalPrescriptions: prescriptionCount,
          rating: vetProfile?.rating || 0,
          isVerified: vetProfile?.isVerified || false,
        };
      })
    );

    res.json({
      success: true,
      data: vetsWithProfiles,
      count: vetsWithProfiles.length,
    });
  } catch (error) {
    console.error('Error fetching veterinarians list:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching veterinarians list',
      error: error.message,
    });
  }
};

// Get Labs List
exports.getLabsList = async (req, res) => {
  try {
    const { state, district, role } = req.user;
    const { search, state: filterState } = req.query;

    let query = { role: 'lab', isActive: true };

    if (role === 'state_admin') {
      query.state = state;
    } else if (role === 'district_admin') {
      query.state = state;
      query.district = district;
    }

    if (filterState) query.state = filterState;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const labs = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Get test counts for each lab
    const labsWithCounts = await Promise.all(
      labs.map(async (lab) => {
        const testCount = await LabTest.countDocuments({ labId: lab._id });
        const violationCount = await LabTest.countDocuments({
          labId: lab._id,
          result: 'failed',
        });
        return {
          ...lab.toObject(),
          testsCompleted: testCount,
          violations: violationCount,
        };
      })
    );

    res.json({
      success: true,
      data: labsWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching labs list',
      error: error.message,
    });
  }
};

// Get AI Alerts
exports.getAIAlerts = async (req, res) => {
  try {
    const { state, district, role } = req.user;
    const { type, severity, status, search } = req.query;

    let query = {};

    // Apply filters based on admin level
    if (role === 'state_admin') {
      query['data.state'] = state;
    } else if (role === 'district_admin') {
      query['data.state'] = state;
      query['data.district'] = district;
    }

    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { 'data.animalId': { $regex: search, $options: 'i' } },
        { 'data.farmerName': { $regex: search, $options: 'i' } },
      ];
    }

    const alerts = await Alert.find(query)
      .populate('animalId', 'pashuAadhaarId species breed')
      .populate('farmerId', 'name')
      .populate('vetId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching AI alerts',
      error: error.message,
    });
  }
};

// Get Blockchain Verification Logs
exports.getBlockchainLogs = async (req, res) => {
  try {
    const { search, status, startDate, endDate } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { hash: { $regex: search, $options: 'i' } },
        { 'data.animalId': { $regex: search, $options: 'i' } },
        { 'data.treatmentId': { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.verified = status === 'verified';
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await BlockchainRecord.find(query)
      .sort({ timestamp: -1 })
      .limit(200);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blockchain logs',
      error: error.message,
    });
  }
};

// Get Treatment Logs (for District Admin)
exports.getTreatmentLogs = async (req, res) => {
  try {
    const { state, district } = req.user;
    const { search, startDate, endDate, status } = req.query;

    // Get farmers in district
    const farmersInDistrict = await FarmerProfile.distinct('farmerId', { state, district });
    let query = {
      farmerId: { $in: farmersInDistrict },
    };

    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const treatments = await Treatment.find(query)
      .populate('animalId', 'pashuAadhaarId species breed')
      .populate('vetId', 'name email')
      .populate('farmerId', 'name')
      .sort({ createdAt: -1 });

    if (search) {
      // Filter in memory for complex search across populated fields
      const filtered = treatments.filter((treatment) => {
        const searchLower = search.toLowerCase();
        return (
          treatment.animalId?.pashuAadhaarId?.toLowerCase().includes(searchLower) ||
          treatment.vetId?.name?.toLowerCase().includes(searchLower) ||
          treatment.farmerId?.name?.toLowerCase().includes(searchLower)
        );
      });
      return res.json({
        success: true,
        data: filtered,
      });
    }

    res.json({
      success: true,
      data: treatments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching treatment logs',
      error: error.message,
    });
  }
};

