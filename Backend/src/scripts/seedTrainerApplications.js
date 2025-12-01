const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const TrainerApplication = require('../model/TrainerApplication');

const seedApplications = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/gymrats', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing applications
    await TrainerApplication.deleteMany({});
    console.log('Cleared existing applications');

    // Sample trainer applications
    const hashedPassword = await bcrypt.hash('Password123', 10);

    const applications = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.trainer@example.com',
        password_hash: hashedPassword,
        phone: '+1234567890',
        experience: '5-10',
        specializations: ['Strength Training', 'Cardio'],
        status: 'Pending',
        verificationNotes: ''
      },
      {
        firstName: 'Sarah',
        lastName: 'Smith',
        email: 'sarah.trainer@example.com',
        password_hash: hashedPassword,
        phone: '+0987654321',
        experience: '3-5',
        specializations: ['Weight Loss', 'Flexibility'],
        status: 'Pending',
        verificationNotes: ''
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.trainer@example.com',
        password_hash: hashedPassword,
        phone: '+1122334455',
        experience: '10+',
        specializations: ['Competitive', 'HIIT', 'Bodybuilding'],
        status: 'Pending',
        verificationNotes: ''
      },
      {
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma.trainer@example.com',
        password_hash: hashedPassword,
        phone: '+5544332211',
        experience: '1-2',
        specializations: ['Calisthenics', 'Flexibility'],
        status: 'Pending',
        verificationNotes: ''
      }
    ];

    const inserted = await TrainerApplication.insertMany(applications);
    console.log(`Inserted ${inserted.length} trainer applications`);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding applications:', error);
    process.exit(1);
  }
};

seedApplications();
