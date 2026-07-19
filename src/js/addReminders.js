const STORAGE_KEY = "aquaPlus.reminders.v2";
const LEGACY_KEY = "myRemindersList";
const DAILY_GOAL = 2000;
const SHIFT_LIMITS = { morning: 500, afternoon: 1000, evening: 2000 };
const form = document.getElementById("getReminder");
const timeInput = document.getElementById("new-reminder-time");
const addBtn = document.getElementById("add-reminder-btn");
const listUL = document.getElementById("reminderListUL");
const feedback = document.getElementById("form-feedback");
const emptyState = document.getElementById("empty-reminders");
let reminders = [];

const todayKey = () => new Date().toLocaleDateString("en-CA");
const nowTime = () => new Date().toTimeString().slice(0, 5);
let activeDay = todayKey();
const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
const getShift = (time) => {
  const hour = Number(time.split(":")[0]);
  return hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
};
const getDrankTotal = () => reminders.filter((item) => item.done).reduce((sum, item) => sum + item.volume, 0);
const getPlannedThrough = (shift) => {
  const maxHour = { morning: 12, afternoon: 18, evening: 24 }[shift];
  return reminders.filter((item) => Number(item.hour.split(":")[0]) < maxHour).reduce((sum, item) => sum + item.volume, 0);
};

function setFeedback(message = "", type = "") {
  feedback.textContent = message;
  feedback.className = `form-feedback ${type}`.trim();
}

function setDefaultTime(offset = 30) {
  const date = new Date(Date.now() + offset * 60000);
  timeInput.value = date.toTimeString().slice(0, 5);
  timeInput.min = nowTime();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  localStorage.removeItem(LEGACY_KEY);
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
  try {
    reminders = (raw ? JSON.parse(raw) : [])
      .filter((item) => item.day === todayKey() || item.day === new Date().toLocaleDateString(navigator.language))
      .map((item) => ({ ...item, day: todayKey(), volume: Number.parseInt(item.volume, 10) }))
      .filter((item) => item.hour && Number.isFinite(item.volume));
  } catch { reminders = []; }
  save();
}

function updateFormState() {
  const goalReached = getDrankTotal() >= DAILY_GOAL;
  const volume = document.querySelector('input[name="volume"]:checked');
  document.querySelectorAll('input[name="volume"]').forEach((radio) => { radio.disabled = goalReached; });
  timeInput.disabled = goalReached || !volume;
  addBtn.disabled = goalReached || !volume || !timeInput.value;
  if (volume && !timeInput.value && !goalReached) setDefaultTime();
  form.classList.toggle("goal-locked", goalReached);
}

document.querySelectorAll('input[name="volume"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    setFeedback();
    updateFormState();
    timeInput.focus();
  });
});
timeInput.addEventListener("input", updateFormState);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const selected = document.querySelector('input[name="volume"]:checked');
  const hour = timeInput.value;
  const volume = Number(selected?.value);

  if (getDrankTotal() >= DAILY_GOAL) return setFeedback("Meta concluída! Novos horários estão bloqueados hoje.", "success");
  if (!selected || !hour) return setFeedback("Escolha o volume e o horário.", "error");
  if (toMinutes(hour) <= toMinutes(nowTime())) return setFeedback("Escolha um horário futuro.", "error");
  if (reminders.some((item) => item.source !== "quick" && item.hour === hour)) return setFeedback("Já existe um lembrete nesse horário.", "error");
  if (reminders.length >= 16) return setFeedback("Limite de 16 registros por dia atingido.", "error");

  const shift = getShift(hour);
  const remaining = SHIFT_LIMITS[shift] - getPlannedThrough(shift);
  if (volume > remaining) {
    const names = { morning: "manhã", afternoon: "tarde", evening: "noite" };
    return setFeedback(remaining > 0
      ? `Nesse turno cabem mais ${remaining} ml. Escolha um volume menor.`
      : `O limite disponível até a ${names[shift]} já foi programado.`, "error");
  }

  reminders.push({ id: crypto.randomUUID?.() || String(Date.now()), day: todayKey(), hour, volume, done: false, notified: false, source: "daily" });
  reminders.sort((a, b) => a.hour.localeCompare(b.hour));
  save();
  render();
  form.reset();
  updateFormState();
  setFeedback(`Lembrete de ${volume} ml adicionado para ${hour}.`, "success");
  new Audio("./src/sounds/keypad-sound-water.mp3").play().catch(() => {});
});

listUL.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const reminder = reminders.find((item) => String(item.id) === button.dataset.id);
  if (!reminder) return;
  const before = getDrankTotal();
  if (button.dataset.action === "done") reminder.done = true;
  if (button.dataset.action === "undo") reminder.done = false;
  if (button.dataset.action === "delete") reminders = reminders.filter((item) => item !== reminder);
  save();
  render();
  if (before < DAILY_GOAL && getDrankTotal() >= DAILY_GOAL) celebrateGoal();
});

function addQuickDrink(volume = 100) {
  const before = getDrankTotal();
  const shift = getCurrentShiftConfig();
  if (before >= shift.limit) return;
  const accepted = Math.min(volume, shift.limit - before, DAILY_GOAL - before);
  reminders.push({ id: crypto.randomUUID?.() || String(Date.now()), day: todayKey(), hour: nowTime(), volume: accepted, done: true, notified: true, source: "quick" });
  save();
  render();
  if (getDrankTotal() >= DAILY_GOAL) celebrateGoal();
}

document.getElementById("aqua-portions").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-aqua-portion]");
  if (button) addQuickDrink(100);
});

function getCurrentShiftConfig() {
  const hour = new Date().getHours();
  if (hour < 12) return { key: "morning", name: "Manhã", limit: 500, base: 500, next: "Volte à tarde para continuar sua hidratação.", icon: "fa-regular fa-sun" };
  if (hour < 18) return { key: "afternoon", name: "Tarde", limit: 1000, base: 500, next: "Volte à noite para completar sua meta.", icon: "fa-solid fa-cloud-sun" };
  return { key: "evening", name: "Noite", limit: 2000, base: 1000, next: "Meta do dia concluída. Até amanhã!", icon: "fa-solid fa-moon" };
}

function celebrateGoal() {
  const layer = document.getElementById("confetti-layer");
  layer.innerHTML = Array.from({ length: 70 }, (_, index) => `<i style="--x:${Math.random() * 100};--delay:${Math.random() * .5}s;--spin:${Math.random() * 720 + 180}deg;--color:${index % 5}"></i>`).join("");
  layer.classList.add("celebrate");
  setTimeout(() => { layer.classList.remove("celebrate"); layer.innerHTML = ""; }, 3500);
}

function render() {
  const scheduled = reminders.filter((item) => item.source !== "quick");
  listUL.innerHTML = scheduled.map((item) => `
    <li class="reminder-item ${item.done ? "done" : ""}">
      <div class="time-info"><i class="fa-${item.done ? "solid fa-circle-check icon-check-done" : "regular fa-circle icon-check-pending"}" aria-hidden="true"></i>
        <div class="reminder-details"><span class="reminder-time">${item.hour}</span><span class="reminder-vol"><i class="fa-solid fa-droplet"></i> ${item.volume} ml · ${getShift(item.hour) === "morning" ? "manhã" : getShift(item.hour) === "afternoon" ? "tarde" : "noite"}</span></div>
      </div>
      <div class="reminder-actions"><button class="check-btn" data-action="${item.done ? "undo" : "done"}" data-id="${item.id}">${item.done ? "Desfazer" : "Bebi"}</button><button class="delete-btn" data-action="delete" data-id="${item.id}" aria-label="Excluir lembrete das ${item.hour}"><i class="fa-solid fa-trash-can"></i></button></div>
    </li>`).join("");
  emptyState.hidden = scheduled.length > 0;
  const total = getDrankTotal();
  document.getElementById("aqua-total").textContent = total;
  document.getElementById("aqua-progress-fill").style.width = `${Math.min(total / DAILY_GOAL * 100, 100)}%`;
  document.querySelector(".aqua-progress").setAttribute("aria-valuenow", total);
  const currentShift = getCurrentShiftConfig();
  const available = Math.max(currentShift.limit - total, 0);
  const carried = Math.max(available - currentShift.base, 0);
  document.getElementById("aqua-shift-name").textContent = currentShift.name;
  document.getElementById("aqua-shift-icon").innerHTML = `<i class="${currentShift.icon}"></i>`;
  document.getElementById("aqua-shift-quota").textContent = `${available} ml disponíveis`;
  document.getElementById("aqua-status").textContent = available === 0
    ? currentShift.next
    : carried > 0
      ? `${carried} ml vieram do turno anterior. Toque em cada porção de 100 ml.`
      : `Faltam ${available} ml neste turno. Toque após beber.`;
  const portions = Math.ceil(available / 100);
  document.getElementById("aqua-portions").innerHTML = portions
    ? Array.from({ length: portions }, (_, index) => `<button type="button" data-aqua-portion aria-label="Registrar porção ${index + 1} de 100 ml"><i class="fa-solid fa-droplet"></i><span>100 ml</span></button>`).join("")
    : `<div class="shift-complete"><i class="fa-solid fa-circle-check"></i><strong>Turno concluído</strong></div>`;
  window.updateVolGoals?.(reminders);
  updateFormState();
  if (total >= DAILY_GOAL) setFeedback("Meta de 2 L concluída. Novos horários estão bloqueados hoje.", "success");
}

window.aquaReminders = { get: () => reminders, recordWorkout(volume) {
  const accepted = Math.min(volume, Math.max(DAILY_GOAL - getDrankTotal(), 0));
  if (accepted <= 0) return 0;
  const before = getDrankTotal();
  reminders.push({ id: crypto.randomUUID?.() || String(Date.now()), day: todayKey(), hour: nowTime(), volume: accepted, done: true, notified: true, source: "workout" });
  save();
  render();
  if (before < DAILY_GOAL && getDrankTotal() >= DAILY_GOAL) celebrateGoal();
  return accepted;
}, showMode(mode) {
  document.querySelectorAll(".daily-mode-content").forEach((element) => { element.hidden = mode !== "daily"; });
  document.getElementById("aqua-mode").hidden = mode !== "aqua";
  document.getElementById("workout-mode").hidden = mode !== "workout";
  document.querySelectorAll(".shift-only").forEach((element) => { element.hidden = mode === "workout"; });
  const headings = { daily: ["Planeje seu dia", "Lembretes"], aqua: ["Beba em um toque", "Modo Aqua+"], workout: ["Hidratação no treino", "Modo Exercício"] };
  const [eyebrow, title] = headings[mode] || headings.daily;
  document.querySelector(".panel-heading .eyebrow").textContent = eyebrow;
  document.querySelector(".panel-title").textContent = title;
}, applySuggestion({ volume, offset }) {
  this.showMode("daily");
  const radio = document.querySelector(`input[name="volume"][value="${volume}"]`);
  if (radio) radio.checked = true;
  timeInput.disabled = false;
  setDefaultTime(offset);
  addBtn.disabled = false;
  setFeedback("Sugestão aplicada. Revise o horário.", "success");
} };

load();
render();
setInterval(() => { if (!timeInput.disabled) timeInput.min = nowTime(); }, 30000);
setInterval(() => { if (todayKey() !== activeDay) { activeDay = todayKey(); reminders = []; save(); render(); setFeedback("Um novo dia começou. Seus registros foram reiniciados.", "success"); } }, 60000);
