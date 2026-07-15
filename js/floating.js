function toggleFab(){


let menu =
document.getElementById(
"fabMenu"
);


menu.classList.toggle(
"hidden"
);


}




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
