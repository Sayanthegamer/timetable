import type { Schedule } from 'timetable-sdk';

const MOCK_SCHEDULE: Schedule = {
  Sunday: [
    { time: "6:30 – 9:00 AM", subject: "📐 Maths Tuition", details: "", type: "maths" },
    { time: "9:15 – 9:30 AM", subject: "🍽️ Breakfast + Light Phone Check", details: "", type: "break" },
    { time: "9:30 – 11:30 AM", subject: "📐 Math Problem Solving", details: "", type: "maths" },
    { time: "11:30 – 12:00 PM", subject: "📱 Mobile Break / Stretch", details: "", type: "break" },
    { time: "12:00 – 1:30 PM", subject: "📖 English Revision", details: "", type: "english" },
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
    { time: "2:00 – 4:00 PM", subject: "📘 Physics Problem Solving", details: "", type: "physics" },
    { time: "4:00 – 5:00 PM", subject: "📱 Snack / Mobile Break", details: "", type: "break" },
    { time: "5:00 – 8:00 PM", subject: "📖 English Self Study", details: "", type: "english" },
    { time: "8:30 – 9:00 PM", subject: "🍽️ Dinner", details: "", type: "break" },
    { time: "9:00 – 11:00 PM", subject: "🧪 Chemistry Practice", details: "", type: "chemistry" },
    { time: "11:00 – 11:10 PM", subject: "📱 Wind Down", details: "", type: "break" }
  ],
  Thursday: [
    { time: "7:00 – 9:00 AM", subject: "📐 Math Self Study", details: "", type: "maths" },
    { time: "9:00 – 9:30 AM", subject: "🍽️ Breakfast + Light Phone Check", details: "", type: "break" },
    { time: "9:30 – 11:30 AM", subject: "📘 Physics Revision", details: "", type: "physics" },
    { time: "11:30 – 12:00 PM", subject: "📱 Mobile Break / Stretch", details: "", type: "break" },
    { time: "12:00 – 1:30 PM", subject: "💻 Computer Practice", details: "", type: "computer" },
    { time: "1:30 – 2:00 PM", subject: "🍽️ Lunch", details: "", type: "break" },
    { time: "2:00 – 4:00 PM", subject: "🧪 Chemistry Self Study", details: "", type: "chemistry" },
    { time: "4:00 – 5:00 PM", subject: "📱 Snack / Short Break", details: "", type: "break" },
    { time: "5:00 – 6:30 PM", subject: "📘 Physics Tuition", details: "", type: "physics" },
    { time: "7:00 – 8:30 PM", subject: "📐 Math Problem Solving", details: "", type: "maths" },
    { time: "8:30 – 9:00 PM", subject: "🍽️ Dinner", details: "", type: "break" },
    { time: "9:00 – 11:00 PM", subject: "📖 Bengali Self Study", details: "", type: "bengali" }
  ],
  Friday: [
    { time: "7:00 – 8:30 AM", subject: "🧪 Chemistry Tuition", details: "", type: "chemistry" },
    { time: "8:50 – 9:30 AM", subject: "🍽️ Breakfast + Short Phone Check", details: "", type: "break" },
    { time: "9:30 – 11:30 AM", subject: "📐 Math Tuition", details: "", type: "maths" },
    { time: "11:30 – 1:30 PM", subject: "📘 Physics Practice", details: "", type: "physics" },
    { time: "1:30 – 2:00 PM", subject: "🍽️ Lunch", details: "", type: "break" },
    { time: "2:00 – 4:30 PM", subject: "📐 Math Problem Solving", details: "", type: "maths" },
    { time: "4:30 – 5:00 PM", subject: "📱 Snack / Light Phone Use", details: "", type: "break" },
    { time: "5:00 – 7:30 PM", subject: "🧪 Chemistry Self Study", details: "", type: "chemistry" },
    { time: "7:30 – 9:00 PM", subject: "🍽️ Dinner + Relax", details: "", type: "break" },
    { time: "9:00 – 11:00 PM", subject: "📖 English Revision", details: "", type: "english" }
  ],
  Saturday: [
    { time: "7:00 – 9:00 AM", subject: "📐 Math Self Study", details: "", type: "maths" },
    { time: "9:00 – 9:30 AM", subject: "🍽️ Breakfast + Light Phone Check", details: "", type: "break" },
    { time: "9:30 – 11:30 AM", subject: "📘 Physics Revision", details: "", type: "physics" },
    { time: "11:30 – 12:00 PM", subject: "📱 Mobile Break / Stretch", details: "", type: "break" },
    { time: "12:00 – 1:30 PM", subject: "🧪 Chemistry Practice", details: "", type: "chemistry" },
    { time: "1:30 – 2:00 PM", subject: "🍽️ Lunch", details: "", type: "break" },
    { time: "2:00 – 4:00 PM", subject: "💻 Computer Self Study", details: "", type: "computer" },
    { time: "4:00 – 5:00 PM", subject: "📱 Snack / Short Break", details: "", type: "break" },
    { time: "5:00 – 8:00 PM", subject: "📐 Math Practice", details: "", type: "maths" },
    { time: "8:30 – 9:00 PM", subject: "🍽️ Dinner", details: "", type: "break" },
    { time: "9:00 – 11:00 PM", subject: "📖 Bengali Revision", details: "", type: "bengali" }
  ]
};

export function getMockSchedule(): Schedule {
  return JSON.parse(JSON.stringify(MOCK_SCHEDULE));
}
