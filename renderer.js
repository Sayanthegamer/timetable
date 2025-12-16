// Track if the user has interacted with the page (for sound autoplay)
let userHasInteracted = false;
window.addEventListener('click', () => { userHasInteracted = true; }, { once: true });
window.addEventListener('keydown', () => { userHasInteracted = true; }, { once: true });

// Main container elements (assigned after DOM ready)
let scheduleContainer = null;
let liveBanner = null;

// View state
let currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
let currentView = 'timeline'; // Track the current view ('timeline' or 'grid')

// Rendering optimization state
let lastRenderedDay = null;
let lastLiveTask = null;

// Card flip state
const flippedCards = new Set();
let isCardFlipping = false;

// Function to get a random Bengali quote
function getRandomQuote() {
  const type = Math.random() > 0.5 ? 'motivation' : 'roast';
  const quotes = bengaliQuotes[type];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  return { ...quote, type };
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

// Store theme preference in memory instead of localStorage
let currentTheme = 'light';

// Track which tasks have already played the complete sound
const completedSoundPlayed = new Set();

function switchDay(day) {
  console.log('Switching to day:', day); // Debug log
  currentDay = day;

  // Reset completion sound tracking when switching days
  completedSoundPlayed.clear();

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isManual = day !== today;

  renderSchedule(day, isManual);

  document.querySelectorAll('.day-selector button').forEach(btn => {
    const isActive = btn.dataset.day === day;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function renderSchedule(day, isManual = false) {
  console.log(`Rendering schedule for: ${day} in ${currentView} view. Manual: ${isManual}`);
  // Guard: ensure DOM container is present
  if (!scheduleContainer) {
    console.warn('renderSchedule called before scheduleContainer is available');
    return;
  }

  try {
    // Check for data availability early
    if (!window.timetable) {
      scheduleContainer.replaceChildren();
      const errorDiv = document.createElement('div');
      errorDiv.className = 'loading-card';
      errorDiv.textContent = 'Loading schedule data...';
      scheduleContainer.appendChild(errorDiv);
      return;
    }

    const daySchedule = window.timetable[day];
    if (!daySchedule || daySchedule.length === 0) {
      scheduleContainer.replaceChildren();
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-card';
      errorDiv.textContent = 'No schedule available for this day.';
      scheduleContainer.appendChild(errorDiv);
      return;
    }

    const now = new Date();
    let liveTask = null;
    let completedTasks = 0;

    // Optimization: Skip full re-render if day hasn't changed and live task is the same
    daySchedule.forEach((entry) => {
      const [start, end] = window.parseTimeRange(entry.time, now);
      const isCurrent = !isManual && start && end && now >= start && now <= end;
      if (isCurrent) {
        liveTask = entry.subject;
      }
    });

    if (lastRenderedDay === day && lastLiveTask === liveTask && scheduleContainer.children.length > 0) {
      console.log('Skipping re-render: day and live task unchanged');
      updateLiveBanner(isManual, liveTask);
      return;
    }

    lastRenderedDay = day;
    lastLiveTask = liveTask;

    scheduleContainer.style.opacity = '0.7';
    scheduleContainer.style.transform = 'translateY(10px)';

    setTimeout(() => {
      // Update view classes using classList to preserve base classes
      scheduleContainer.classList.remove('schedule-timeline', 'schedule-grid');
      scheduleContainer.classList.add(`schedule-${currentView}`);

      // Use DocumentFragment for efficient batch insertion
      const fragment = document.createDocumentFragment();

      daySchedule.forEach((entry, index) => {
        const [start, end] = window.parseTimeRange(entry.time, now);
        const isCurrent = !isManual && start && end && now >= start && now <= end;
        const isPast = !isManual && end && now > end;

        const card = document.createElement('div');
        card.className = `schedule-card ${entry.type}` + (isCurrent ? ' highlight' : '') + (isPast ? ' completed' : '');
        card.style.animationDelay = `${index * 0.05}s`;

        // Create unique card ID
        const cardId = `card-${day}-${index}`;
        card.dataset.cardId = cardId;

        // Create card front (existing content)
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';

        const header = document.createElement('div');
        header.className = 'card-header';
        header.innerHTML = `<span class="subject">${entry.subject}</span><span class="time">${entry.time}</span>`;

        const details = document.createElement('div');
        details.className = 'details';
        details.textContent = entry.details;

        const taskKey = `${entry.subject}|${entry.time}`;

        if (isPast) {
          const checkmark = document.createElement('div');
          checkmark.className = 'completion-badge';
          checkmark.innerHTML = '✓';
          cardFront.appendChild(checkmark);
          completedTasks++;
          if (!completedSoundPlayed.has(taskKey) && userHasInteracted) {
            soundManager.play('complete');
            completedSoundPlayed.add(taskKey);
          }
        }

        // Add flip hint
        const flipHint = document.createElement('div');
        flipHint.className = 'flip-hint';
        flipHint.textContent = '🔄 Click to flip';

        cardFront.appendChild(header);
        if (entry.details) cardFront.appendChild(details);
        cardFront.appendChild(flipHint);

        // Create card back (Bengali quote)
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';

        const quote = getRandomQuote();
        // Store quote info on the card for later announcements
        card.dataset.quoteType = quote.type;
        card.dataset.quoteBengali = quote.bengali;
        card.dataset.quoteTranslation = quote.translation;

        cardBack.innerHTML = `
          <div class="bengali-quote">
            ${quote.bengali}
            <div class="quote-translation">${quote.translation}</div>
          </div>
          <span class="quote-type ${quote.type}">${quote.type === 'motivation' ? '💪 Motivation' : '🔥 Roast'}</span>
        `;

        // Append front/back directly to the card (CSS targets .schedule-card.flipped)
        card.appendChild(cardFront);
        card.appendChild(cardBack);

        // Make card keyboard-focusable and accessible
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', 'false');

        // Add click handler for flip (toggle the flip class on the schedule card)
        card.addEventListener('click', (e) => {
          // Prevent flipping during animation
          if (isCardFlipping) return;

          isCardFlipping = true;
          const isFlipped = flippedCards.has(cardId);

          if (isFlipped) {
            card.classList.remove('flipped');
            flippedCards.delete(cardId);
            card.setAttribute('aria-pressed', 'false');
          } else {
            card.classList.add('flipped');
            flippedCards.add(cardId);
            card.setAttribute('aria-pressed', 'true');
          }

          if (userHasInteracted) {
            soundManager.play('click');
          }

          // Announce to screen readers which quote is now visible
          try {
            const sr = document.getElementById('sr-announce');
            if (sr) {
              const t = card.dataset.quoteType || '';
              const trans = card.dataset.quoteTranslation || '';
              const label = t === 'motivation' ? 'Motivation' : (t === 'roast' ? 'Roast' : 'Quote');
              sr.textContent = `${label} shown. ${trans}`;
            }
          } catch (err) {
            // harmless
          }

          // Reset flipping flag after animation completes
          setTimeout(() => {
            isCardFlipping = false;
          }, 600);
        });

        // Keyboard support: Enter or Space flips the card
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });

        // Add card to fragment
        fragment.appendChild(card);
        if (isCurrent) liveTask = entry.subject;
      });

      // Replace all children at once with the fragment
      scheduleContainer.replaceChildren(fragment);

      updateLiveBanner(isManual, liveTask);
      updateStats(day, daySchedule, completedTasks, liveTask);
      setTimeout(() => {
        scheduleContainer.style.opacity = '1';
        scheduleContainer.style.transform = 'translateY(0)';
      }, 100);
    }, 150);
  } catch (error) {
    console.error('Error rendering schedule:', error);
    scheduleContainer.replaceChildren();
    const errorCard = document.createElement('div');
    errorCard.className = 'error-card';
    errorCard.style.cssText = 'padding: 2rem; background: #fee; border: 2px solid #c33; border-radius: 8px;';
    errorCard.innerHTML = `<strong>Error:</strong> Failed to render schedule. ${error.message || 'Unknown error'}. Please try refreshing the page.`;
    scheduleContainer.appendChild(errorCard);
  }
}

function updateStats(day, daySchedule, completedTasks, liveTask) {
  const totalTasks = daySchedule.length;
  const studyTasks = daySchedule.filter(task =>
    ['maths', 'physics', 'chemistry', 'english', 'bengali', 'computer'].includes(task.type)
  );

  let totalStudyHours = 0;
  studyTasks.forEach(task => {
    const [start, end] = window.parseTimeRange(task.time, new Date());
    if (start && end) {
      totalStudyHours += (end - start) / (1000 * 60 * 60);
    }
  });

  const totalTasksEl = document.getElementById('total-tasks');
  if (totalTasksEl) totalTasksEl.textContent = totalTasks;

  const studyHoursEl = document.getElementById('study-hours');
  if (studyHoursEl) studyHoursEl.textContent = Math.round(totalStudyHours) + 'h';

  const completedTasksEl = document.getElementById('completed-tasks');
  if (completedTasksEl) completedTasksEl.textContent = completedTasks;

  const currentSubjectEl = document.getElementById('current-subject');
  if (currentSubjectEl) {
    currentSubjectEl.textContent = liveTask ?
      liveTask.replace(/[��📘🧪📕📖🍽️🚿😌🧘🚗💻🎸📱]/g, '').trim().substring(0, 8) + '...' : '—';
  }
}

function updateLiveBanner(isManual, liveTask) {
  if (!liveBanner) return; // Bail out if banner missing

  if (!isManual) {
    liveBanner.innerHTML = liveTask ? `Live Now: ${liveTask}` : 'Live Now: —';
  } else {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySchedule = window.timetable[today] || [];
    const now = new Date();
    let todayLiveTask = null;

    for (let entry of todaySchedule) {
      const [start, end] = window.parseTimeRange(entry.time, now);
      if (start && end && now >= start && now <= end) {
        todayLiveTask = entry.subject;
        break;
      }
    }

    liveBanner.innerHTML = todayLiveTask ? `Live Now: ${todayLiveTask}` : 'Live Now: —';
  }
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  currentTheme = 'light';
  toggle.addEventListener('change', () => {
    document.body.classList.toggle('dark');
    currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
    if (userHasInteracted) {
      soundManager.play('theme'); // Play a new sound for theme switch
    }
    console.log('Theme switched to:', currentTheme);
  });
}

function initDaySelector() {
  const buttons = document.querySelectorAll('.day-selector button');
  buttons.forEach(btn => {
    const day = btn.dataset.day;
    if (day === currentDay) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    }
    btn.addEventListener('click', function () {
      if (userHasInteracted) {
        soundManager.play('click');
      }
      const day = this.dataset.day;
      if (day) {
        switchDay(day);
      }
    });
    // Add hover sound
    btn.addEventListener('mouseenter', () => {
      if (userHasInteracted) {
        soundManager.play('hover');
      }
    });
  });
}

function startLiveUpdates() {
  setInterval(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    // Re-render only if we are on the current day to update live status
    const isViewingToday = currentDay === today;
    if (isViewingToday) {
      renderSchedule(currentDay, false);
    } else {
      // If viewing another day, just update the live banner for today
      updateLiveBanner(true, null);
    }
    // Update week progress every minute as well
    updateWeekProgress();
  }, 60000);
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM loaded, initializing...');

  // Assign main container elements now that DOM is ready
  scheduleContainer = document.getElementById('schedule-container');
  liveBanner = document.getElementById('live-now');

  // SAFETY CHECK
  if (!scheduleContainer) {
    console.error('schedule-container element not found!');
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-card';
      errorDiv.style.cssText = 'margin: 2rem; padding: 2rem; background: #fee; border: 2px solid #c33; border-radius: 8px;';
      errorDiv.innerHTML = '<strong>Error:</strong> Schedule container not found. Please check the HTML structure.';
      mainContent.appendChild(errorDiv);
    }
    return;
  }
  if (!liveBanner) {
    console.error('live-now element not found!');
    return;
  }

  // ARIA live region for announcements is defined in HTML

  // Check if timetable exists
  if (!window.timetable) {
    console.error('Timetable data not loaded!');
    scheduleContainer.innerHTML = '<div class="error-card">Error: Schedule data failed to load. Please refresh the page.</div>';
    return;
  }

  initCurrentDate();
  setTimeout(() => {
    console.log('Timetable available:', !!window.timetable);
    initThemeToggle();
    initDaySelector();
    initViewOptions(); // Initialize view switching
    renderSchedule(currentDay);
    startLiveUpdates();
    updateWeekProgress();
  }, 100);
});

