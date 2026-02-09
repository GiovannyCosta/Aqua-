const addBtn = document.querySelector("#add-reminder-btn");
const timeInput = document.querySelector("#new-reminder-time");

addBtn.addEventListener("click", () => {
  // Adiciona a classe de animação
  timeInput.classList.add("animate-bell");

  // Remove a classe após a animação terminar (0.6s) para poder repetir depois
  setTimeout(() => {
    timeInput.classList.remove("animate-bell");
  }, 600);

  function selectVolume(btn) {
    // 1. Remove seleção de todos
    document
      .querySelectorAll(".vol-btn")
      .forEach((b) => b.classList.remove("selected"));

    // 2. Seleciona o clicado
    btn.classList.add("selected");

    // 3. Desbloqueia os inputs
    document.getElementById("new-reminder-time").disabled = false;
    document.getElementById("add-reminder-btn").disabled = false;

    // 4. Foca no input de tempo
    document.getElementById("new-reminder-time").focus();
  }
});

function playWaterSound() {
  const audio = new Audio("src/sounds/water-droplet.mp3");
  audio.play();
}

/**
 * Play the sound of water droplets when a volume button is selected.
 */
function selectVolume() {
  const audio = new Audio("src/sounds/keypad-sound-water.mp3");
  audio.play();
}
