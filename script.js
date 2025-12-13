let games = JSON.parse(localStorage.getItem("games")) || [];

// Permissão de notificação
if ("Notification" in window) {
    Notification.requestPermission();
}

// Registrar Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then(() => {
        console.log("Service Worker registrado");
    });
}

function addGame() {
    const name = gameName.value;
    const time = gameTime.value;
    const alertBefore = parseInt(alertBefore.value);

    if (!name || !time || isNaN(alertBefore)) {
        alert("Preencha todos os campos");
        return;
    }

    const game = {
        id: Date.now(),
        name,
        time,
        alertBefore,
        notified: false
    };

    games.push(game);
    localStorage.setItem("games", JSON.stringify(games));
    renderGames();
}

function renderGames() {
    gameList.innerHTML = "";

    games.forEach(game => {
        const alertTime = new Date(
            new Date(game.time).getTime() - game.alertBefore * 60000
        );

        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${game.name}</strong><br>
                Jogo: ${new Date(game.time).toLocaleString()}<br>
                Alerta: ${alertTime.toLocaleString()}
            </div>
            <button onclick="deleteGame(${game.id})">Excluir</button>
        `;
        gameList.appendChild(li);
    });
}

function deleteGame(id) {
    games = games.filter(g => g.id !== id);
    localStorage.setItem("games", JSON.stringify(games));
    renderGames();
}

// Recebe mensagem do Service Worker
navigator.serviceWorker.addEventListener("message", event => {
    if (event.data === "CHECK_GAMES") {
        checkAlerts();
    }
});

function checkAlerts() {
    const now = Date.now();
    let updated = false;

    games.forEach(game => {
        const alertTime =
            new Date(game.time).getTime() - game.alertBefore * 60000;

        if (!game.notified && now >= alertTime) {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification("⚽ Alerta de Jogo", {
                    body: game.name,
                    icon: "icon-192.png"
                });
            });

            game.notified = true;
            updated = true;
        }
    });

    if (updated) {
        localStorage.setItem("games", JSON.stringify(games));
    }
}

renderGames();
