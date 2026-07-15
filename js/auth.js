// ====================================================
// 사용자 인증 및 권한 관리 (js/auth.js)
// ====================================================

let currentUser = null;
let userRole = "user"; // 기본 권한: 일반 사용자 ('user' | 'admin')

document.addEventListener("DOMContentLoaded", () => {
  if (!firebaseEnabled) {
    updateAuthUI(null);
    return;
  }

  // 실시간 로그인 상태 감지
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      // Firestore에서 유저 권한(Role) 확인
      try {
        const userDoc = await db.collection("users").doc(user.uid).get();
        if (userDoc.exists) {
          userRole = userDoc.data().role || "user";
        } else {
          // 신규 유저 등록 (기본 권한: user)
          await db.collection("users").doc(user.uid).set({
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
    
    // 상태 변경 시 비용 및 후기 다시 로드
    if (typeof loadExpenses === "function") loadExpenses();
    if (typeof loadReviews === "function") loadReviews();
  });
});

// 로그인 상태에 따른 UI 업데이트
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
      if (userRole === "admin") {
        adminBadge.classList.remove("hidden");
      } else {
        adminBadge.classList.add("hidden");
      }
    }
  } else {
    if (loginBtn) loginBtn.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    if (userInfo) userInfo.classList.add("hidden");
    if (adminBadge) adminBadge.classList.add("hidden");
  }
}

// 이메일 로그인 처리
async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("이메일과 비밀번호를 입력해주세요.");
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
    closeLoginModal();
    alert("로그인 성공! 클라우드 동기화가 활성화되었습니다.");
  } catch (error) {
    console.error("로그인 실패:", error);
    alert("로그인 실패: " + getFriendlyErrorMessage(error.code));
  }
}

// 회원가입 처리 (Option B 전환 대비)
async function signUp() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("이메일과 비밀번호를 입력해주세요.");
    return;
  }

  if (password.length < 6) {
    alert("비밀번호는 최소 6자리 이상이어야 합니다.");
    return;
  }

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    closeLoginModal();
    alert("회원가입 성공! 환영합니다.");
  } catch (error) {
    console.error("회원가입 실패:", error);
    alert("회원가입 실패: " + getFriendlyErrorMessage(error.code));
  }
}

// 로그아웃
async function logout() {
  if (confirm("로그아웃 하시겠습니까? 로컬 모드로 전환됩니다.")) {
    try {
      await auth.signOut();
      alert("로그아웃 되었습니다.");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  }
}

// 모달 제어
function openLoginModal() {
  document.getElementById("loginModal").classList.remove("hidden");
}

function closeLoginModal() {
  document.getElementById("loginModal").classList.add("hidden");
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
}

// 친절한 에러 메시지 번역
function getFriendlyErrorMessage(code) {
  switch (code) {
    case "auth/invalid-email": return "유효하지 않은 이메일 형식입니다.";
    case "auth/user-disabled": return "비활성화된 계정입니다.";
    case "auth/user-not-found": return "존재하지 않는 회원 계정입니다.";
    case "auth/wrong-password": return "비밀번호가 일치하지 않습니다.";
    case "auth/email-already-in-use": return "이미 사용 중인 이메일 주소입니다.";
    case "auth/weak-password": return "비밀번호 보안성이 낮습니다 (최소 6자).";
    default: return "알 수 없는 에러가 발생했습니다. (" + code + ")";
  }
}
