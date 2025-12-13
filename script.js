const db = firebase.firestore();
const messaging = firebase.messaging();

const gameName = document.getElementById("gameName");
const gameTime = document.getElementById("gameTime");
const alertBefore = document.getElementById("alertBefore");
const gameList = document.getElementById("gameList");

// 🔔 REGISTRAR PUSH
async function registerPush() {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        alert("Permissão de notificação negada");
        return;
    }

    const token = await messaging.getToken({
        vapidKey: "SUA_VAPID_KEY_AQUI"
    });

    await db.collection("tokens").doc(token).set({
        token,
        createdAt: new Date()
    });

    console.log("Push registrado:", token);
}

registerPush();

// ➕ ADICIONAR JOGO
async function addGame() {
    if (!gameName.value || !gameTime.value || !alertBefore.value) {
        alert("Preencha todos os campos");
        return;
    }

    await db.collection("games").add({
        name: gameName.value,
        time: new Date(gameTime.value),
        alertBefore: Number(alertBefore.value),
        notified: false,
        createdAt: new Date()
    });

    gameName.value = "";
    gameTime.value = "";
    alertBefore.value = "";
}

// 📋 LISTAR JOGOS
db.collection("games")
  .orderBy("time")
  .onSnapshot(snapshot => {
      gameList.innerHTML = "";

      snapshot.forEach(doc => {
          const game = doc.data();

          const alertTime = new Date(
              game.time.toDate().getTime() - game.alertBefore * 60000
          );

          const li = document.createElement("li");
          li.innerHTML = `
            <div>
              <strong>${game.name}</strong><br>
              Jogo: ${game.time.toDate().toLocaleString()}<br>
              Alerta: ${alertTime.toLocaleString()}
            </div>
            <button onclick="deleteGame('${doc.id}')">Excluir</button>
          `;

          gameList.appendChild(li);
      });
  });

// ❌ EXCLUIR JOGO
async function deleteGame(id) {
    await db.collection("games").doc(id).delete();
}
