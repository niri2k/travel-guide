// js/place-detail.js
let currentPlaceId = null;
let lastReviewDoc = null; // 10개씩 페이징하기 위한 기준 커서
const REVIEWS_PER_PAGE = 10;

/**
 * 1. 여행 일정의 인덱스를 기반으로 장소 상세 페이지 열기
 */
function openPlaceDetailByIndex(dayIdx, placeIdx) {
  if (!currentTripData || !currentTripData.days[dayIdx]) return;
  const place = currentTripData.days[dayIdx].places[placeIdx];
  if (!place) return;

  // 고유 장소 ID 생성 (DB에 id가 없으면 한글이름+영어이름을 조합하여 고유 ID로 사용)
  const nameKr = place.name_kr || place.name || "unknown";
  currentPlaceId = place.id || `${currentTrip}_${nameKr.replace(/\s+/g, '_')}`;

  // 화면 전환 (여행 상세는 숨기고 장소 상세를 표시)
  document.getElementById("tripDetail").classList.add("hidden");
  const detailSection = document.getElementById("placeDetailSection");
  detailSection.classList.remove("hidden");
  window.scrollTo(0, 0); // 상단으로 스크롤 이동

  // 상세 데이터 렌더링
  const content = document.getElementById("placeDetailContent");
  const nameCn = place.name_cn || "중국어 명칭 없음";
  const nameEn = place.name_en || "";
  const imageUrl = place.imageUrl || "https://images.unsplash.com/photo-1543097692-fa13c6cd8595?w=800";
  const address = place.address || "현지 주소 정보가 등록되지 않았습니다.";
  const phone = place.phone || "전화번호 정보 없음";
  const openHours = place.openHours || "운영 시간 정보 없음";
  const description = place.description || "이 장소에 대한 간략한 소개가 아직 등록되지 않았습니다. 첫 후기를 남겨 정보를 공유해 주세요!";
  const cost = place.cost || 0;
  const currency = currentCurrency || "CNY";

  content.innerHTML = `
    <div style="position: relative; width: 100%; height: 240px; border-radius: 16px; overflow: hidden; background: #cbd5e1; margin-bottom: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <img src="${imageUrl}" alt="${nameKr}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'">
      <div style="position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 20px 15px 12px 15px; color: white;">
        <h2 style="margin: 0; font-size: 22px; color:white;">${nameKr}</h2>
        <p style="margin: 3px 0 0 0; font-size: 14px; color: #e2e8f0;">${nameCn} ${nameEn ? `· ${nameEn}` : ''}</p>
      </div>
    </div>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; font-size: 14px; margin-bottom: 20px; line-height: 1.8; color:#334155;">
      <div style="display:flex; gap:8px;"><span style="width:20px;">📍</span> <div><strong>주소:</strong> ${address}</div></div>
      <div style="display:flex; gap:8px;"><span style="width:20px;">📞</span> <div><strong>전화:</strong> ${phone}</div></div>
      <div style="display:flex; gap:8px;"><span style="width:20px;">⏰</span> <div><strong>운영:</strong> ${openHours}</div></div>
      <div style="display:flex; gap:8px;"><span style="width:20px;">💰</span> <div><strong>예상 비용:</strong> <span style="color:#2563eb; font-weight:bold;">${cost} ${currency}</span></div></div>
    </div>
    
    <h4 style="margin: 0 0 8px 0; color: #1e293b;">📖 장소 소개</h4>
    <p style="line-height: 1.7; color: #475569; font-size: 15px; background: #fff; padding: 4px 0; margin: 0;">${description}</p>
  `;

  // 후기 목록 초기화 및 첫 10개 로드
  document.getElementById("placeReviewList").innerHTML = "";
  lastReviewDoc = null;
  loadReviewsForPlace();
}

/**
 * 2. 상세 페이지 닫기 및 여행 일정이 있는 목록으로 귀환
 */
function closePlaceDetail() {
  document.getElementById("placeDetailSection").classList.add("hidden");
  document.getElementById("tripDetail").classList.remove("hidden");
}

/**
 * 3. 후기 10개 단위 불러오기 (Firebase Pagination)
 */
