const popupNotif = document.querySelector(".notfi-cookie");
const btnAccept = document.querySelector(".acceptButton");
const btnDecline = document.querySelector(".declineButton");

if ("Notification" in window && Notification.permission === "default" && localStorage.getItem("hideNotifPopup") !== "true") {
  popupNotif.hidden = false;
}

function closePopup() {
  popupNotif.classList.add("closing");
  setTimeout(() => { popupNotif.hidden = true; popupNotif.classList.remove("closing"); }, 250);
}

btnAccept?.addEventListener("click", async () => {
  if ("Notification" in window) await Notification.requestPermission();
  closePopup();
});
btnDecline?.addEventListener("click", () => {
  localStorage.setItem("hideNotifPopup", "true");
  closePopup();
});

setInterval(() => {
  const currentTime = new Date().toTimeString().slice(0, 5);
  const reminders = window.aquaReminders?.get() || [];
  reminders.filter((item) => item.hour === currentTime && !item.done && !item.notified).forEach((reminder) => {
    reminder.notified = true;
    new Audio("./src/sounds/ring-alarm.mp3").play().catch(() => {});
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("Aqua+ · Hora de beber água", {
        tag: `aqua-${reminder.id}`,
        body: `${reminder.volume} ml programados para ${reminder.hour}.`,
        icon: "./src/public/mascot.png",
      });
      notification.onclick = () => window.focus();
    }
  });
}, 10000);
