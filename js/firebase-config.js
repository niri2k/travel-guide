// ====================================================
// Firebase 설정 및 초기화 (js/firebase-config.js)
// ====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";

const firebaseConfig = {
  // 1. 발급받은 API KEY를 여기에 입력하세요
  apiKey: "AIzaSyCE8rQNqrSfHAC4ccpXbaXyts2nA_xm4Mc", 
  
  // 2. 이 값들은 Firebase 프로젝트 설정 페이지에서 그대로 복사하시면 됩니다
    authDomain: "travel-guide-0001.firebaseapp.com",
    projectId: "travel-guide-0001",
    storageBucket: "travel-guide-0001.firebasestorage.app",
    messagingSenderId: "510310143636",
    appId: "1:510310143636:web:7ea8886fc583e888628681",
    measurementId: "G-2C4SZKVP05"

};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



let db = null;
let auth = null;
let firebaseEnabled = false;

// 설정값이 기본값이 아닐 때만 Firebase 작동
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    // Firebase SDK v9.x Compat 방식 초기화
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
