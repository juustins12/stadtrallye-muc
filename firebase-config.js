/* ============================================================
   FIREBASE-KONFIGURATION
   ------------------------------------------------------------
   Ersetze die Platzhalter unten durch die Werte aus deinem
   eigenen Firebase-Projekt (Projekt-Einstellungen → "Meine Apps"
   → Web-App → SDK-Konfiguration). Diese Werte sind öffentlich
   und dürfen im Code stehen.

   WICHTIG: Du musst im Firebase-Projekt die "Realtime Database"
   aktivieren (nicht Firestore). Dann erscheint hier auch die
   "databaseURL".
   ============================================================ */
const FIREBASE_CONFIG = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJEKT.firebaseapp.com",
  databaseURL: "https://DEIN_PROJEKT-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "DEIN_PROJEKT",
  storageBucket: "DEIN_PROJEKT.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxx"
};

/* Zugangscode für die Operator-Ansicht (operator.html).
   Einfacher Schutz, damit nicht jede:r das Dashboard öffnet.
   Frei wählbar – teile ihn nur dem Orga-Team mit. */
const OPERATOR_CODE = "muc2026";
