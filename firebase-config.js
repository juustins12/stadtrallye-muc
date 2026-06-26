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
  apiKey: "AIzaSyA1PjC52pEKm_MY-VHnHWYuxLUkd1mTgg0",
  authDomain: "stadtrally-muc-26.firebaseapp.com",
  databaseURL: "https://stadtrally-muc-26-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "stadtrally-muc-26",
  storageBucket: "stadtrally-muc-26.firebasestorage.app",
  messagingSenderId: "1056065329207",
  appId: "1:1056065329207:web:db3dabd348b0c33ff7c7b2"
};

/* Zugangscode für die Operator-Ansicht (operator.html).
   Einfacher Schutz, damit nicht jede:r das Dashboard öffnet.
   Frei wählbar – teile ihn nur dem Orga-Team mit. */
const OPERATOR_CODE = "muc2026";