async function loadReviewsForPlace() {
  const reviewContainer = document.getElementById("placeReviewList");
  const loadMoreBtn = document.getElementById("loadMoreReviewsBtn");

  if (!lastReviewDoc) {
    reviewContainer.innerHTML = "<p style='text-align:center; color:#64748b; padding:20px 0;'>후기를 불러오는 중...</p>";
  }

  try {
    let query = firebase.firestore().collection("reviews")
      .where("placeId", "==", currentPlaceId)
      .where("isPublic", "==", true)
      .orderBy("createdAt", "desc")
      .limit(REVIEWS_PER_PAGE);

    // 이전 페이지네이션 커서가 존재하면 그 다음부터 10개를 가져옴
    if (lastReviewDoc) {
      query = query.startAfter(lastReviewDoc);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      if (!lastReviewDoc) {
        reviewContainer.innerHTML = "<p style='background:#f8fafc; padding:30px; border-radius:12px; text-align:center; color:#94a3b8; border:1px dashed #cbd5e1;'>아직 등록된 후기가 없습니다.<br>첫 번째 후기의 주인공이 되어보세요!</p>";
      }
      loadMoreBtn.classList.add("hidden");
      return;
    }

    // 다음 페이지네이션을 위해 마지막 문서 저장
    lastReviewDoc = snapshot.docs[snapshot.docs.length - 1];

    let html = "";
    snapshot.forEach(doc => {
      const rev = doc.data();
      const stars = "⭐".repeat(rev.rating || 5);
      const dateStr = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("ko-KR", { year: 'numeric', month: '2-digit', day: '2-digit' }) : "방금 전";
      
      html += `
        <div style="border-bottom: 1px solid #f1f5f9; padding: 16px 0; transition: background 0.2s;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-weight: bold; color: #1e293b; font-size: 14px;">👤 ${rev.userName || '익명 여행자'}</span>
            <span style="font-size: 12px; color: #94a3b8;">${dateStr}</span>
          </div>
          <div style="margin-bottom: 8px; font-size: 14px;">${stars}</div>
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${rev.comment}</p>
        </div>
      `;
    });

    if (!lastReviewDoc || reviewContainer.innerHTML.includes("후기를 불러오는 중")) {
      reviewContainer.innerHTML = html;
    } else {
      reviewContainer.insertAdjacentHTML('beforeend', html);
    }

    // 가져온 데이터가 10개보다 적으면 더보기 버튼 숨기기
    if (snapshot.docs.length < REVIEWS_PER_PAGE) {
      loadMoreBtn.classList.add("hidden");
    } else {
      loadMoreBtn.classList.remove("hidden");
    }

  } catch (err) {
    console.error("리뷰 로드 에러:", err);
    reviewContainer.innerHTML = "<p style='color: #ef4444; text-align:center; padding:15px;'>후기를 불러오는 중 문제가 발생했습니다.<br>잠시 후 다시 시도해 주세요.</p>";
  }
}

/**
 * 4. 10개 더보기 버튼 클릭 시
 */
function loadMoreReviews() {
  loadReviewsForPlace();
}

/**
 * 5. 후기 등록 (날짜, 유저명, 별점, 내용 저장)
 */
async function submitReview() {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("후기를 작성하려면 화면 상단의 [로그인] 버튼을 눌러 로그인해 주세요!");
    return;
  }

  const rating = parseInt(document.getElementById("reviewRating").value);
  const comment = document.getElementById("reviewComment").value.trim();

  if (!comment) {
    alert("다른 여행자들을 위해 후기 내용을 입력해 주세요.");
    return;
  }

  try {
    const userName = user.displayName || (user.email ? user.email.split("@")[0] : "여행자");

    await firebase.firestore().collection("reviews").add({
      placeId: currentPlaceId,
      uid: user.uid,
      userName: userName,
      rating: rating,
      comment: comment,
      createdAt: new Date().toISOString(),
      isPublic: true
    });

    alert("성공적으로 후기가 등록되었습니다!");
    document.getElementById("reviewComment").value = "";
    
    // 후기 목록 새로고침 (처음부터 다시 불러옴)
    document.getElementById("placeReviewList").innerHTML = "";
    lastReviewDoc = null;
    loadReviewsForPlace();

  } catch (err) {
    console.error("리뷰 등록 실패:", err);
    alert("후기 등록에 실패했습니다. 네트워크 상태를 확인해 주세요.");
  }
}
