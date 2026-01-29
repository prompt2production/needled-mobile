/**
 * Needled Mockup Interactions
 * Handles Pip state changes, habit toggles, and celebration effects
 */

// Pip state management
const PipStates = {
  CHEERFUL: 'cheerful',
  CELEBRATING: 'celebrating',
  ENCOURAGING: 'encouraging',
  CURIOUS: 'curious',
  PROUD: 'proud',
  SLEEPING: 'sleeping'
};

class PipController {
  constructor(pipElement) {
    this.pip = pipElement;
    this.currentState = pipElement?.dataset.state || PipStates.CHEERFUL;
  }

  setState(newState, celebrate = false) {
    if (!this.pip) return;

    const basePath = this.pip.dataset.basePath || '../media/';

    // Add transition class
    this.pip.classList.add('pip--transitioning');

    setTimeout(() => {
      // Update image source
      this.pip.src = `${basePath}pip-${newState}.png`;
      this.pip.dataset.state = newState;
      this.currentState = newState;

      // Remove transition, add celebration if needed
      this.pip.classList.remove('pip--transitioning');

      if (celebrate) {
        this.pip.classList.add('pip--celebrating');
        setTimeout(() => {
          this.pip.classList.remove('pip--celebrating');
        }, 600);
      }
    }, 150);
  }

  celebrate() {
    if (!this.pip) return;
    this.pip.classList.add('pip--celebrating');
    setTimeout(() => {
      this.pip.classList.remove('pip--celebrating');
    }, 600);
  }
}

// Confetti effect
function createConfetti(container = document.body) {
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';

  const colors = ['teal', 'coral', 'yellow', 'success'];
  const shapes = ['circle', 'square'];

  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    confetti.className = `confetti confetti--${shape} confetti--${color}`;
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    confetti.style.animationDuration = `${2 + Math.random() * 2}s`;

    confettiContainer.appendChild(confetti);
  }

  container.appendChild(confettiContainer);

  // Remove after animation
  setTimeout(() => {
    confettiContainer.remove();
  }, 4000);
}

