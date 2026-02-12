function updateTimeDate(now, langConfig) {
  const dateEL = document.getElementById("current-date");
  const year = now.toLocaleDateString(langConfig, { year: "numeric" });
  const month = now.toLocaleDateString(langConfig, { month: "short" });
  const day = now.toLocaleDateString(langConfig, { day: "numeric" });
  const dayOfWeek = now.toLocaleDateString(langConfig, { weekday: "long" });

  dateEL.innerText = `${dayOfWeek}, ${day} ${month.replace(".", "")}, ${year} | `;
}

function updateTime(now, langConfig) {
  const timeEL = document.getElementById("current-time");
  const hours = now.toLocaleTimeString(langConfig, {
    hour: "2-digit",
    minute: "2-digit",
  });

  timeEL.innerText = `${hours}`;
}

function updateAll() {
  const now = new Date();
  const langConfig = navigator.language || "en-US";
  updateTimeDate(now, langConfig);
  updateTime(now, langConfig);
}

setInterval(updateAll, 1000);
