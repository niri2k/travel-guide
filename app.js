let trips = [];

let currentTrip = "";

let currentCurrency = "";

let exchangeRate = 0;

let expenses = [];





function getToday(){

    return new Date()
    .toISOString()
    .substring(0,10);

}






fetch("data/trips.json")

.then(response=>response.json())

.then(data=>{


    trips=data;

    showTrips();


})

.catch(error=>{


document.getElementById(
"tripList"
)
.innerHTML=

"❌ 여행 데이터를 불러오지 못했습니다.";


});







function showTrips(){


let categories={


upcoming:{
title:"✈️ 다가올 여행",
items:[]
},


active:{
title:"🌏 여행 중",
items:[]
},


memory:{
title:"📸 여행의 기억",
items:[]
}


};




trips.forEach(trip=>{


if(categories[trip.status]){


categories[trip.status]
.items
.push(trip);


}


});





let html="";



Object.values(categories)
.forEach(category=>{


html += `

<h3>
${category.title}
</h3>

`;



category.items.forEach(trip=>{


html += `


<div class="trip"
onclick="openTrip('${trip.file}')">


<h3>
${trip.title}
</h3>


<p>
📅 ${trip.date}
</p>


</div>


`;


});


});



document
.getElementById(
"tripList"
)
.innerHTML=html;


}









function openTrip(file){


currentTrip=file;



fetch("trips/"+file)

.then(response=>response.json())

.then(data=>{



document
.getElementById(
"tripDetail"
)
.classList
.remove("hidden");



document
.getElementById(
"tripTitle"
)
.innerHTML=
data.title;



currentCurrency =
data.currency;



loadExchange();




document
.getElementById(
"expenseDate"
)
.value=getToday();





let html="";



data.days.forEach(day=>{


html += `


<div class="day">


<h3>

DAY ${day.day}

<br>

${day.title}

</h3>


`;



day.places.forEach(place=>{


html += `


<div class="place">


<h4>
📍 ${place.name}
</h4>


<p>

💰 예상 비용 :
${place.cost}
${data.currency}

</p>



<button
onclick="window.open('${place.map}')">

지도 보기

</button>


</div>


`;


});



html += `

</div>

`;



});




document
.getElementById(
"schedule"
)
.innerHTML=html;



loadExpenses();



});



}









function loadExchange(){


fetch("data/exchange.json")


.then(response=>response.json())


.then(data=>{


exchangeRate =
data[currentCurrency];



document
.getElementById(
"exchangeRate"
)
.innerHTML=

`
💱 통화 : ${currentCurrency}
/
환율 : 1 ${currentCurrency}
= ${exchangeRate}원
(2026-07-15 기준)

`;



showExpenses();



});


}








function addExpense(){



let date =
document
.getElementById(
"expenseDate"
)
.value;



let amount =
Number(
document
.getElementById(
"expenseAmount"
)
.value
);



let memo =
document
.getElementById(
"expenseMemo"
)
.value;





expenses.push({

date,
amount,
memo

});





localStorage.setItem(

"expense_"+currentTrip,

JSON.stringify(expenses)

);




showExpenses();


}









function loadExpenses(){


expenses =

JSON.parse(

localStorage.getItem(

"expense_"+currentTrip

)

)

|| [];



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

${item.amount}
${currentCurrency}

<br>

≈

${Math.round(
item.amount*exchangeRate
)
.toLocaleString()}
원

</p>


</div>


`;


});





document
.getElementById(
"totalExpense"
)
.innerHTML=

`
${total}
${currentCurrency}
`;



document
.getElementById(
"totalKRW"
)
.innerHTML=

`
약 ${Math.round(krw)
.toLocaleString()}원
`;



document
.getElementById(
"expenseList"
)
.innerHTML=html;


}
