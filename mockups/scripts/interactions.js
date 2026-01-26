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

// Calendar day click handling
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
  initNavigation();

  // Animate progress bars after a short delay
  setTimeout(animateProgressBars, 300);
});

// Export for use in individual screens
window.Needled = {
  PipController,
  PipStates,
  createConfetti,
  checkAllHabitsComplete
};
