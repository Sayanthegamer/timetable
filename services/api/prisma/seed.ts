import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const timetable = {
  Sunday: [
    { time: "6:30 – 9:00 AM", subject: "📐 Maths Tuition", details: "", type: "maths" },
    { time: "9:15 – 9:30 AM", subject: "🍽️ Breakfast + Light Phone Check", details: "", type: "break" },
    { time: "9:30 – 11:30 AM", subject: "📐 Math Problem Solving", details: "", type: "maths" },
    { time: "11:30 – 12:00 PM", subject: "📱 Mobile Break / Stretch", details: "", type: "break" },
    { time: "12:00 – 1:30 PM", subject: "📝 English Revision", details: "", type: "english" },
    { time: "1:30 – 2:00 PM", subject: "🍽️ Lunch", details: "", type: "break" },
    { time: "2:00 – 4:00 PM", subject: "📘 Physics Self-Study", details: "", type: "physics" },
    { time: "4:00 – 4:30 PM", subject: "📱 Short Mobile Break / Snack", details: "", type: "break" },
    { time: "5:00 – 6:30 PM", subject: "📘 Physics Tuition", details: "", type: "physics" },
    { time: "7:00 – 8:30 PM", subject: "🧪 Chemistry Self Study", details: "", type: "chemistry" },
    { time: "8:30 – 9:00 PM", subject: "🍽️ Dinner", details: "", type: "break" },
    { time: "9:00 – 11:00 PM", subject: "📐 Math Practice / Revision", details: "", type: "maths" },
    { time: "11:00 – 11:10 PM", subject: "📱 Wind Down / Light Phone Use", details: "", type: "break" }
  ],
  Monday: [
    { time: "7:00 – 9:00 AM", subject: "📘 Physics Self-Study", details: "", type: "physics" },
    { time: "9:00 – 9:30 AM", subject: "🍽️ Breakfast + Light Phone Check", details: "", type: "break" },
    { time: "9:30 – 11:30 AM", subject: "🧪 Chemistry Revision / Notes", details: "", type: "chemistry" },
    { time: "11:30 – 12:00 PM", subject: "📱 Mobile Break / Stretch", details: "", type: "break" },
    { time: "12:00 – 1:30 PM", subject: "💻 Computer Self Study", details: "", type: "computer" },
    { time: "1:30 – 2:00 PM", subject: "🍽️ Lunch", details: "", type: "break" },
    { time: "2:00 – 4:00 PM", subject: "📐 Math Practice / Revision", details: "", type: "maths" },
    { time: "4:00 – 5:00 PM", subject: "📱 Snack / Short Phone Check", details: "", type: "break" },
    { time: "5:00 – 5:30 PM", subject: "🎸 Guitar?", details: "", type: "break" },
    { time: "5:00 – 8:00 PM", subject: "📖 Bengali Self Study", details: "", type: "bengali" },
    { time: "8:30 – 9:00 PM", subject: "🍽️ Dinner", details: "", type: "break" },
    { time: "9:00 – 11:00 PM", subject: "📐 Math Practice / Revision", details: "", type: "maths" },
    { time: "11:00 – 11:10 PM", subject: "📱 Wind Down / Light Phone Use", details: "", type: "break" }
  ],
  Tuesday: [
    { time: "7:00 – 8:30 AM", subject: "🧪 Chemistry Tuition", details: "", type: "chemistry" },
    { time: "8:50 – 9:30 AM", subject: "🍽️ Breakfast + Short Phone Check", details: "", type: "break" },
    { time: "9:30 – 11:30 AM", subject: "📐 Math Tuition", details: "", type: "maths" },
    { time: "11:30 – 1:30 PM", subject: "📐 Math Problem Solving", details: "", type: "maths" },
    { time: "1:30 – 2:00 PM", subject: "🍽️ Lunch", details: "", type: "break" },
    { time: "2:00 – 4:30 PM", subject: "🧪 Chemistry Practice", details: "", type: "chemistry" },
    { time: "4:30 – 5:00 PM", subject: "📱 Snack / Light Phone Use", details: "", type: "break" },
    { time: "5:00 – 7:30 PM", subject: "📘 Physics Self Study", details: "", type: "physics" },
    { time: "7:30 – 9:00 PM", subject: "🍽️ Dinner + Relax", details: "", type: "break" },
    { time: "9:00 – 11:00 PM", subject: "📐 Math Practice / Revision", details: "", type: "maths" }
  ],
  Wednesday: [
    { time: "7:00 – 9:00 AM", subject: "📘 Physics Self Study", details: "", type: "physics" },
    { time: "9:00 – 9:30 AM", subject: "🍽️ Breakfast + Light Phone Check", details: "", type: "break" },
    { time: "9:30 – 11:30 AM", subject: "📐 Math Practice", details: "", type: "maths" },
    { time: "11:30 – 1:30 PM", subject: "🧪 Chemistry Revision", details: "", type: "chemistry" },
    { time: "1:30 – 2:00 PM", subject: "🍽️ Lunch", details: "", type: "break" },
    { time: "2:00 – 5:30 PM", subject: "💻 Computer Revision", details: "", type: "computer" },
    { time: "5:30 – 6:30 PM", subject: "📱 Snack / Mobile Break", details: "", type: "break" },
    { time: "7:00 – 8:30 PM", subject: "💻 Computer Tuition", details: "", type: "computer" },
    { time: "8:30 – 9:00 PM", subject: "🍽️ Travel / Snack", details: "", type: "break" },
    { time: "9:00 – 11:00 PM", subject: "📐 Math Practice / Revision", details: "", type: "maths" }
  ],
  Thursday: [
    { time: "7:00 – 9:30 AM", subject: "🧪 Chemistry Self Study", details: "", type: "chemistry" },
    { time: "9:30 – 11:30 AM", subject: "📐 Math Tuition", details: "", type: "maths" },
    { time: "11:30 – 1:00 PM", subject: "📐 Math Practice / Notes", details: "", type: "maths" },
    { time: "1:00 – 2:00 PM", subject: "🍽️ Lunch", details: "", type: "break" },
    { time: "2:30 – 5:30 PM", subject: "📘 Physics Self Study", details: "", type: "physics" },
    { time: "5:30 – 6:30 PM", subject: "📱 Snack / Short Phone Check", details: "", type: "break" },
    { time: "6:30 – 8:00 PM", subject: "📘 Physics Tuition", details: "", type: "physics" },
    { time: "8:00 – 8:30 PM", subject: "🍽️ Travel / Snack", details: "", type: "break" },
    { time: "9:00 – 11:00 PM", subject: "📐 Math Practice / Revision", details: "", type: "maths" }
  ],
  Friday: [
    { time: "7:00 – 9:30 AM", subject: "📘 Physics Self Study", details: "", type: "physics" },
    { time: "9:30 – 10:00 AM", subject: "🍽️ Breakfast + Light Phone Check", details: "", type: "break" },
    { time: "10:00 – 1:00 PM", subject: "📐 Math Practice / Problem Sets", details: "", type: "maths" },
    { time: "1:00 – 2:00 PM", subject: "🍽️ Lunch", details: "", type: "break" },
    { time: "2:00 – 4:30 PM", subject: "🧪 Chemistry Revision", details: "", type: "chemistry" },
    { time: "4:30 – 5:00 PM", subject: "📱 Snack / Mobile Break", details: "", type: "break" },
    { time: "5:00 – 6:30 PM", subject: "📝 English Tuition", details: "", type: "english" },
    { time: "7:00 – 8:30 PM", subject: "💻 Computer Tuition", details: "", type: "computer" },
    { time: "8:30 – 9:00 PM", subject: "🍽️ Travel / Snack", details: "", type: "break" },
    { time: "9:00 – 11:00 PM", subject: "📐 Math Practice / Revision", details: "", type: "maths" }
  ],
  Saturday: [
    { time: "7:00 – 8:30 AM", subject: "🧪 Chemistry Tuition", details: "", type: "chemistry" },
    { time: "8:30 – 8:50 AM", subject: "🚗 Travel", details: "", type: "travel" },
    { time: "8:50 – 9:30 AM", subject: "🍽️ Breakfast + Light Phone Check", details: "", type: "break" },
    { time: "9:30 – 11:30 AM", subject: "📐 Math Tuition", details: "", type: "maths" },
    { time: "11:30 – 1:30 PM", subject: "📐 Math Self Study", details: "", type: "maths" },
    { time: "1:30 – 2:00 PM", subject: "🍽️ Lunch", details: "", type: "break" },
    { time: "2:00 – 2:30 PM", subject: "📱 Short Phone Check", details: "", type: "break" },
    { time: "2:30 – 4:30 PM", subject: "📐 Math Tuition", details: "", type: "maths" },
    { time: "4:30 – 5:00 PM", subject: "🚗 Travel / Short Phone Check", details: "", type: "travel" },
    { time: "5:00 – 8:00 PM", subject: "📖 Bengali Revision", details: "", type: "bengali" },
    { time: "8:00 – 10:00 PM", subject: "📖 Bengali Tuition", details: "", type: "bengali" },
    { time: "10:10 – 11:00 PM", subject: "📱 Wind Down / Light Phone Use", details: "", type: "break" }
  ]
};

