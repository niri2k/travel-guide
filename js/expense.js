let expenses = [];



function getToday(){

    return new Date()
    .toISOString()
    .substring(0,10);

}





function addExpense(){


let date =
document
.getElementById("expenseDate")
.value;



let amount =
Number(
document
.getElementById("expenseAmount")
.value
);



let memo =
document
.getElementById("expenseMemo")
.value;



if(!date){

alert("사용 날짜를 입력하세요");

return;

}



if(!amount){

alert("금액을 입력하세요");

return;

}





expenses.push({

date:date,

amount:amount,

memo:memo

});





localStorage.setItem(

"expense_"+currentTrip,

JSON.stringify(expenses)

);



showExpenses();



document
.getElementById("expenseAmount")
.value="";


document
.getElementById("expenseMemo")
.value="";


}









function loadExpenses(){


expenses =

JSON.parse(

localStorage.getItem(

"expense_"+currentTrip

)

)

|| [];



document
.getElementById("expenseDate")
.value=getToday();



showExpenses();


}









function showExpenses(){


let total=0;

let krw=0;

let html="";




expenses.forEach(item=>{


total += item.amount;


krw +=
item.amount *
exchangeRate;





html += `


<div class="place">


<p>
📅 ${item.date}
</p>


<h4>

${item.memo}

</h4>


<p>

💰 ${item.amount}
${currentCurrency}

<br>

≈

${Math.round(

item.amount *
exchangeRate

)
.toLocaleString()}

원

</p>



</div>


`;



});







document
.getElementById("totalExpense")
.innerHTML=

`
${total}
${currentCurrency}
`;




document
.getElementById("totalKRW")
.innerHTML=

`
약 ${Math.round(krw)
.toLocaleString()}원
`;





document
.getElementById("expenseList")
.innerHTML=html;



}
