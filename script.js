let games = JSON.parse(localStorage.getItem("games")) || [];

// Permissão de notificação
if ("Notification" in window) {
    Notification.requestPermission();
}

// Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}

// ======================
// CADASTRAR JOGO
// ======================
function addGame() {
    const name = document.getElementById("gameName").value;
    const time = document.getElementById("gameTime").value;
    const alertBefore = parseInt(document.getElementById("alertBefore").value);
    const description = document.getElementById("gameDescription").value;

    if (!name || !time || isNaN(alertBefore)) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    const game = {
        id: Date.now(),
        name,
        time,
        alertBefore,
        description
    };

    games.push(game);
    localStorage.setItem("games", JSON.stringify(games));

    scheduleNotification(game);
    renderGames();

    document.getElementById("gameName").value = "";
    document.getElementById("gameTime").value = "";
    document.getElementById("alertBefore").value = "";
    document.getElementById("gameDescription").value = "";
}

// ======================
// RENDERIZAR JOGOS
// ======================
function renderGames() {
    const list = document.getElementById("gameList");
    list.innerHTML = "";

    games.forEach(game => {
        const li = document.createElement("li");

        const gameDate = new Date(game.time);
        const alertDate = new Date(gameDate.getTime() - game.alertBefore * 60000);

        li.innerHTML = `
            <div>
                <strong>${game.name}</strong><br>
                ${game.description ? `<em>${game.description}</em><br>` : ""}
                Jogo: ${gameDate.toLocaleString()}<br>
                Alerta: ${alertDate.toLocaleString()}<br>
                <span class="countdown" id="countdown-${game.id}"></span>
            </div>
            <button onclick="deleteGame(${game.id})">Excluir</button>
        `;

        list.appendChild(li);
        startCountdown(game);
    });
}

// ======================
// CONTADOR REGRESSIVO
// ======================
function startCountdown(game) {
    const el = document.getElementById(`countdown-${game.id}`);

    function update() {
        const now = Date.now();
        const gameTime = new Date(game.time).getTime();
        const diff = gameTime - now;

        if (diff <= 0) {
            el.innerHTML = "<strong>⏱️ EM ANDAMENTO</strong>";
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        el.innerHTML = `
            ⏳ Começa em: 
            ${String(hours).padStart(2, "0")}:
            ${String(minutes).padStart(2, "0")}:
            ${String(seconds).padStart(2, "0")}
        `;
    }

    update();
    setInterval(update, 1000);
}

// ======================
// EXCLUIR JOGO
// ======================
function deleteGame(id) {
    games = games.filter(game => game.id !== id);
    localStorage.setItem("games", JSON.stringify(games));
    renderGames();
}

// ======================
// AGENDAR NOTIFICAÇÃO
// ======================
function scheduleNotification(game) {
    const gameTime = new Date(game.time).getTime();
    const alertTime = gameTime - game.alertBefore * 60000;
    const delay = alertTime - Date.now();

    if (delay > 0) {
        setTimeout(() => {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification("⚽ Alerta de Jogo", {
                    body: `${game.name}\n${game.description || ""}\nComeça em ${game.alertBefore} minutos`,
                    icon: "icon-192.png",
                    vibrate: [200, 100, 200]
                });
            });
        }, delay);
    }
}

// ======================
// REAGENDAR AO RECARREGAR
// ======================
games.forEach(scheduleNotification);
renderGames();
