window.updateVolGoals = function (lista) {
  // Filtra apenas os lembretes que já foram bebidos (done: true)
  const ViwerListDone = lista.filter((item) => item.done);

  // Calcula o Total Geral Bebido no dia
  const totalDrank = ViwerListDone.reduce((total, item) => {
    return total + parseInt(item.volume);
  }, 0);

  // Acumuladores Cumulativos (Escalonados) POR TURNO
  // A água bebida na manhã conta para a tarde, e a da tarde para a noite.
  let totalManha = 0; // Bebido antes das 12h
  let totalTarde = 0; // Bebido antes das 18h (inclui manhã)
  let totalNoite = 0; // Bebido antes das 24h (inclui manhã e tarde)

  ViwerListDone.forEach((item) => {
    // Pega a hora do lembrete (Ex: "08:30" vira 8)
    // split = separa as partes da string pelo ":" e pega a primeira parte
    const hour = parseInt(item.hour.split(":")[0]);
    const vol = parseInt(item.volume);

    // O valor ingerido "desce" para os próximos turnos
    // Manhã: 0h - 11h59min
    // Tarde: 12h - 17h59min
    // Noite: 18h - 23h59min
    if (hour >= 0 && hour < 12) {
      totalManha += vol;
      totalTarde += vol;
      totalNoite += vol;
    } else if (hour >= 12 && hour < 18) {
      totalTarde += vol;
      totalNoite += vol;
    } else {
      totalNoite += vol;
    }
  });

  console.log("Total Geral Bebido:", totalDrank);
  console.log(`Cumulativo -> Manhã: ${totalManha} | Tarde: ${totalTarde} | Noite: ${totalNoite}`);

  // PARTE A: ATUALIZAR METAS GERAIS DE VOLUME
  const volumeGoals = [250, 500, 1000, 2000];

  // Pega todos os itens somente da PRIMEIRA lista do HTML
  const volumeItems = document.querySelectorAll(".static-progress-list")[0].querySelectorAll(".static-item");

  if (volumeItems.length > 0) {
    volumeItems.forEach((li, index) => {
      const goalAmount = volumeGoals[index];
      let percentage = (totalDrank / goalAmount) * 100;

      // Trava em 100% para a barra não sair da tela
      if (percentage > 100) percentage = 100;

      const percentText = li.querySelector(".percent");
      if (percentText) percentText.innerText = Math.floor(percentage) + "%";

      const barFill = li.querySelector(".bar-fill");
      if (barFill) {
        barFill.style.width = percentage + "%";
        // Se completou (100%), deixa verde. Se não, azul padrão.
        barFill.style.backgroundColor = percentage >= 100 ? "var(--item-checked)" : "var(--accent-blue)";
      }
    });
  }

  // PARTE B: ATUALIZAR METAS DOS TURNOS DO DIA
  // Pega a hora atual do sistema para saber se o turno já encerrou
  const appData = window.getAppDateConfig();
  const currentHour = appData.now.getHours();

  // Metas estipuladas para cada turno
  const shiftGoals = [500, 1000, 2000];
  const shiftDrank = [totalManha, totalTarde, totalNoite];

  // Horário limite (fim) de cada turno
  const shiftEndHours = [12, 18, 24];
  const shiftStartHours = [0, 12, 18];

  // Pega todos os itens da SEGUNDA lista do HTML
  const shiftItems = document.querySelectorAll(".static-progress-list")[1].querySelectorAll(".static-item");

  if (shiftItems.length > 0) {
    shiftItems.forEach((li, index) => {
      const goalAmount = shiftGoals[index];
      const drankAmount = shiftDrank[index]; // Quanto bebeu acumulado até este turno
      const endHour = shiftEndHours[index]; // Hora que o turno acaba
      const startHour = shiftStartHours[index]; // Hora que o turno começa
      let percentage = 0;
      if (currentHour >= startHour) {
        percentage = (drankAmount / goalAmount) * 100;
      }
      // Trava em 100% para a barra não sair da tela
      if (percentage > 100) percentage = 100;

      const percentText = li.querySelector(".percent");
      if (percentText) percentText.innerText = Math.floor(percentage) + "%";

      const barFill = li.querySelector(".bar-fill");
      if (barFill) {
        barFill.style.width = percentage + "%";

        // Lógica de Cores Inteligente
        if (percentage >= 100) {
          barFill.style.backgroundColor = "var(--item-checked)"; // Verde: completou a meta do turno
        } else if (currentHour >= endHour) {
          barFill.style.backgroundColor = "var(--item-pending)"; // Vermelho: tempo esgotou e não completou
        } else {
          barFill.style.backgroundColor = "var(--accent-blue)"; // Azul: turno ainda está rolando
        }
      }
    });
  }
};
