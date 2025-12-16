import { Timetable, TimetableEntry } from './types';

export interface Quote {
  bengali: string;
  translation: string;
  type: 'motivation' | 'roast';
}

const bengaliQuotes = {
  motivation: [
    { bengali: "চলতে থাকো, তুমি পারবে!", translation: "Keep going, you can do it!" },
    { bengali: "প্রতিটি পদক্ষেপ তোমাকে লক্ষ্যের কাছে নিয়ে যাচ্ছে", translation: "Every step brings you closer to your goal" },
    { bengali: "হাল ছেড়ো না, সফলতা খুব কাছে", translation: "Don't give up, success is near" },
    { bengali: "তোমার পরিশ্রম কখনো বৃথা যাবে না", translation: "Your hard work will never go to waste" },
    { bengali: "বিশ্বাস রাখো নিজের উপর", translation: "Believe in yourself" },
    { bengali: "আজকের কষ্ট, কালের সাফল্য", translation: "Today's struggle, tomorrow's success" },
    { bengali: "তুমি যা ভাবছো তার চেয়ে শক্তিশালী", translation: "You're stronger than you think" },
    { bengali: "স্বপ্ন দেখো বড়, পরিশ্রম করো বেশি", translation: "Dream big, work harder" },
    { bengali: "প্রতিটি মুহূর্ত গুরুত্বপূর্ণ, নষ্ট করো না", translation: "Every moment matters, don't waste it" },
    { bengali: "তোমার লক্ষ্য তোমার শক্তি", translation: "Your goal is your strength" }
  ],
  roast: [
    { bengali: "পড়াশোনা করো, ফোন ছাড়ো!", translation: "Study more, leave the phone!" },
    { bengali: "এভাবে চললে JEE তো দূরের কথা!", translation: "At this rate, forget JEE!" },
    { bengali: "ঘুম কম, পড়া বেশি - এটাই নিয়ম", translation: "Less sleep, more study - that's the rule" },
    { bengali: "সোশ্যাল মিডিয়া বন্ধ করো, বই খোলো", translation: "Close social media, open books" },
    { bengali: "সময় নষ্ট করছো নাকি পড়া করছো?", translation: "Wasting time or studying?" },
    { bengali: "এত আলস্য নিয়ে সফল হবে কীভাবে?", translation: "How will you succeed being so lazy?" },
    { bengali: "ব্রেক শেষ, এবার পড়তে বসো", translation: "Break's over, time to study" },
    { bengali: "মনোযোগ দাও, বিভ্রান্ত হয়ো না", translation: "Focus, don't get distracted" },
    { bengali: "পরীক্ষা কাছে, তুমি কোথায়?", translation: "Exam's near, where are you?" },
    { bengali: "গল্প কম, পড়াশোনা বেশি করো", translation: "Less chatting, more studying" }
  ]
};

export function getRandomQuote(): Quote {
  const type = Math.random() > 0.5 ? 'motivation' : 'roast';
  const quotes = bengaliQuotes[type as keyof typeof bengaliQuotes];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  return { ...quote, type: type as 'motivation' | 'roast' };
}

export function filterTimetableByDay(timetable: Timetable, day: string): TimetableEntry[] {
  return timetable[day] || [];
}

export function calculateWeekProgress(date: Date = new Date()): number {
  let dayOfWeek = (date.getDay() + 6) % 7; // Monday=0, Sunday=6
  const hour = date.getHours();
  const minute = date.getMinutes();
  const dayProgress = (hour * 60 + minute) / (24 * 60); // Progress through the current day
  let weekProgress = Math.round(((dayOfWeek + dayProgress) / 7) * 100); // Total week progress
  return Math.max(0, Math.min(weekProgress, 100)); // Clamp between 0 and 100
}

// Helper to transform linear timeline to grid compatible structure (if complex logic is needed)
// For now, it just returns the array, but placeholders for future grid-specific transformations
export function transformToGrid(entries: TimetableEntry[]): TimetableEntry[] {
  return entries;
}