function initCurrentDate() {
  const currentDateEl = document.getElementById('current-date');
  if (currentDateEl) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
  }
}

function initViewOptions() {
  const viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (view !== currentView) {
        if (userHasInteracted) {
          soundManager.play('click');
        }
        currentView = view;
        // Update active button
        viewButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // **FIX**: Check if the currently viewed day is today.
        // Render with isManual=false if it's today, so completed tasks show up.
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const isViewingToday = currentDay === today;
        renderSchedule(currentDay, !isViewingToday);
      }
    });
  });
}

function updateWeekProgress() {
  const now = new Date();
  let dayOfWeek = (now.getDay() + 6) % 7; // Monday=0, Sunday=6
  const hour = now.getHours();
  const minute = now.getMinutes();
  const dayProgress = (hour * 60 + minute) / (24 * 60); // Progress through the current day
  let weekProgress = Math.round(((dayOfWeek + dayProgress) / 7) * 100); // Total week progress
  weekProgress = Math.max(0, Math.min(weekProgress, 100)); // Clamp between 0 and 100

  const progressEl = document.getElementById('progress-percent');
  const circle = document.getElementById('week-progress-circle');

  if (progressEl) {
    progressEl.textContent = weekProgress; // Update percentage text
  }

  if (circle) {
    const radius = 45; // Updated radius to match new HTML
    const circumference = 2 * Math.PI * radius; // ~282.7
    circle.setAttribute('stroke-dasharray', circumference);
    const offset = circumference * (1 - weekProgress / 100); // Calculate offset
    circle.style.strokeDashoffset = offset; // Apply offset
  }

  console.log(`Week progress: ${weekProgress}%`);
}

