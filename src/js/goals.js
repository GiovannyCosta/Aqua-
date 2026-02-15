window.updateVolGoals = function (lista) {
  const ViwerListDone = lista.filter((item) => item.done);
  const totalDrank = ViwerListDone.reduce((total, item) => {
    return total + parseInt(item.volume);
  }, 0);
  console.log("Quantidade de lembretes concluidos:", ViwerListDone);
  console.log("Soma dos volumes concluidos:", totalDrank);

  const goals = [250, 500, 1000, 2000];

  // 3. Pegar as 4 li's do HTML
  const listItems = document.querySelectorAll(
    ".static-progress-list .static-item",
  );

  // 4. Para cada item da lista (metas), calcular a porcentagem
  listItems.forEach((li, index) => {
    const goalAmount = goals[index]; // 250, depois 500...

    // (Total Bebido * 100) / Meta
    let percentage = (totalDrank / goalAmount) * 100;

    // Trava em 100% para a barra não sair da tela
    if (percentage > 100) percentage = 100;

    // --- ATUALIZAÇÃO DO DOM (VISUAL) ---

    // Atualiza o texto (ex: 50%)
    const percentText = li.querySelector(".percent");
    percentText.innerText = Math.floor(percentage) + "%";

    // Atualiza a largura da barra colorida
    const barFill = li.querySelector(".bar-fill");
    barFill.style.width = percentage + "%";

    // Se completou (100%), deixa verde. Se não, azul padrão.
    if (percentage >= 100) {
      barFill.style.backgroundColor = "var(--item-checked)"; // Verde
    } else {
      barFill.style.backgroundColor = "var(--accent-blue)"; // Azul original
    }
  });
};
