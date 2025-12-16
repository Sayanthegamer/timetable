import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  console.log('Setting up test environment...');
});

afterAll(async () => {
  console.log('Cleaning up test environment...');
  await prisma.$disconnect();
});

beforeEach(async () => {
  console.log('Starting test...');
});

afterEach(async () => {
  console.log('Test completed.');
});