window.switchDay = switchDay;

// Sound Effects Manager
class SoundManager {
  constructor() {
    this.sounds = {
      click: document.getElementById('click-sound'),
      hover: document.getElementById('hover-sound'),
      complete: document.getElementById('complete-sound'),
      notification: document.getElementById('notification-sound'),
      theme: document.getElementById('theme-sound')
    };
    this.enabled = true;
    this.volume = 0.6;
    this.init();
  }

  init() {
    // Set volume for all sounds and ensure they start muted
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.volume = this.volume;
        sound.muted = true;
      }
    });
  }

  play(soundName) {
    if (!userHasInteracted) {
      console.log(`[SoundManager] Blocked sound before user interaction: ${soundName}`);
      return;
    }
    if (!this.enabled) {
      console.log(`[SoundManager] Sound disabled, not playing: ${soundName}`);
      return;
    }
    if (!this.sounds[soundName]) {
      console.log(`[SoundManager] Sound not found: ${soundName}`);
      return;
    }
    try {
      const sound = this.sounds[soundName];
      sound.muted = false;
      sound.currentTime = 0;
      const playPromise = sound.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(e => {
          console.log('[SoundManager] Sound autoplay prevented:', e);
        });
      } else {
        console.log(`[SoundManager] Playing sound: ${soundName}`);
      }
    } catch (e) {
      console.log('[SoundManager] Sound play error:', e);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    // When disabled, mute all sounds
    if (!this.enabled) {
      Object.values(this.sounds).forEach(sound => {
        if (sound) sound.muted = true;
      });
    }
    return this.enabled;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    Object.values(this.sounds).forEach(sound => {
      if (sound) sound.volume = this.volume;
    });
  }
}

// Initialize sound manager
const soundManager = new SoundManager();

// Initialize sound toggle
const soundToggleBtn = document.getElementById('sound-toggle-btn');
if (soundToggleBtn) {
  soundToggleBtn.classList.toggle('muted', !soundManager.enabled);
  soundToggleBtn.addEventListener('click', () => {
    const enabled = soundManager.toggle();
    soundToggleBtn.classList.toggle('muted', !enabled);
    if (userHasInteracted) {
      soundManager.play('click');
    }
  });
}
