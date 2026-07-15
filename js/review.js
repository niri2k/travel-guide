// ==========================================
// 여행 후기 관리 기능 (js/review.js)
// ==========================================
let reviews = [];

// 후기 불러오기
function loadReviews() {
  reviews = JSON.parse(localStorage.getItem("review_" + currentTrip)) || [];
  showReviews();
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
      html += `
        <div class="place review-card">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 12px;">
            <span style="font-size:18px; font-weight:800; color:#d97706;">${item.rating}</span>
            <span style="font-size:14px; color:#64748b; font-weight:600;">📅 ${item.date}</span>
          </div>
          <p style="margin:0 0 16px 0; font-size:18px; color:#1e293b; line-height:1.6; white-space: pre-wrap;">${item.text}</p>
          <div style="text-align:right;">
            <button onclick="deleteReview(${index})" style="background:#f1f5f9; color:#ef4444; border:1px solid #fca5a5; width:auto; height:38px; padding:0 16px; font-size:14px; border-radius:12px; margin:0; font-weight:700;">삭제</button>
          </div>
        </div>
      `;
    });
  }

  reviewListEl.innerHTML = html;
}

// 후기 추가하기
function addReview() {
  let textEl = document.getElementById("reviewText");
  let ratingEl = document.getElementById("reviewRating");

  if (!textEl || !textEl.value.trim()) {
    alert("후기 내용을 입력해주세요!");
    return;
  }

  let today = new Date().toISOString().substring(0, 10);

  // 최신 작성글이 맨 위에 오도록 배열 앞쪽(unshift)에 추가
  reviews.unshift({
    date: today,
    rating: ratingEl ? ratingEl.value : "⭐⭐⭐⭐⭐",
    text: textEl.value.trim()
  });

  localStorage.setItem("review_" + currentTrip, JSON.stringify(reviews));
  showReviews();

  // 입력창 초기화
  textEl.value = "";
  if (ratingEl) ratingEl.value = "⭐⭐⭐⭐⭐";
  
  // 등록 후 목록으로 부드럽게 스크롤
  document.getElementById("reviewList").scrollIntoView({ behavior: "smooth", block: "center" });
}

// 후기 삭제하기
function deleteReview(index) {
  if (confirm("이 여행 후기를 삭제하시겠습니까?")) {
    reviews.splice(index, 1);
    localStorage.setItem("review_" + currentTrip, JSON.stringify(reviews));
    showReviews();
  }
}
