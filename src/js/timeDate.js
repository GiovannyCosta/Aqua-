// função com retorno global
window.getAppDateConfig = function () {
  const now = new Date();
  const langConfig = navigator.language || "en-US";
  return {
    now: now,
    lang: langConfig,
  };
};

// 2. Funções de Visualização
function updateTimeDate(data) {
  // Recebe os dados prontos
  const dateEL = document.getElementById("current-date");
  const year = data.now.toLocaleDateString(data.lang, { year: "numeric" });
  const month = data.now.toLocaleDateString(data.lang, { month: "short" });
  const day = data.now.toLocaleDateString(data.lang, { day: "numeric" });
  const dayOfWeek = data.now.toLocaleDateString(data.lang, { weekday: "long" });

  dateEL.innerText = `${dayOfWeek}, ${day} ${month.replace(".", "")}, ${year} | `;
}

function updateTime(data) {
  // Recebe os dados prontos
  const timeEL = document.getElementById("current-time");
  const hours = data.now.toLocaleTimeString(data.lang, {
    hour: "2-digit",
    minute: "2-digit",
  });

  timeEL.innerText = `${hours}`;
}

// 3. Função Principal que roda a cada segundo
function updateAll() {
  // Pega os dados frescos usando nossa nova função global
  const config = window.getAppDateConfig();

  // Passa os dados para quem desenha na tela
  updateTimeDate(config);
  updateTime(config);
}

setInterval(updateAll, 1000);
