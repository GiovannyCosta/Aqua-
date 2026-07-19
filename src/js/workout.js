const workoutSetup = document.getElementById("workout-setup");
const workoutSession = document.getElementById("workout-session");
const preview = document.getElementById("workout-plan-preview");
const timerText = document.getElementById("workout-timer");
const drankButton = document.getElementById("workout-drank");
const pauseButton = document.getElementById("workout-pause");
let workout = null;
let timerId = null;

const selectedNumber = (name) => Number(document.querySelector(`input[name="${name}"]:checked`).value);

function getPlan() {
  const goal = selectedNumber("workout-goal");
  const duration = selectedNumber("workout-duration");
  const rounds = Math.max(duration / 15, 1);
  return { goal, duration, rounds, dose: goal / rounds };
}

function formatMl(value) {
  return Number.isInteger(value) ? `${value} ml` : `${value.toFixed(1).replace(".", ",")} ml`;
}

function getRoundDose(plan) {
  const base = Math.floor(plan.goal / plan.rounds);
  const remainder = plan.goal % plan.rounds;
  return base + (plan.round <= remainder ? 1 : 0);
}

function updatePreview() {
  const plan = getPlan();
  preview.innerHTML = `<i class="fa-solid fa-droplet"></i><span><strong>${plan.rounds} sessões de ${formatMl(plan.dose)}</strong><small>Uma sessão a cada 15 minutos durante ${plan.duration} minutos.</small></span>`;
}

document.querySelectorAll('input[name="workout-goal"], input[name="workout-duration"]').forEach((input) => input.addEventListener("change", updatePreview));

document.getElementById("workout-start").addEventListener("click", () => {
  workout = { ...getPlan(), round: 1, seconds: 15 * 60, paused: false, consumed: 0 };
  workoutSetup.hidden = true;
  workoutSession.hidden = false;
  renderWorkout();
  startTimer();
});

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    if (!workout || workout.paused) return;
    workout.seconds -= 1;
    if (workout.seconds <= 0) {
      workout.seconds = 0;
      clearInterval(timerId);
      drankButton.disabled = false;
      document.getElementById("timer-ring").classList.add("ready");
      new Audio("./src/sounds/ring-alarm.mp3").play().catch(() => {});
    }
    renderWorkout();
  }, 1000);
}

function renderWorkout() {
  if (!workout) return;
  const minutes = String(Math.floor(workout.seconds / 60)).padStart(2, "0");
  const seconds = String(workout.seconds % 60).padStart(2, "0");
  timerText.textContent = `${minutes}:${seconds}`;
  document.getElementById("workout-dose").textContent = `Beba ${formatMl(getRoundDose(workout))}`;
  document.getElementById("workout-round").textContent = `Sessão ${workout.round} de ${workout.rounds} · ${formatMl(workout.consumed)} registrados`;
  document.getElementById("workout-progress-fill").style.width = `${(workout.round - 1) / workout.rounds * 100}%`;
  pauseButton.innerHTML = workout.paused ? '<i class="fa-solid fa-play"></i> Continuar' : '<i class="fa-solid fa-pause"></i> Pausar';
}

drankButton.addEventListener("click", () => {
  const accepted = window.aquaReminders?.recordWorkout(getRoundDose(workout)) || 0;
  workout.consumed += accepted;
  document.getElementById("workout-progress-fill").style.width = `${workout.round / workout.rounds * 100}%`;
  if (workout.round >= workout.rounds || accepted === 0) {
    clearInterval(timerId);
    timerText.textContent = "✓";
    document.getElementById("workout-dose").textContent = accepted === 0 ? "Meta diária já concluída" : "Treino concluído!";
    document.getElementById("workout-round").textContent = `${formatMl(workout.consumed)} registrados durante este treino.`;
    drankButton.hidden = true;
    pauseButton.hidden = true;
    document.getElementById("timer-ring").classList.add("complete");
    return;
  }
  workout.round += 1;
  workout.seconds = 15 * 60;
  drankButton.disabled = true;
  document.getElementById("timer-ring").classList.remove("ready");
  renderWorkout();
  startTimer();
});

pauseButton.addEventListener("click", () => { workout.paused = !workout.paused; renderWorkout(); });
document.getElementById("workout-reset").addEventListener("click", resetWorkout);

function resetWorkout() {
  clearInterval(timerId);
  workout = null;
  workoutSession.hidden = true;
  workoutSetup.hidden = false;
  drankButton.hidden = false;
  drankButton.disabled = true;
  pauseButton.hidden = false;
  document.getElementById("timer-ring").classList.remove("ready", "complete");
  updatePreview();
}

updatePreview();
