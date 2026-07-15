// ====================================================
// 비용 관리 시스템 (js/expense.js - Firebase 통합본)
// ====================================================
let expenses = [];

function getToday() {
  return new Date().toISOString().substring(0, 10);
}

// 비용 추가 함수
async function addExpense() {
  let date = document.getElementById("expenseDate").value;
  let amount = Number(document.getElementById("expenseAmount").value);
  let memo = document.getElementById("expenseMemo").value;

  if (!date) { alert("사용 날짜를 입력하세요"); return; }
  if (!amount) { alert("금액을 입력하세요"); return; }

  const newExpense = {
    date: date,
    amount: amount,
    memo: memo,
    createdAt: new Date().getTime()
  };

  // Firebase 실시간 동기화 (로그인 상태)
  if (firebaseEnabled && currentUser) {
    try {
      newExpense.userId = currentUser.uid;
      newExpense.tripId = currentTrip;
      
      // Firestore에 문서 생성
      await db.collection("expenses").add(newExpense);
    } catch (err) {
      console.error("Firestore 저장 실패:", err);
      alert("클라우드 저장 실패! 오프라인 임시 저장을 진행합니다.");
      saveToLocal(newExpense);
    }
  } else {
    // 비로그인 상태: 기존 로컬스토리지 방식 작동
    saveToLocal(newExpense);
  }

  showExpenses();
  document.getElementById("expenseAmount").value = "";
  document.getElementById("expenseMemo").value = "";
}

function saveToLocal(item) {
  expenses.push(item);
  localStorage.setItem("expense_" + currentTrip, JSON.stringify(expenses));
}

// 비용 로드 함수
async function loadExpenses() {
  expenses = [];
  
  if (firebaseEnabled && currentUser) {
    // Firebase 모드: Firestore에서 현재 여행의 지출 내역 조회
    try {
      const snapshot = await db.collection("expenses")
        .where("tripId", "==", currentTrip)
        .orderBy("createdAt", "asc")
        .get();

      snapshot.forEach(doc => {
        let data = doc.data();
        data.id = doc.id; // 삭제용 ID 바인딩
        expenses.push(data);
      });
    } catch (err) {
      console.error("Firestore 로드 실패. 로컬 데이터로 대체합니다:", err);
      loadLocalExpenses();
    }
  } else {
    loadLocalExpenses();
  }

  let dateInput = document.getElementById("expenseDate");
  if (dateInput) {
    dateInput.value = tripStartDate || getToday();
  }
  showExpenses();
}

function loadLocalExpenses() {
  expenses = JSON.parse(localStorage.getItem("expense_" + currentTrip)) || [];
}

// 지출 삭제 함수
async function deleteExpense(index, firestoreId) {
  if (!confirm("이 지출 내역을 삭제하시겠습니까?")) return;

  if (firebaseEnabled && currentUser && firestoreId) {
    // Option B 권한 관리 대비: 삭제 권한 체크
    try {
      const docRef = db.collection("expenses").doc(firestoreId);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        const ownerId = docSnap.data().userId;
        // 본인 글이거나 관리자(admin) 권한인 경우에만 삭제 허용
        if (ownerId === currentUser.uid || userRole === "admin") {
          await docRef.delete();
          alert("지출이 클라우드에서 완전히 삭제되었습니다.");
        } else {
          alert("❌ 삭제 권한이 없습니다. (작성자 본인 및 관리자만 가능)");
          return;
        }
      }
    } catch (err) {
      console.error("Firestore 삭제 실패:", err);
      alert("삭제 실패했습니다.");
      return;
    }
  } else {
    // 로컬 삭제
    expenses.splice(index, 1);
    localStorage.setItem("expense_" + currentTrip, JSON.stringify(expenses));
  }

  loadExpenses();
}

// 지출 화면 그리기
function showExpenses() {
  let total = 0;
  let krw = 0;
  let unmappedHtml = ""; 
  let dayTotals = {}; 

  // 모든 Day 컨테이너 초기화
  Object.keys(tripDaysMap || {}).forEach((dateStr) => {
    let listEl = document.getElementById(`day-expenses-${dateStr}`);
    let totalEl = document.getElementById(`day-total-${dateStr}`);
    if (listEl) listEl.innerHTML = "";
    if (totalEl) {
      totalEl.innerHTML = "";
      totalEl.classList.add("hidden");
    }
    dayTotals[dateStr] = 0;
  });

  expenses.forEach((item, index) => {
    total += item.amount;
    let itemKrw = item.amount * exchangeRate;
    krw += itemKrw;

    let firestoreId = item.id ? `'${item.id}'` : "null";

    let cardHtml = `
      <div class="place expense-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:15px; font-weight:800; color:#047857;">💸 사용 내역</span>
          <span style="font-size:14px; color:#64748b;">📅 ${item.date}</span>
        </div>
        <h4 style="margin: 8px 0; color:#0f172a; font-size:22px;">${item.memo}</h4>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
          <span style="font-size:18px; font-weight:bold; color:#059669;">
            💰 ${item.amount} ${currentCurrency} 
            <span style="font-size:15px; font-weight:normal; color:#64748b;">(≈ ${Math.round(itemKrw).toLocaleString()}원)</span>
          </span>
          <button onclick="deleteExpense(${index}, ${firestoreId})" style="background:#ef4444; color:white; width:auto; height:36px; padding:0 14px; font-size:14px; border-radius:10px; margin:0;">삭제</button>
        </div>
      </div>
    `;

    let targetListEl = document.getElementById(`day-expenses-${item.date}`);
    if (targetListEl) {
      targetListEl.innerHTML += cardHtml;
      dayTotals[item.date] += item.amount;
    } else {
      unmappedHtml += cardHtml;
    }
  });

  // Day별 총 비용 합계 배지 생성
  Object.keys(dayTotals).forEach((dateStr) => {
    let dayTotalAmount = dayTotals[dateStr];
    let totalEl = document.getElementById(`day-total-${dateStr}`);
    if (totalEl && dayTotalAmount > 0) {
      let dayKrw = Math.round(dayTotalAmount * exchangeRate);
      totalEl.innerHTML = `
        <div class="day-total-badge">
          <span class="badge-title">📊 DAY ${tripDaysMap[dateStr]} (${dateStr}) 지출 합계</span>
          <div class="badge-amount">
            <strong>${dayTotalAmount} ${currentCurrency}</strong>
            <span>≈ ${dayKrw.toLocaleString()}원</span>
          </div>
        </div>
      `;
      totalEl.classList.remove("hidden");
    }
  });

  // 헤더 및 하단 전체 총합 업데이트
  let totalExpenseEl = document.getElementById("totalExpense");
  if (totalExpenseEl) totalExpenseEl.innerHTML = `${total} ${currentCurrency}`;

  let totalKRWEl = document.getElementById("totalKRW");
  if (totalKRWEl) totalKRWEl.innerHTML = `약 ${Math.round(krw).toLocaleString()}원`;

  let expenseListEl = document.getElementById("expenseList");
  if (expenseListEl) {
    if (unmappedHtml) {
      expenseListEl.innerHTML = `
        <h4 style="margin: 25px 0 10px; color:#64748b; font-size:18px;">📌 일정 외 날짜 (사전 결제 등) 지출 내역</h4>
        ${unmappedHtml}
      `;
    } else {
      expenseListEl.innerHTML = "";
    }
  }
}
