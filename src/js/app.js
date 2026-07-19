const suggestions = {
  workout: { volume: 400, offset: 30 },
  meal: { volume: 300, offset: 60 },
};

document.querySelectorAll(".context-card").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".context-card").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    if (button.dataset.mode === "aqua") window.aquaReminders?.showMode("aqua");
    else if (button.dataset.mode === "workout") window.aquaReminders?.showMode("workout");
    else if (button.dataset.mode === "daily") window.aquaReminders?.showMode("daily");
    else window.aquaReminders?.applySuggestion(suggestions[button.dataset.mode]);
  });
});

const dialog = document.getElementById("usage-guide");
const openGuide = () => dialog.showModal();
["open-guide", "open-guide-top", "open-guide-footer"].forEach((id) => document.getElementById(id)?.addEventListener("click", openGuide));
dialog.querySelectorAll(".dialog-close, .dialog-ok").forEach((button) => button.addEventListener("click", () => dialog.close()));
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

document.getElementById("notification-help")?.addEventListener("click", () => { document.querySelector(".notfi-cookie").hidden = false; });
