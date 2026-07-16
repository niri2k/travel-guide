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

firebase.firestore().enablePersistence()
  .then(() => {
      console.log("Firestore 오프라인 캐싱 활성화 성공!");
  })
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          // 여러 개의 탭이 동시에 열려 있을 때 발생하는 경고 (동작에는 지장 없음)
          console.warn("다중 탭 오픈으로 인해 캐싱은 하나의 탭에서만 활성화됩니다.");
      } else if (err.code == 'unimplemented') {
          // 브라우저가 캐싱 기능을 지원하지 않는 경우
          console.error("현재 브라우저는 오프라인 캐싱을 지원하지 않습니다.");
      }
  });
