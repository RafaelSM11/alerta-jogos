let games = JSON.parse(localStorage.getItem("games")) || [];

// ============================
// PEDIR PERMISSÃO NO CLIQUE
// ============================
async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("Seu navegador não suporta notificações.");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
}

// ============================
// CADASTRAR JOGO
// ============================
async function addGame() {
    const name = document.getElementById("gameName").value;
    const time = document.getElementById("gameTime").value;
    const alertBefore = parseInt(document.getElementById("alertBefore").value);

    if (!name || !time || isNaN(alertBefore)) {
        alert("Preencha todos os campos!");
        return;
    }

    const allowed = await requestNotificationPermission();
    if (!allowed) {
        alert("Permissão de notificação negada.");
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

// ============================
// AGENDAR NOTIFICAÇÃO
// ============================
function scheduleNotification(game) {
    const gameTime = new Date(game.time).getTime();
    const alertTime = gameTime - game.alertBefore * 60000;
    const now = Date.now();
    const delay = alertTime - now;

    if (delay <= 0) {
        console.warn("Horário de alerta já passou.");
        return;
    }

    setTimeout(() => {
        new Notification("⚽ Alerta de Jogo", {
            body: `${game.name} começa em ${game.alertBefore} minutos`,
            icon: "icon-192.png"
        });
    }, delay);
}

// ============================
// RENDERIZAR LISTA
// ============================
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

// ============================
// EXCLUIR JOGO
// ============================
function deleteGame(id) {
    games = games.filter(game => game.id !== id);
    localStorage.setItem("games", JSON.stringify(games));
    renderGames();
}

// ============================
// REAGENDAR AO RECARREGAR
// ============================
games.forEach(scheduleNotification);
renderGames();
