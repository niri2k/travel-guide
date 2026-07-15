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

 브라우저를 새로고침한 후 [다시 로그인] 하세요.

다시 로그인하는 순간 콘솔에 현재 권한: admin이라고 찍히는지 확인하세요.

2. Firestore 데이터 확인 (중요)
혹시 Firestore에 문서가 여러 개 생겨있지는 않은지 확인해 보세요.

[Firebase 콘솔] -> [Firestore Database] -> users 컬렉션으로 들어갑니다.

문서 ID가 현재 로그인한 계정의 UID와 정확히 일치하는지 확인하세요. (가끔 잘못된 문서 ID의 role을 수정하고, 정작 로그인한 계정은 다른 문서 ID를 읽고 있을 수 있습니다.)

3. 강제 코드 업데이트 (디버깅용)
만약 로그아웃/로그인을 다시 해도 계속 user라고 뜬다면, 아래 코드로 auth.js의 onAuthStateChanged 함수 내부를 살짝 바꿔서 강제로 Firestore를 다시 긁어오게 해봅시다.

JavaScript
// auth.js의 onAuthStateChanged 함수 내부를 수정
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    try {
      // 👈 캐시를 무시하고 서버에서 최신 데이터를 가져오도록 get({source: 'server'}) 옵션 추가
      const userDoc = await firebase.firestore().collection("users").doc(user.uid).get({source: 'server'});
      
      if (userDoc.exists) {
        userRole = userDoc.data().role || "user";
        console.log("서버에서 불러온 권한:", userRole); // 👈 로그 확인
      } else {
        // ... (이하 동일)
      }
    } catch (err) {
      console.error("유저 정보 로드 실패:", err);
      userRole = "user";
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



// auth.js의 updateAuthUI 함수 바로 위에 추가
console.log("현재 로그인한 유저의 권한(userRole):", userRole);


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
// js/auth.js 내 login 함수를 이렇게 교체하세요
async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  
  console.log("로그인 시도:", email); // 로그 확인용

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    closeLoginModal();
    alert("로그인 성공!");
  } catch (error) {
    // 상세 에러 객체 전체를 콘솔에 출력합니다.
    console.error("=== 상세 에러 정보 시작 ===");
    console.dir(error); 
    console.error("에러 코드:", error.code);
    console.error("에러 메시지:", error.message);
    console.error("=== 상세 에러 정보 끝 ===");
    
    alert("로그인 실패: " + error.code + "\n" + error.message);
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
