// Test script to create a scene with crew and send a notification
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import User from './models/User.js';
import Scene from './models/Scene.js';
import Notification from './models/Notification.js';

async function testNotificationFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create test users
    const testUser1 = await User.findOneAndUpdate(
      { username: 'testuser1' },
      {
        username: 'testuser1',
        email: 'testuser1@example.com',
        password: 'hashedpassword', // In real app, this would be hashed
      },
      { upsert: true, new: true }
    );

    const testUser2 = await User.findOneAndUpdate(
      { username: 'testuser2' },
      {
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: 'hashedpassword',
      },
      { upsert: true, new: true }
    );

    console.log('✅ Test users created:', testUser1._id, testUser2._id);

    // Create a test scene with crew
    const testScene = await Scene.create({
      title: 'Test Notification Scene',
      description: 'This is a test scene for notification testing',
      date: '2025-10-07',
      time: '09:00',
      status: 'ready',
      createdBy: testUser1._id,
      crew: [
        {
          userId: testUser1._id,
          name: 'Test User 1',
          role: 'Camera Operator'
        },
        {
          userId: testUser2._id,
          name: 'Test User 2',
          role: 'Sound Engineer'
        }
      ]
    });

    console.log('✅ Test scene created:', testScene._id);

    // Create notification for the crew
    const notifications = await Notification.createScheduleNotification({
      itemId: testScene._id.toString(),
      itemType: 'scene',
      itemTitle: testScene.title,
      scheduledDate: testScene.date,
      scheduledTime: testScene.time,
      projectId: testScene.projectId || '000000000000000000000000', // dummy project ID
      senderId: testUser1._id,
      recipientIds: [testUser1._id.toString(), testUser2._id.toString()]
    });

    console.log('✅ Notifications created:', notifications.length);
    
    // Check if notifications were created
    const userNotifications = await Notification.find({ recipientId: testUser1._id });
    console.log('✅ User notifications found:', userNotifications.length);
    
    console.log('\n🎉 Test completed successfully!');
    console.log(`Test user IDs: ${testUser1._id}, ${testUser2._id}`);
    console.log('You can now use these user IDs in the mobile app for testing');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
  }
}

// Run the test
testNotificationFlow();