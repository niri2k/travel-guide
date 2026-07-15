let expenses = [];

function getToday() {
  return new Date().toISOString().substring(0, 10);
}

function addExpense() {
  let date = document.getElementById("expenseDate").value;
  let amount = Number(document.getElementById("expenseAmount").value);
  let memo = document.getElementById("expenseMemo").value;

  if (!date) {
    alert("사용 날짜를 입력하세요");
    return;
  }
  if (!amount) {
    alert("금액을 입력하세요");
    return;
  }

  expenses.push({
    date: date,
    amount: amount,
    memo: memo,
  });

  localStorage.setItem("expense_" + currentTrip, JSON.stringify(expenses));
  showExpenses();

  document.getElementById("expenseAmount").value = "";
  document.getElementById("expenseMemo").value = "";
}

function loadExpenses() {
  expenses = JSON.parse(localStorage.getItem("expense_" + currentTrip)) || [];
  let dateInput = document.getElementById("expenseDate");
  if (dateInput) {
    // 기본적으로 여행 시작일이나 오늘 날짜를 세팅
    dateInput.value = tripStartDate || getToday();
  }
  showExpenses();
}

// 지출 삭제 기능
function deleteExpense(index) {
  if (confirm("이 지출 내역을 삭제하시겠습니까?")) {
    expenses.splice(index, 1);
    localStorage.setItem("expense_" + currentTrip, JSON.stringify(expenses));
    showExpenses();
  }
}

// ⭐ 핵심! 지출을 날짜별로 나누어 Day 영역에 배치하고 일자별 합계 계산
function showExpenses() {
  let total = 0;
  let krw = 0;
  let unmappedHtml = ""; // 일정 날짜 외(사전 결제 등) 지출 모음
  let dayTotals = {}; // 일자별 합계 저장용

  // 1. 모든 Day의 지출 영역과 합계 초기화
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

  // 2. 전체 지출을 순회하며 일자별로 배치
  expenses.forEach((item, index) => {
    total += item.amount;
    let itemKrw = item.amount * exchangeRate;
    krw += itemKrw;

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
          <button onclick="deleteExpense(${index})" style="background:#ef4444; color:white; width:auto; height:36px; padding:0 14px; font-size:14px; border-radius:10px; margin:0;">삭제</button>
        </div>
      </div>
    `;

    // 해당 날짜가 여행 Day 일정에 있는 날짜인지 확인
    let targetListEl = document.getElementById(`day-expenses-${item.date}`);
    if (targetListEl) {
      targetListEl.innerHTML += cardHtml;
      dayTotals[item.date] += item.amount;
    } else {
      // 여행 기간 외의 날짜는 하단 공통 리스트로 이동
      unmappedHtml += cardHtml;
    }
  });

  // 3. Day별 총 비용 합계 배지 생성
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

  // 4. 상단 전체 총 지출 및 하단 기타 지출 업데이트
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
