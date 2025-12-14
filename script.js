let games = JSON.parse(localStorage.getItem("games")) || [];

document.addEventListener("DOMContentLoaded", () => {
  renderGames();
});

// FUNÇÃO CHAMADA PELO BOTÃO
function addGame() {
  const name = document.getElementById("gameName").value.trim();
  const time = document.getElementById("gameTime").value;
  const alertBefore = document.getElementById("alertBefore").value;

  if (!name || !time || alertBefore === "") {
    alert("Preencha todos os campos");
    return;
  }

  const game = {
    id: Date.now(),
    name,
    time,
    alertBefore: Number(alertBefore)
  };

  games.push(game);
  localStorage.setItem("games", JSON.stringify(games));

  renderGames();
  clearForm();
}

// LISTA OS JOGOS NA TELA
function renderGames() {
  const list = document.getElementById("gameList");
  list.innerHTML = "";

  if (games.length === 0) {
    list.innerHTML = "<li>Nenhum jogo cadastrado</li>";
    return;
  }

  games.forEach(game => {
    const li = document.createElement("li");

    const gameDate = new Date(game.time);
    const alertDate = new Date(
      gameDate.getTime() - game.alertBefore * 60000
    );

    li.innerHTML = `
      <div>
        <strong>${game.name}</strong><br>
        Jogo: ${gameDate.toLocaleString()}<br>
        Alerta: ${alertDate.toLocaleString()}
      </div>
      <button onclick="deleteGame(${game.id})">Excluir</button>
    `;

    list.appendChild(li);
  });
}

// REMOVE JOGO
function deleteGame(id) {
  games = games.filter(game => game.id !== id);
  localStorage.setItem("games", JSON.stringify(games));
  renderGames();
}

// LIMPA FORMULÁRIO
function clearForm() {
  document.getElementById("gameName").value = "";
  document.getElementById("gameTime").value = "";
  document.getElementById("alertBefore").value = "";
}
