// ====================================================
// js/auth.js (완벽 수정본)
// ====================================================

let currentUser = null;
let userRole = "user";

document.addEventListener("DOMContentLoaded", () => {
    console.log("auth.js 로드됨");
    if (typeof firebase === 'undefined') return;

    firebase.auth().onAuthStateChanged(async (user) => {
        currentUser = user;
        if (user) {
            try {
                const userDoc = await firebase.firestore().collection("users").doc(user.uid).get();
                userRole = userDoc.exists ? (userDoc.data().role || "user") : "user";
            } catch (err) {
                userRole = "user";
            }
        } else {
            userRole = "user";
        }
        updateAuthUI(user);
        if (typeof loadTrips === "function") loadTrips(); // 여행 목록 로드
    });
});

function updateAuthUI(user) {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userInfo = document.getElementById("userInfo");
    const adminBadge = document.getElementById("adminBadge");
    const mainTitle = document.getElementById("mainTitle");

    if (user) {
        if (loginBtn) loginBtn.classList.add("hidden");
        if (logoutBtn) logoutBtn.classList.remove("hidden");
        if (userInfo) {
            userInfo.innerHTML = `👤 ${user.email.split('@')[0]}님`;
            userInfo.classList.remove("hidden");
        }
        if (mainTitle) mainTitle.innerText = `${user.email.split('@')[0]}님을 위한 실시간 여행 가이드 & 가계부`;
        if (adminBadge) adminBadge.style.display = (userRole === "admin") ? "inline-block" : "none";
    } else {
        if (loginBtn) loginBtn.classList.remove("hidden");
        if (logoutBtn) logoutBtn.classList.add("hidden");
        if (userInfo) userInfo.classList.add("hidden");
        if (mainTitle) mainTitle.innerText = "사용자를 위한 실시간 여행 가이드 & 가계부";
        if (adminBadge) adminBadge.style.display = "none";
    }
}

// 로그인/회원가입/모달 함수들
async function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        closeLoginModal();
    } catch (e) { alert(e.message); }
}

async function signUp() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        closeLoginModal();
    } catch (e) { alert(e.message); }
}

async function logout() {
    await firebase.auth().signOut();
    location.reload();
}

function openLoginModal() {
    document.getElementById("loginModal").classList.remove("hidden");
}

function closeLoginModal() {
    document.getElementById("loginModal").classList.add("hidden");
}
