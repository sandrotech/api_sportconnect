import bcrypt from 'bcrypt';
import prisma from './src/config/prisma.js';

async function resetPassword(email, newPassword) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log(`Password successfully reset for user: ${email}`);
    console.log(`User ID: ${updatedUser.id}`);
    console.log(`Role: ${updatedUser.role}`);
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Usage: node reset-password.js <email> <new-password>');
  process.exit(1);
}

resetPassword(email, newPassword);