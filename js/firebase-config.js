// js/firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyCE8rQNqrSfHAC4ccpXbaXyts2nA_xm4Mc",
  authDomain: "travel-guide-0001.firebaseapp.com",
  projectId: "travel-guide-0001",
  storageBucket: "travel-guide-0001.firebasestorage.app",
  messagingSenderId: "510310143636",
  appId: "1:510310143636:web:7ea8886fc583e888628681",
  measurementId: "G-2C4SZKVP05"
};

// 1. 여기서 초기화
firebase.initializeApp(firebaseConfig);

// 2. 여기서 서비스 변수 생성
const db = firebase.firestore();
const auth = firebase.auth();
const analytics = firebase.analytics(); // 👈 여기서 바로 분석 도구도 추가 가능!

const firebaseEnabled = true;
console.log("🔥 Firebase 및 Analytics가 정상적으로 초기화되었습니다.");