// Habit toggle functionality
function initHabitToggles() {
  const habitCards = document.querySelectorAll('.habit-card');

  habitCards.forEach(card => {
    card.addEventListener('click', () => {
      const wasCompleted = card.classList.contains('completed');
      card.classList.toggle('completed');

      // Animate checkmark
      const check = card.querySelector('.habit-card__check');
      if (check && !wasCompleted) {
        check.innerHTML = `
          <svg class="checkmark-animated" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
      } else if (check) {
        check.innerHTML = '';
      }

      // Check if all habits are completed
      checkAllHabitsComplete();
    });
  });
}

function checkAllHabitsComplete() {
  const habitCards = document.querySelectorAll('.habit-card');
  const allComplete = Array.from(habitCards).every(card =>
    card.classList.contains('completed')
  );

  if (allComplete && habitCards.length > 0) {
    const pip = document.querySelector('.pip');
    if (pip) {
      const pipController = new PipController(pip);
      pipController.setState(PipStates.CELEBRATING, true);
      createConfetti();
    }

    // Update any "all complete" UI elements
    const completeMessage = document.querySelector('.all-complete-message');
    if (completeMessage) {
      completeMessage.classList.remove('hidden');
      completeMessage.classList.add('celebration-slide');
    }
  }
}

// Weight stepper functionality
function initWeightStepper() {
  const stepper = document.querySelector('.input-stepper');
  if (!stepper) return;

  const display = stepper.querySelector('.input-stepper__number');
  const decreaseBtn = stepper.querySelector('[data-action="decrease"]');
  const increaseBtn = stepper.querySelector('[data-action="increase"]');

  if (!display || !decreaseBtn || !increaseBtn) return;

  let value = parseFloat(display.textContent) || 165;
  const step = 0.1;
  const min = 50;
  const max = 500;

  function updateDisplay() {
    display.textContent = value.toFixed(1);
    display.classList.add('number-pop');
    setTimeout(() => display.classList.remove('number-pop'), 400);
  }

  decreaseBtn.addEventListener('click', () => {
    if (value > min) {
      value = Math.round((value - step) * 10) / 10;
      updateDisplay();
    }
  });

  increaseBtn.addEventListener('click', () => {
    if (value < max) {
      value = Math.round((value + step) * 10) / 10;
      updateDisplay();
    }
  });
}

// Screen state transitions (for injection/weigh-in screens)
function initScreenStates() {
  const actionBtns = document.querySelectorAll('[data-action="complete"]');

  actionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const beforeState = document.querySelector('.screen-state--before');
      const afterState = document.querySelector('.screen-state--after');

      if (beforeState && afterState) {
        beforeState.classList.add('hidden');
        afterState.classList.remove('hidden');
        afterState.classList.add('fade-in');

        // Trigger Pip celebration
        const pip = afterState.querySelector('.pip');
        if (pip) {
          const pipController = new PipController(pip);
          pipController.celebrate();
        }

        // Create confetti
        createConfetti();
      }
    });
  });
}

// Progress bar animation
function animateProgressBars() {
  const progressBars = document.querySelectorAll('.progress-bar__fill');

  progressBars.forEach(bar => {
    const targetWidth = bar.style.width;
    bar.style.width = '0';

    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 100);
  });
}

// Calendar day click handling (legacy support)
function initCalendar() {
  const days = document.querySelectorAll('.calendar__day:not(.calendar__day--empty)');

  days.forEach(day => {
    day.addEventListener('click', () => {
      // Remove active from all days
      days.forEach(d => d.classList.remove('calendar__day--selected'));
      // Add active to clicked day
      day.classList.add('calendar__day--selected');
    });
  });
}

// Journey Map functionality
function initJourneyMap() {
  const journeyDays = document.querySelectorAll('.journey-day:not(.journey-day--empty):not(.journey-day--future)');
  const pip = document.querySelector('.pip');
  const speechBubble = document.querySelector('.pip-speech-bubble');

  // Day tap interactions
  journeyDays.forEach(day => {
    day.addEventListener('click', () => {
      // Tap animation
      day.classList.add('journey-day--tapped');
      setTimeout(() => day.classList.remove('journey-day--tapped'), 200);

      // Check for milestone day
      const streak = day.dataset.streak;
      if (streak) {
        triggerMilestoneCelebration(parseInt(streak));
      }

      // Perfect day celebration (100% completion)
      const completion = day.dataset.completion;
      if (completion === '100') {
        triggerMiniCelebration();
      }

      // Update Pip speech based on day clicked
      updatePipSpeech(day, pip, speechBubble);
    });
  });

  // Animate calendar rows on load with stagger
  animateCalendarRows();

  // Setup share button
  initShareButton();
}

// Animate calendar rows with stagger effect
function animateCalendarRows() {
  const calendarDays = document.getElementById('journeyDays');
  if (!calendarDays) return;

  const days = calendarDays.querySelectorAll('.journey-day');
  days.forEach((day, index) => {
    const rowIndex = Math.floor(index / 7);
    day.style.animationDelay = `${rowIndex * 50}ms`;
    day.classList.add('calendar-row-animate');
  });
}

// Mini celebration for perfect days
function triggerMiniCelebration() {
  // Create a small burst of confetti
  const container = document.createElement('div');
  container.className = 'confetti-container';

  const colors = ['teal', 'success'];
  for (let i = 0; i < 10; i++) {
    const confetti = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    confetti.className = `confetti confetti--circle confetti--${color}`;
    confetti.style.left = `${40 + Math.random() * 20}%`;
    confetti.style.animationDelay = `${Math.random() * 0.2}s`;
    confetti.style.animationDuration = `${1 + Math.random()}s`;
    container.appendChild(confetti);
  }

  document.body.appendChild(container);
  setTimeout(() => container.remove(), 2000);
}

// Milestone celebration with enhanced effects
function triggerMilestoneCelebration(streakDays) {
  const pip = document.querySelector('.pip');

  // Create enhanced confetti
  createConfetti();

  // Pip celebrates
  if (pip) {
    const pipController = new PipController(pip);
    pipController.setState(PipStates.CELEBRATING, true);

    // Update speech bubble
    const speechBubble = document.querySelector('.pip-speech-bubble');
    if (speechBubble) {
      const messages = {
        7: '"One week strong! 💪"',
        14: '"Two weeks! Unstoppable!"',
        30: '"30 DAYS! LEGEND! 🏆"'
      };
      speechBubble.textContent = messages[streakDays] || '"Amazing progress!"';
      speechBubble.classList.add('speech-animate');
    }
  }

  // Flash milestone badge
  const milestoneDay = document.querySelector(`[data-streak="${streakDays}"]`);
  if (milestoneDay) {
    milestoneDay.classList.add('milestone-pop');
    setTimeout(() => milestoneDay.classList.remove('milestone-pop'), 500);
  }
}

// Update Pip's speech based on context
function updatePipSpeech(day, pip, speechBubble) {
  if (!speechBubble) return;

  const completion = parseInt(day.dataset.completion) || 0;
  const hasInjection = day.querySelector('.journey-day__badge--injection');
  const hasWeighin = day.querySelector('.journey-day__badge--weighin');
  const isToday = day.classList.contains('journey-day--today');

  let message = '';

  if (isToday) {
    message = '"Today is your day!"';
  } else if (hasInjection && hasWeighin) {
    message = '"What a productive day!"';
  } else if (hasInjection) {
    message = '"Injection day done! 💉"';
  } else if (hasWeighin) {
    message = '"Weigh-in logged! ⚖️"';
  } else if (completion === 100) {
    message = '"Perfect day! ⭐"';
  } else if (completion >= 66) {
    message = '"Almost there!"';
  } else if (completion > 0) {
    message = '"Every step counts!"';
  } else {
    message = '"Let\'s get moving!"';
  }

  speechBubble.textContent = message;
  speechBubble.classList.remove('speech-animate');
  // Trigger reflow for animation restart
  void speechBubble.offsetWidth;
  speechBubble.classList.add('speech-animate');
}

// Calculate current streak from journey data
function calculateCurrentStreak() {
  const days = document.querySelectorAll('.journey-day[data-completion="100"]');
  let streak = 0;
  let currentStreak = 0;

  days.forEach((day, index) => {
    const dayNum = parseInt(day.dataset.day);
    const nextDay = days[index + 1];
    const nextDayNum = nextDay ? parseInt(nextDay.dataset.day) : null;

    if (nextDayNum === dayNum + 1) {
      currentStreak++;
    } else {
      if (currentStreak > streak) {
        streak = currentStreak + 1;
      }
      currentStreak = 0;
    }
  });

  return Math.max(streak, currentStreak + 1);
}

// Update Pip state based on monthly progress
function updatePipForProgress() {
  const pip = document.querySelector('.pip');
  if (!pip) return;

  const completedDays = document.querySelectorAll('.journey-day[data-completion="100"]').length;
  const totalDays = document.querySelectorAll('.journey-day[data-day]').length;
  const completionRate = (completedDays / totalDays) * 100;

  const pipController = new PipController(pip);

  if (completionRate >= 80) {
    pipController.setState(PipStates.PROUD);
  } else if (completionRate >= 60) {
    pipController.setState(PipStates.CHEERFUL);
  } else if (completionRate >= 40) {
    pipController.setState(PipStates.ENCOURAGING);
  } else {
    pipController.setState(PipStates.CURIOUS);
  }
}

// Share button functionality
function initShareButton() {
  const shareBtn = document.getElementById('shareBtn');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', () => {
    // Trigger celebration effect
    createConfetti();

    // Visual feedback
    shareBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      shareBtn.style.transform = 'scale(1)';
    }, 150);

    // In a real app, this would open share dialog
    // For mockup, just show a visual celebration
    const pip = document.querySelector('.pip');
    if (pip) {
      const pipController = new PipController(pip);
      pipController.celebrate();
    }
  });
}

// Navigation highlighting
function initNavigation() {
  const navItems = document.querySelectorAll('.bottom-nav__item');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

// Initialize all interactions when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initHabitToggles();
  initWeightStepper();
  initScreenStates();
  initCalendar();
  initJourneyMap();
  initNavigation();

  // Animate progress bars after a short delay
  setTimeout(animateProgressBars, 300);

  // Update Pip based on progress after animations settle
  setTimeout(updatePipForProgress, 500);
});

// Export for use in individual screens
window.Needled = {
  PipController,
  PipStates,
  createConfetti,
  checkAllHabitsComplete,
  triggerMilestoneCelebration,
  calculateCurrentStreak
};
