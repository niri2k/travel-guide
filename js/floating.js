// ==========================================
// 1. 플로팅 액션 버튼(FAB) 열기/닫기 (교체된 함수)
// ==========================================
function toggleFab(event) {
  if (event) {
    event.stopPropagation(); // 버튼 클릭 이벤트가 바탕으로 번지는 것 방지
  }
  const container = document.getElementById('fabContainer');
  if (container) {
    container.classList.toggle('open');
  }
}

// ==========================================
// 2. 화면의 다른 빈 곳을 터치하면 메뉴 자동 닫기 (새로 추가)
// ==========================================
document.addEventListener('click', function(e) {
  const container = document.getElementById('fabContainer');
  if (container && !container.contains(e.target)) {
    container.classList.remove('open');
  }
});

/* ----------------------------------------------------
  ⚠️ 아래의 openExpenseForm(), openScheduleForm() 등 
  기존에 작성된 기능 함수들은 지우지 말고 그대로 두세요!
---------------------------------------------------- */



function openExpenseForm(){


toggleFab();


document
.getElementById(
"expenseAmount"
)
.scrollIntoView({

behavior:"smooth"

});


}




function openScheduleForm(){


alert(
"일정 추가 기능 준비 중입니다."
);


}




function openPlaceForm(){


alert(
"방문 장소 기록 기능 준비 중입니다."
);


}




function openReviewForm(){


alert(
"후기 작성 기능 준비 중입니다."
);


}
