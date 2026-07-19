window.updateVolGoals = function (items) {
  const completed = items.filter((item) => item.done);
  const total = completed.reduce((sum, item) => sum + Number(item.volume), 0);
  const volumeGoals = [250, 500, 1000, 2000];
  const lists = document.querySelectorAll(".static-progress-list");

  lists[0]?.querySelectorAll(".static-item").forEach((item, index) => {
    updateBar(item, total, volumeGoals[index]);
  });

  const shiftAmounts = [0, 0, 0];
  completed.forEach((item) => {
    const hour = Number(item.hour.split(":")[0]);
    shiftAmounts[hour < 12 ? 0 : hour < 18 ? 1 : 2] += Number(item.volume);
  });
  const shiftGoals = [500, 500, 1000];
  lists[1]?.querySelectorAll(".static-item").forEach((item, index) => {
    updateBar(item, shiftAmounts[index], shiftGoals[index]);
    const label = item.querySelector(".shift-amount");
    if (label) label.textContent = `${shiftAmounts[index]} / ${shiftGoals[index]} ml`;
  });
};

function updateBar(item, amount, goal) {
  const percentage = Math.min(amount / goal * 100, 100);
  item.querySelector(".percent").textContent = `${Math.floor(percentage)}%`;
  const fill = item.querySelector(".bar-fill");
  fill.style.width = `${percentage}%`;
  fill.style.backgroundColor = percentage >= 100 ? "var(--item-checked)" : "var(--accent-blue)";
}
