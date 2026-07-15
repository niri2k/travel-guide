// ====================================================
// 여행 후기 및 추억 기록 (js/review.js - Firebase 통합본)
// ====================================================
let reviews = [];

// 후기 불러오기
async function loadReviews() {
  reviews = [];

  if (firebaseEnabled && currentUser) {
    try {
      const snapshot = await db.collection("reviews")
        .where("tripId", "==", currentTrip)
        .orderBy("createdAt", "desc")
        .get();

      snapshot.forEach(doc => {
        let data = doc.data();
        data.id = doc.id; // 삭제 검증용 ID 바인딩
        reviews.push(data);
      });
    } catch (err) {
      console.error("Firestore 후기 로드 실패. 로컬로 대체합니다:", err);
      loadLocalReviews();
    }
  } else {
    loadLocalReviews();
  }

  showReviews();
}

function loadLocalReviews() {
  reviews = JSON.parse(localStorage.getItem("review_" + currentTrip)) || [];
}

// 후기 화면에 렌더링
function showReviews() {
  let html = "";
  let reviewListEl = document.getElementById("reviewList");
  if (!reviewListEl) return;

  if (reviews.length === 0) {
    html = `<div style="text-align:center; padding: 30px; color:#64748b; background:#f8fafc; border-radius:16px; border:2px dashed #cbd5e1;">
              아직 작성된 후기가 없습니다. 첫 번째 추억을 남겨보세요! ✍️
            </div>`;
  } else {
    reviews.forEach((item, index) => {
      let firestoreId = item.id ? `'${item.id}'` : "null";
      
      html += `
        <div class="place review-card">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 12px;">
            <span style="font-size:18px; font-weight:800; color:#d97706;">${item.rating}</span>
            <span style="font-size:14px; color:#64748b; font-weight:600;">📅 ${item.date}</span>
          </div>
          <p style="margin:0 0 16px 0; font-size:18px; color:#1e293b; line-height:1.6; white-space: pre-wrap;">${item.text}</p>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; color:#94a3b8;">by ${item.userEmail ? item.userEmail.split('@')[0] : '익명'}</span>
            <button onclick="deleteReview(${index}, ${firestoreId})" style="background:#f1f5f9; color:#ef4444; border:1px solid #fca5a5; width:auto; height:38px; padding:0 16px; font-size:14px; border-radius:12px; margin:0; font-weight:700;">삭제</button>
          </div>
        </div>
      `;
    });
  }

  reviewListEl.innerHTML = html;
}

// 후기 추가하기
async function addReview() {
  let textEl = document.getElementById("reviewText");
  let ratingEl = document.getElementById("reviewRating");

  if (!textEl || !textEl.value.trim()) {
    alert("후기 내용을 입력해주세요!");
    return;
  }

  let today = new Date().toISOString().substring(0, 10);
  const newReview = {
    date: today,
    rating: ratingEl ? ratingEl.value : "⭐⭐⭐⭐⭐",
    text: textEl.value.trim(),
    createdAt: new Date().getTime(),
    userEmail: currentUser ? currentUser.email : "익명"
  };

  if (firebaseEnabled && currentUser) {
    try {
      newReview.userId = currentUser.uid;
      newReview.tripId = currentTrip;
      await db.collection("reviews").add(newReview);
    } catch (err) {
      console.error("Firestore 후기 등록 실패:", err);
      alert("클라우드 업로드에 실패하여 로컬스토리지에 저장합니다.");
      saveReviewToLocal(newReview);
    }
  } else {
    saveReviewToLocal(newReview);
  }

  textEl.value = "";
  if (ratingEl) ratingEl.value = "⭐⭐⭐⭐⭐";
  
  loadReviews(); // 목록 리프레시
}

function saveReviewToLocal(item) {
  reviews.unshift(item);
  localStorage.setItem("review_" + currentTrip, JSON.stringify(reviews));
}

// 후기 삭제하기
async function deleteReview(index, firestoreId) {
  if (!confirm("이 여행 후기를 삭제하시겠습니까?")) return;

  if (firebaseEnabled && currentUser && firestoreId) {
    try {
      const docRef = db.collection("reviews").doc(firestoreId);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        const ownerId = docSnap.data().userId;
        // 작성자 본인 혹은 관리자만 삭제 가능 (Option B 전제조건)
        if (ownerId === currentUser.uid || userRole === "admin") {
          await docRef.delete();
          alert("후기가 삭제되었습니다.");
        } else {
          alert("❌ 삭제 권한이 없습니다. (작성자 및 관리자 전용)");
          return;
        }
      }
    } catch (err) {
      console.error("Firestore 삭제 에러:", err);
      alert("삭제 권한이 없거나 네트워크 오류입니다.");
      return;
    }
  } else {
    reviews.splice(index, 1);
    localStorage.setItem("review_" + currentTrip, JSON.stringify(reviews));
  }

  loadReviews();
}
