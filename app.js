
let currentTrip="";
let currentCurrency="CNY";
let exchangeRate=0;
let trips=[];


fetch("data/trips.json")
.then(res=>res.json())
.then(data=>{


trips=data;


showTrips();


});


function getToday(){

    let today = new Date();

    return today.toISOString()
    .substring(0,10);

}


function showTrips(){


let categories = {

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

    <h2>
    ${category.title}
    </h2>

    `;


    if(category.items.length===0){

        html += `
        <p>
        등록된 여행이 없습니다.
        </p>
        `;

    }



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
.getElementById("tripList")
.innerHTML=html;


}




function openTrip(file){

currentTrip=file;

expenses =
JSON.parse(
localStorage.getItem(
"expenses_"+currentTrip
)
)
|| [];

showExpenses();

document.getElementById(
"expenseDate"
).value = getToday();

    
fetch("trips/"+file)

.then(res=>res.json())

.then(data=>{


document
.getElementById("tripDetail")
.classList
.remove("hidden");



document
.getElementById("tripTitle")
.innerHTML=
data.title;



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
💰 예상 비용:
${place.cost} ${data.currency}
</p>


<button onclick="window.open('${place.map}')">

지도 보기

</button>


<p>

⭐ ☆☆☆☆☆

</p>


<textarea
placeholder="후기 작성">
</textarea>


</div>

`;



});



html += `

</div>

`;



});



document
.getElementById("schedule")
.innerHTML=html;


});


}



let expenses =
JSON.parse(
localStorage.getItem("expenses")
)
|| [];



function addExpense(){


let date =
document.getElementById(
"expenseDate"
).value;


let amount =
Number(
document.getElementById(
"expenseAmount"
).value
);


let memo =
document.getElementById(
"expenseMemo"
).value;


expenses.push({

date: date,

amount: amount,

memo: memo

});



localStorage.setItem(

"expenses_"+currentTrip,

JSON.stringify(expenses)

);



showExpenses();


}



function showExpenses(){


let total=0;

let html="";



expenses.forEach(item=>{


total += item.amount;



html += `

<div class="place">

<p>
${item.date}
</p>


<h4>

${item.memo}

</h4>


<p>

${item.amount} CNY

</p>


</div>

`;



});



document
.getElementById(
"totalExpense"
)
.innerHTML=

total+" CNY";



document
.getElementById(
"expenseList"
)
.innerHTML=html;


}



showExpenses();
