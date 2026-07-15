let currentTrip="";
let currentCurrency="";


function openTrip(file){


currentTrip=file;


fetch("trips/"+file)

.then(res=>res.json())

.then(data=>{


document
.getElementById("tripDetail")
.classList
.remove("hidden");



document
.getElementById("tripTitle")
.innerHTML=data.title;



currentCurrency=data.currency;


loadExchange();


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


<button onclick="openMap('${place.map}')">

지도 보기

</button>


</div>

`;


});


html += "</div>";



});



document
.getElementById("schedule")
.innerHTML=html;



loadExpenses();



});


}
