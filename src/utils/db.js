import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function createUser(userData) {
  try {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role,
      },
    });
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(userId, userData) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: userData,
    });
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(userId) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
} 