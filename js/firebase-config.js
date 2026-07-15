<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCE8rQNqrSfHAC4ccpXbaXyts2nA_xm4Mc",
    authDomain: "travel-guide-0001.firebaseapp.com",
    projectId: "travel-guide-0001",
    storageBucket: "travel-guide-0001.firebasestorage.app",
    messagingSenderId: "510310143636",
    appId: "1:510310143636:web:7ea8886fc583e888628681",
    measurementId: "G-2C4SZKVP05"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
