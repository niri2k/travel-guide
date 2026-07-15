let currentTrip = "";
let currentCurrency = "";
let tripStartDate = ""; // 여행 시작 날짜 (YYYY-MM-DD)
let tripDaysMap = {}; // 날짜와 Day 번호 매핑용

function openTrip(file) {
  currentTrip = file;
  fetch("trips/" + file)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("tripDetail").classList.remove("hidden");
      document.getElementById("tripTitle").innerHTML = data.title;
      currentCurrency = data.currency;

      // 1. 여행 시작 날짜 자동 확인 (xian2026.json에 startDate가 없으면 기본값 설정)
      if (data.startDate) {
        tripStartDate = data.startDate;
      } else if (data.date) {
        tripStartDate = data.date.split("~")[0].trim().replace(/\./g, "-");
      } else {
        tripStartDate = "2026-07-18"; // 기본 시안 여행 시작일
      }

      loadExchange(); // 환율을 로드한 뒤 showExpenses()가 호출됩니다.

      let html = "";
      tripDaysMap = {}; // 매핑 초기화

      data.days.forEach((day) => {
        // 시작일을 기준으로 DAY 1, 2... 의 실제 날짜(YYYY-MM-DD) 계산
        let dateObj = new Date(tripStartDate);
        dateObj.setDate(dateObj.getDate() + (day.day - 1));
        let dateStr = dateObj.toISOString().substring(0, 10);

        // 날짜별 Day 매핑 저장 (예: "2026-07-18" -> 1)
        tripDaysMap[dateStr] = day.day;

        html += `
          <div class="day" id="day-section-${dateStr}">
            <h3>
              DAY ${day.day} <span style="font-size:16px; font-weight:normal; color:#64748b;">(${dateStr})</span>
              <br>
              ${day.title}
            </h3>
            
            <div class="places-list">
        `;

        day.places.forEach((place) => {
          html += `
            <div class="place">
              <h4>📍 ${place.name}</h4>
              <p>💰 예상 비용 : ${place.cost} ${data.currency}</p>
              <button onclick="openMap('${place.map}')">지도 보기</button>
            </div>
          `;
        });

        html += `
            </div> <div id="day-expenses-${dateStr}" class="day-expenses-container"></div>
            
            <div id="day-total-${dateStr}" class="day-total-box hidden"></div>
          </div> `;
      });

      document.getElementById("schedule").innerHTML = html;

      loadExpenses();

      if (typeof loadReviews === "function") {
        loadReviews();
      }
    });
}
