// ====================================================
// js/floating.js (플로팅 버튼 자동 숨김/표시 스마트 제어)
// ====================================================

/**
 * 1. 플로팅 버튼(+) 클릭 시 메뉴 열기/닫기
 */
function toggleFab(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById("fabMenu");
  const toggleBtn = document.getElementById("fabToggle");
  
  if (!menu || !toggleBtn) return;

  if (menu.style.display === "none" || menu.style.display === "") {
    menu.style.display = "flex";
    toggleBtn.innerHTML = "×";
    toggleBtn.style.transform = "rotate(90deg)";
    toggleBtn.style.background = "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"; // 닫기 시 빨간색 전환
  } else {
    menu.style.display = "none";
    toggleBtn.innerHTML = "＋";
    toggleBtn.style.transform = "rotate(0deg)";
    toggleBtn.style.background = "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)";
  }
}

/**
 * 2. 화면 외부 터치 시 열려있는 플로팅 메뉴 자동 닫기
 */
document.addEventListener("click", (e) => {
  const container = document.getElementById("fabContainer");
  if (container && !container.contains(e.target)) {
    const menu = document.getElementById("fabMenu");
    const toggleBtn = document.getElementById("fabToggle");
    if (menu && menu.style.display === "flex") {
      menu.style.display = "none";
      toggleBtn.innerHTML = "＋";
      toggleBtn.style.transform = "rotate(0deg)";
      toggleBtn.style.background = "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)";
    }
  }
});

/**
 * 3. [핵심] 로그인 상태 및 화면 전환에 따른 플로팅 버튼 가시성 자동 제어
 */
function updateFabVisibility() {
  const fabContainer = document.getElementById("fabContainer");
  const loginModal = document.getElementById("loginModal");
  if (!fabContainer) return;

  // Firebase 로그인 여부 확인
  const user = firebase.auth().currentUser;
  
  // 로그인 모달이 열려있거나 로그아웃 상태면 무조건 플로팅 버튼 숨김!
  if (!user || (loginModal && !loginModal.classList.contains("hidden"))) {
    fabContainer.classList.add("hidden");
    return;
  }

  // 로그인 상태면 화면 우측 하단에 플로팅 버튼 표시
  fabContainer.classList.remove("hidden");
}

// Firebase 로그인 상태 변경 감지 시 즉시 플로팅 버튼 표시/숨김 적용
firebase.auth().onAuthStateChanged((user) => {
  updateFabVisibility();
});

// 로그인 모달 열고 닫을 때도 플로팅 버튼 가시성 다시 계산
const originalOpenLoginModal = window.openLoginModal;
if (typeof originalOpenLoginModal === "function") {
  window.openLoginModal = function() {
    originalOpenLoginModal();
    updateFabVisibility();
  };
}

const originalCloseLoginModal = window.closeLoginModal;
if (typeof originalCloseLoginModal === "function") {
  window.closeLoginModal = function() {
    originalCloseLoginModal();
    updateFabVisibility();
  };
}