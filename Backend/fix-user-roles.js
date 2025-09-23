require('dotenv').config();
const ConnectMongo = require('./db');
const User = require('./models/User');

async function cleanupAndFixUsers() {
  try {
    await ConnectMongo();
    console.log('Connected to MongoDB');

    // Find all Google OAuth users
    const googleUsers = await User.find({ oauthProvider: 'google' });
    console.log(`Found ${googleUsers.length} Google OAuth users`);

    // Fix users who have roles but haven't completed role selection
    let fixedCount = 0;
    for (const user of googleUsers) {
      if (user.role && !user.hasCompletedRoleSelection) {
        user.hasCompletedRoleSelection = true;
        await user.save();
        fixedCount++;
        console.log(`Fixed user: ${user.email} - Role: ${user.role}`);
      }
    }

    console.log(`Fixed ${fixedCount} users`);

    // Show current state of all users
    const allUsers = await User.find({ oauthProvider: 'google' }).select('email role hasCompletedRoleSelection');
    console.log('\nCurrent user states:');
    allUsers.forEach(user => {
      console.log(`${user.email}: Role=${user.role}, RoleSelectionComplete=${user.hasCompletedRoleSelection}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupAndFixUsers();