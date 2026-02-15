const timeInput = document.getElementById("new-reminder-time");
const addBtn = document.getElementById("add-reminder-btn");
const listUL = document.getElementById("reminderListUL");
let listReminderItem = [];

// Habilita botões de adicionar e escolher o volume
document.querySelectorAll('input[name="volume"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.checked) {
      timeInput.disabled = false;
      addBtn.disabled = false;
    }
  });
});

addBtn.addEventListener("click", (e) => {
  e.preventDefault();
  // import
  const appData = window.getAppDateConfig();
  const langConfig = appData.lang;
  const now = appData.now;

  const day = now.toLocaleDateString(langConfig);
  const getCurrentHour = now.getHours();
  const getCurrentMinutes = now.getMinutes();

  const selectedVol = document.querySelector('input[name="volume"]:checked');
  const timeValue = timeInput.value;

  const [hourInput, minInput] = timeValue.split(":").map(Number);
  if (
    hourInput < getCurrentHour ||
    (hourInput === getCurrentHour && minInput < getCurrentMinutes)
  ) {
    alert("Você não pode agendar um lembrete para um horário que já passou!");
  } else {
    const newReminder = {
      id: Date.now(),
      day: day,
      hour: timeValue,
      volume: selectedVol.value,
      done: false,
    };
    listReminderItem.push(newReminder);
    showReminders();
    localStorageSave();
  }

  timeInput.disabled = true;
  addBtn.disabled = true;
  selectedVol.checked = false;
});
function showReminders() {
  listUL.innerHTML = "";

  listReminderItem.forEach((item) => {
    const li = document.createElement("li");

    // Verifica se o status é 'done' (verdadeiro)
    if (item.done) {
      // --- ESTADO CONCLUÍDO (DONE) ---
      li.classList.add("reminder-item", "done"); // Adiciona a classe .done do CSS

      li.innerHTML = `
        <div class="time-info">
            <i class="fa-solid fa-circle-check icon-check-done"></i>
            <div class="reminder-details">
                <span class="reminder-time">${item.hour}</span>
                <span class="reminder-vol">
                    <i class="fa-solid fa-droplet"></i> ${item.volume}
                </span>
            </div>
        </div>
        <span class="badge">Já bebi</span>
      `;
    } else {
      // --- ESTADO PENDENTE ---
      li.classList.add("reminder-item");

      li.innerHTML = `
        <div class="time-info">
            <i class="fa-regular fa-circle icon-check-pending"></i>
            <div class="reminder-details">
                <span class="reminder-time">${item.hour}</span>
                <span class="reminder-vol">
                    <i class="fa-solid fa-droplet"></i> ${item.volume}
                </span>
            </div>
        </div>
        <button class="check-btn" onclick="btnDone(${item.id})">Beber</button>
      `;
    }

    listUL.appendChild(li);
  });

  window.updateVolGoals(listReminderItem);
  console.log("Current Array State:", listReminderItem);
}
window.btnDone = function (id) {
  const index = listReminderItem.findIndex((item) => item.id === id);
  if (index !== -1) {
    const itemEncontrado = listReminderItem[index];
    itemEncontrado.done = true;
    showReminders();
    localStorageSave(); // Salva a alteração do status no localStorage - done
  }
};

function localStorageSave() {
  localStorage.setItem("myRemindersList", JSON.stringify(listReminderItem));
}

window.onload = function () {
  const data = localStorage.getItem("myRemindersList");

  const appData = window.getAppDateConfig();
  const today = appData.now.toLocaleDateString(appData.lang);
  if (data) {
    listReminderItem = JSON.parse(data);

    if (listReminderItem.length > 0) {
      const savedDate = listReminderItem[0].day;
      if (savedDate !== today) {
        console.log("Dia novo detectado! Limpando histórico anterior...");
        // Se o dia mudou, limpa o histórico
        listReminderItem = [];
        // salva o novo dia
        localStorageSave();
      }
    }
    showReminders();
  } else {
    listReminderItem = []; // Se não tiver nada, inicia vazio
  }
};
