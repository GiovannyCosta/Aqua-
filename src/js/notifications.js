// --- CONTROLE DO POP-UP DE NOTIFICAÇÕES ---
const popupNotif = document.querySelector(".notfi-cookie");
const btnAccept = document.querySelector(".acceptButton");
const btnDecline = document.querySelector(".declineButton");

if ("Notification" in window) {
  // Se a permissão for "default"
  // E se ele não tiver clicado em "Recusar" no nosso pop-up anteriormente
  if (Notification.permission === "default" && localStorage.getItem("hideNotifPopup") !== "true") {
    popupNotif.style.display = "flex"; // Mostra o pop-up
  }
}

btnAccept.addEventListener("click", () => {
  // Dispara o pedido oficial do Windows APENAS APÓS O CLIQUE (ACEITAR)
  Notification.requestPermission().then((permission) => {
    fecharPopUp();
  });
});

btnDecline.addEventListener("click", () => {
  // Salva a escolha do usuário de recusar as notificações para não mostrar o pop-up novamente
  // Grava no localStorage
  // TO DO: Criar o botão de "Configurações" para o usuário poder reativar as notificações caso queira
  localStorage.setItem("hideNotifPopup", "true");
  fecharPopUp();
});

function fecharPopUp() {
  popupNotif.style.opacity = "0"; // Inicia animação de desaparecer
  setTimeout(() => {
    popupNotif.style.display = "none"; // Esconde de vez após a animação
  }, 300); // Tempo igual ao da animação transition no CSS
}
// --- FIM DO CONTROLE DO POP-UP ---

// --- ALARME E VERIFICAÇÃO DE HORA ---

// Set para armazenar os IDs dos lembretes notificados
const lembretesNotificados = new Set();

setInterval(() => {
  // Usa a função global do timeDate.js para ter a hora exata
  const config = window.getAppDateConfig();
  const now = config.now;

  const hour = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${hour}:${minutes}`;

  // Pega os lembretes do localStorage
  const data = localStorage.getItem("myRemindersList");

  if (!data) return; // Se não tiver nada, sai

  // Transforma a string de volta em array de objetos
  const reminders = JSON.parse(data);

  reminders.forEach((reminder) => {
    // Verifica se a hora bate, se ainda não foi bebido e se ainda não tocou neste minuto
    if (reminder.hour === currentTime && !reminder.done && !lembretesNotificados.has(reminder.id)) {
      // Envia a notificação
      activateNotification(reminder);
      lembretesNotificados.add(reminder.id); // Marca como notificado para não repetir
    }
  });

  // Limpa o histórico de notificações daquele dia à meia-noite
  if (currentTime === "00:00") {
    lembretesNotificados.clear();
  }
}, 1000);

// --- FUNÇÃO DE DISPARO DO ALARME ---
function activateNotification(reminder) {
  // Toca o áudio primeiro (funciona mesmo se a notificação nativa for negada no windows)
  const alarm = new Audio("./src/sounds/keypad-sound-water.mp3"); // Verifique se tem este áudio na pasta

  // Toca o áudio e captura erros caso o navegador bloqueie por falta de interação do usuário
  alarm.play().catch((e) => console.log("Áudio bloqueado pelo navegador até haver interação", e));

  // Exibe a notificação visual do sistema operativo (se o usuário tiver permitido)
  if (Notification.permission === "granted") {
    const notf = new Notification("Aqua+ | Hora de H2O!", {
      tag: "water-reminder",
      body: `Você tem um lembrete para beber ${reminder.volume} às ${reminder.hour}.`,
      icon: "./src/public/mascot.png",
    });

    // Foca na aba do aplicativo se o usuário clicar na notificação
    notf.onclick = () => {
      window.focus();
    };
  }
}
