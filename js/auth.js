// ====================================================
// 사용자 인증 및 권한 관리 (js/auth.js - 전체 통합본)
// ====================================================

let currentUser = null;
let userRole = "user";

document.addEventListener("DOMContentLoaded", () => {
  // Firebase가 초기화되었는지 확인
  if (typeof firebase === 'undefined' || !firebase.auth) {
    console.warn("Firebase가 활성화되지 않았습니다. 로컬 모드로 작동합니다.");
    updateAuthUI(null);
    return;
  }

  // 실시간 로그인 상태 감지
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
    
    // 로드 함수들이 정의되어 있다면 실행
    if (typeof loadExpenses === "function") loadExpenses();
    if (typeof loadReviews === "function") loadReviews();
  });
});

// UI 업데이트
function updateAuthUI(user) {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInfo = document.getElementById("userInfo");
  const adminBadge = document.getElementById("adminBadge");

  if (user) {
    if (loginBtn) loginBtn.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.remove("hidden");
    if (userInfo) {
      userInfo.innerHTML = `👤 ${user.email.split('@')[0]}님`;
      userInfo.classList.remove("hidden");
    }
    if (adminBadge) {
      adminBadge.style.display = (userRole === "admin") ? "inline-block" : "none";
    }
  } else {
    if (loginBtn) loginBtn.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    if (userInfo) userInfo.classList.add("hidden");
    if (adminBadge) adminBadge.style.display = "none";
  }
}

// 로그인
async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    closeLoginModal();
    alert("로그인 성공!");
  } catch (error) {
    alert("로그인 실패: " + error.message);
  }
}

// 회원가입
async function signUp() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    closeLoginModal();
    alert("회원가입 성공!");
  } catch (error) {
    alert("회원가입 실패: " + error.message);
  }
}

// 로그아웃
async function logout() {
  try {
    await firebase.auth().signOut();
    alert("로그아웃 되었습니다.");
  } catch (err) {
    console.error("로그아웃 실패:", err);
  }
}

// 모달 제어
function openLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.remove("hidden");
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.add("hidden");
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
}
