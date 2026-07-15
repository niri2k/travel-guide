// ====================================================
// Firebase 설정 및 초기화 (js/firebase-config.js)
// ====================================================

// TODO: Firebase 콘솔에서 복사한 본인의 설정값으로 대체하세요!
<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAXdkg4PC2-8kCri4TTmxR1RK-PyD1d_7U",
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


let db = null;
let auth = null;
let firebaseEnabled = false;

// 설정값이 기본값이 아닐 때만 Firebase 작동 (로컬 테스트 및 배포 안정성 확보)
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    firebaseEnabled = true;
    console.log("🔥 Firebase가 정상적으로 초기화되었습니다.");
  } catch (error) {
    console.error("❌ Firebase 초기화 실패:", error);
  }
} else {
  console.warn("⚠️ Firebase 설정이 비어있습니다. 로컬 스토리지(오프라인) 모드로 작동합니다.");
}
