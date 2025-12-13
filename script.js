let games = JSON.parse(localStorage.getItem("games")) || [];

// Permissão de notificação
if ("Notification" in window) {
    Notification.requestPermission();
}

// Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}

function addGame() {
    const name = document.getElementById("gameName").value;
    const time = document.getElementById("gameTime").value;
    const alertBefore = parseInt(document.getElementById("alertBefore").value);

    if (!name || !time || isNaN(alertBefore)) {
        alert("Preencha todos os campos!");
        return;
    }

    const game = {
        id: Date.now(),
        name,
        time,
        alertBefore
    };

    games.push(game);
    localStorage.setItem("games", JSON.stringify(games));

    scheduleNotification(game);
    renderGames();

    document.getElementById("gameName").value = "";
    document.getElementById("gameTime").value = "";
    document.getElementById("alertBefore").value = "";
}

function renderGames() {
    const list = document.getElementById("gameList");
    list.innerHTML = "";

    games.forEach(game => {
        const li = document.createElement("li");

        const alertTime = new Date(
            new Date(game.time).getTime() - game.alertBefore * 60000
        );

        li.innerHTML = `
            <div>
                <strong>${game.name}</strong><br>
                Jogo: ${new Date(game.time).toLocaleString()}<br>
                Alerta: ${alertTime.toLocaleString()}
            </div>
            <button onclick="deleteGame(${game.id})">Excluir</button>
        `;

        list.appendChild(li);
    });
}

function deleteGame(id) {
    games = games.filter(game => game.id !== id);
    localStorage.setItem("games", JSON.stringify(games));
    renderGames();
}

function scheduleNotification(game) {
    const gameTime = new Date(game.time).getTime();
    const alertTime = gameTime - game.alertBefore * 60000;
    const now = Date.now();
    const delay = alertTime - now;

    if (delay > 0) {
        setTimeout(() => {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification("⚽ Alerta de Jogo", {
                    body: `${game.name} começa em ${game.alertBefore} minutos`,
                    icon: "https://cdn-icons-png.flaticon.com/512/53/53283.png",
                    vibrate: [200, 100, 200]
                });
            });
        }, delay);
    }
}

// Reagenda todos ao recarregar
games.forEach(scheduleNotification);
renderGames();
