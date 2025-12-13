// ================================
// FIREBASE IMPORTS (CDN MODULE)
// ================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ================================
// FIREBASE CONFIG
// ================================
const firebaseConfig = {
  apiKey: "AIzaSyDDpPMU4VPe2La1KRUBSlpCivxOZNn8io0",
  authDomain: "alerta-jogos.firebaseapp.com",
  projectId: "alerta-jogos",
  storageBucket: "alerta-jogos.appspot.com",
  messagingSenderId: "944894322098",
  appId: "1:944894322098:web:e8c3a91f2e5525e1a370ab"
};

// ================================
// INIT FIREBASE
// ================================
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const db = getFirestore(app);

// ================================
// REGISTER SERVICE WORKER (MANUAL)
// ================================
let swRegistration = null;

if ("serviceWorker" in navigator) {
  swRegistration = await navigator.serviceWorker.register(
    "/alerta-jogos/firebase-messaging-sw.js"
  );
  console.log("Service Worker registrado");
}

// ================================
// REQUEST NOTIFICATION PERMISSION
// ================================
const permission = await Notification.requestPermission();

if (permission === "granted") {
  const token = await getToken(messaging, {
    vapidKey: "BMaZ5ha0mJCVoCwz1ca-nHws4kzH9jKDK3WrmlfDgyNA0ln6zMIZFEdQqI990ninnT9BUY4R3CAv2VpQJa9cn-o",
    serviceWorkerRegistration: swRegistration
  });

  if (token) {
    console.log("Push registrado:", token);

    // Salva token no Firestore
    await addDoc(collection(db, "tokens"), {
      token,
      createdAt: new Date()
    });
  }
} else {
  alert("Permissão de notificações negada");
}

// ================================
// NOTIFICATION FOREGROUND
// ================================
onMessage(messaging, payload => {
  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/alerta-jogos/icon-192.png"
  });
});

// ================================
// JOGOS (LOCAL STORAGE)
// ================================
let games = JSON.parse(localStorage.getItem("games")) || [];

window.addGame = function () {
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

  renderGames();

  document.getElementById("gameName").value = "";
  document.getElementById("gameTime").value = "";
  document.getElementById("alertBefore").value = "";
};

// ================================
// RENDER LISTA
// ================================
function renderGames() {
  const list = document.getElementById("gameList");
  list.innerHTML = "";

  games.forEach(game => {
    const alertTime = new Date(
      new Date(game.time).getTime() - game.alertBefore * 60000
    );

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${game.name}</strong><br>
      Jogo: ${new Date(game.time).toLocaleString()}<br>
      Alerta: ${alertTime.toLocaleString()}
      <br>
      <button onclick="deleteGame(${game.id})">Excluir</button>
    `;

    list.appendChild(li);
  });
}

// ================================
// DELETE JOGO
// ================================
window.deleteGame = function (id) {
  games = games.filter(game => game.id !== id);
  localStorage.setItem("games", JSON.stringify(games));
  renderGames();
};

// ================================
renderGames();

