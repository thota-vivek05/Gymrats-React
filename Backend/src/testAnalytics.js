// testAnalytics.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Payment = require('./model/Payment');
const User = require('./model/User');
const Trainer = require('./model/Trainer');

// Test function to check database connection
const testDatabaseConnection = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/gymrats');
        console.log('✅ Connected to MongoDB successfully');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        return false;
    }
};

// Test 1: Check if payments exist
const testPaymentsExist = async () => {
    try {
        const count = await Payment.countDocuments();
        console.log(`📊 Total payments in database: ${count}`);
        
        if (count === 0) {
            console.log('⚠️  No payments found. You need to add sample data first.');
            return false;
        }
        
        // Show sample payment
        const sample = await Payment.findOne().populate('userId', 'full_name').populate('trainerId', 'name');
        console.log('📝 Sample payment:', {
            amount: sample?.amount,
            status: sample?.status,
            user: sample?.userId?.full_name,
            trainer: sample?.trainerId?.name,
            plan: sample?.membershipPlan
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error checking payments:', error.message);
        return false;
    }
};

// Test 2: Test Total Revenue API
const testTotalRevenue = async () => {
    try {
        const result = await Payment.aggregate([
            { $match: { status: "Success" } },
            { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
        ]);
        
        const total = result[0]?.totalRevenue || 0;
        console.log(`💰 Total Revenue: ₹${total.toLocaleString()}`);
        return total;
    } catch (error) {
        console.error('❌ Total Revenue test failed:', error.message);
    }
};

// Test 3: Test Monthly Revenue
const testMonthlyRevenue = async () => {
    try {
        const result = await Payment.aggregate([
            { $match: { status: "Success" } },
            { 
                $group: {
                    _id: "$revenueMonth",
                    revenue: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        console.log('\n📈 Monthly Revenue Breakdown:');
        result.forEach(item => {
            console.log(`   ${item._id}: ₹${item.revenue.toLocaleString()} (${item.count} transactions)`);
        });
        
        return result;
    } catch (error) {
        console.error('❌ Monthly Revenue test failed:', error.message);
    }
};

// Test 4: Test Trainer Revenue
const testTrainerRevenue = async () => {
    try {
        const result = await Payment.aggregate([
            { $match: { status: "Success", trainerId: { $ne: null } } },
            { 
                $group: {
                    _id: "$trainerId",
                    revenue: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "trainers",
                    localField: "_id",
                    foreignField: "_id",
                    as: "trainer"
                }
            }
        ]);
        
        console.log('\n🏋️  Trainer Revenue:');
        result.forEach(item => {
            const trainerName = item.trainer[0]?.name || 'Unknown';
            console.log(`   ${trainerName}: ₹${item.revenue.toLocaleString()} (${item.count} transactions)`);
        });
        
        return result;
    } catch (error) {
        console.error('❌ Trainer Revenue test failed:', error.message);
    }
};

// Test 5: Test Membership Revenue
const testMembershipRevenue = async () => {
    try {
        const result = await Payment.aggregate([
            { $match: { status: "Success", membershipPlan: { $ne: null } } },
            { 
                $group: {
                    _id: "$membershipPlan",
                    revenue: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        console.log('\n📦 Membership Revenue:');
        result.forEach(item => {
            console.log(`   ${item._id}: ₹${item.revenue.toLocaleString()} (${item.count} transactions)`);
        });
        
        return result;
    } catch (error) {
        console.error('❌ Membership Revenue test failed:', error.message);
    }
};

// Test 6: Test Revenue Per User
const testRevenuePerUser = async () => {
    try {
        const result = await Payment.aggregate([
            { $match: { status: "Success" } },
            { 
                $group: {
                    _id: "$userId",
                    totalSpent: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            }
        ]);
        
        console.log('\n👥 Top 5 Users by Revenue:');
        result.forEach(item => {
            const userName = item.user[0]?.full_name || 'Unknown';
            console.log(`   ${userName}: ₹${item.totalSpent.toLocaleString()} (${item.count} transactions)`);
        });
        
        return result;
    } catch (error) {
        console.error('❌ Revenue Per User test failed:', error.message);
    }
};

// Add sample data if none exists
const addSampleData = async () => {
    const count = await Payment.countDocuments();
    if (count > 0) {
        console.log('📊 Sample data already exists, skipping...');
        return;
    }

    console.log('\n➕ Adding sample payment data...');
    
    // Get or create sample users and trainers
    let sampleUser = await User.findOne();
    if (!sampleUser) {
        console.log('⚠️  No users found. Please add users first.');
        return;
    }

    let sampleTrainer = await Trainer.findOne();
    if (!sampleTrainer) {
        console.log('⚠️  No trainers found. Please add trainers first.');
        return;
    }

    // Sample payments for last 6 months
    const payments = [];
    const plans = ['basic', 'gold', 'platinum'];
    const now = new Date();

    for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
        
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const plan = plans[Math.floor(Math.random() * plans.length)];
        const amount = plan === 'basic' ? 1999 : plan === 'gold' ? 3999 : 5999;
        
        payments.push({
            userId: sampleUser._id,
            trainerId: sampleTrainer._id,
            amount: amount,
            status: 'Success',
            membershipPlan: plan,
            revenueMonth: month,
            paymentDate: date,
            isRenewal: Math.random() > 0.7,
            paymentMethod: 'Card'
        });
    }

    await Payment.insertMany(payments);
    console.log(`✅ Added ${payments.length} sample payments`);
};

// Main test function
const runAllTests = async () => {
    console.log('🚀 Starting API Tests...\n');
    
    // Connect to database
    const connected = await testDatabaseConnection();
    if (!connected) {
        console.log('❌ Cannot proceed without database connection');
        process.exit(1);
    }
    
    // Check if payments exist, add sample if needed
    const paymentsExist = await testPaymentsExist();
    if (!paymentsExist) {
        await addSampleData();
    }
    
    // Run all tests
    console.log('\n' + '='.repeat(50));
    await testTotalRevenue();
    await testMonthlyRevenue();
    await testTrainerRevenue();
    await testMembershipRevenue();
    await testRevenuePerUser();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed!');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
};

// Run the tests
runAllTests().catch(console.error);