function parseTimeRange(timeStr: string): { startTime: string; endTime: string } {
  const cleaned = timeStr.replace(/[–—]/g, '-').trim();
  const parts = cleaned.split('-').map(s => s.trim());
  
  if (parts.length !== 2) {
    throw new Error(`Invalid time range: ${timeStr}`);
  }
  
  return { startTime: parts[0], endTime: parts[1] };
}

async function main() {
  console.log('Starting seed...');

  const demoPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash: demoPassword,
      name: 'Demo User',
    },
  });

  console.log(`Created/found user: ${user.email}`);

  const schedule = await prisma.schedule.upsert({
    where: { id: user.id + '-default' },
    update: {},
    create: {
      id: user.id + '-default',
      userId: user.id,
      name: 'JEE Study Schedule',
      timezone: 'Asia/Kolkata',
      isActive: true,
    },
  });

  console.log(`Created/found schedule: ${schedule.name}`);

  for (const [day, lessons] of Object.entries(timetable)) {
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const { startTime, endTime } = parseTimeRange(lesson.time);
      
      await prisma.lesson.upsert({
        where: { 
          id: `${schedule.id}-${day}-${i}` 
        },
        update: {
          startTime,
          endTime,
          subject: lesson.subject,
          details: lesson.details || '',
          type: lesson.type,
          order: i,
        },
        create: {
          id: `${schedule.id}-${day}-${i}`,
          scheduleId: schedule.id,
          dayOfWeek: day,
          startTime,
          endTime,
          subject: lesson.subject,
          details: lesson.details || '',
          type: lesson.type,
          order: i,
        },
      });
    }
  }

  console.log('Seeded all lessons');

  await prisma.syncMetadata.upsert({
    where: { scheduleId: schedule.id },
    update: {},
    create: {
      scheduleId: schedule.id,
      lastSyncedAt: new Date(),
      syncVersion: 1,
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
