importScripts("https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDDpPMU4VPe2La1KRUBSlpCivxOZNn8io0",
  authDomain: "alerta-jogos.firebaseapp.com",
  projectId: "alerta-jogos",
  storageBucket: "alerta-jogos.appspot.com",
  messagingSenderId: "944894322098",
  appId: "1:944894322098:web:e8c3a91f2e5525e1a370ab"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/alerta-jogos/icon-192.png"
  });
});
