// ====================================================
// 사용자 인증 및 권한 관리 (수정된 js/auth.js)
// ====================================================

let currentUser = null;
let userRole = "user";

document.addEventListener("DOMContentLoaded", () => {
  // firebaseEnabled가 true인지 확인 (firebase-config.js에서 설정됨)
  if (typeof firebaseEnabled === 'undefined' || !firebaseEnabled) {
    console.warn("Firebase가 활성화되지 않았습니다. 로컬 모드로 작동합니다.");
    updateAuthUI(null);
    return;
  }

  // firebase.auth()를 직접 사용
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      try {
        const userDoc = await firebase.firestore().collection("users").doc(user.uid).get();
        if (userDoc.exists) {
          userRole = userDoc.data().role || "user";
        } else {
          await firebase.firestore().collection("users").doc(user.uid).set({
            email: user.email,
            role: "user",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          userRole = "user";
        }
      } catch (err) {
        console.error("유저 정보 로드 실패:", err);
      }
      updateAuthUI(user);
    } else {
      currentUser = null;
      userRole = "user";
      updateAuthUI(null);
    }
    if (typeof loadExpenses === "function") loadExpenses();
    if (typeof loadReviews === "function") loadReviews();
  });
});

// 로그인 처리
async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password); // 변경됨
    closeLoginModal();
    alert("로그인 성공!");
  } catch (error) {
    alert("로그인 실패: " + error.message);
  }
}

// 회원가입 처리
async function signUp() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password); // 변경됨
    closeLoginModal();
    alert("회원가입 성공!");
  } catch (error) {
    alert("회원가입 실패: " + error.message);
  }
}

// 로그아웃
async function logout() {
  try {
    await firebase.auth().signOut(); // 변경됨
    alert("로그아웃 되었습니다.");
  } catch (err) {
    console.error("로그아웃 실패:", err);
  }
}

// UI 업데이트 및 모달 제어는 그대로 유지...
// (아래는 기존과 동일하게 유지하시면 됩니다)
function updateAuthUI(user) { /* 기존과 동일 */ }
function openLoginModal() { document.getElementById("loginModal").classList.remove("hidden"); }
function closeLoginModal() { document.getElementById("loginModal").classList.add("hidden"); }
