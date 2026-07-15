let trips = [];


fetch("data/trips.json")

.then(res => res.json())

.then(data => {

    trips = data;

    showTrips();

});



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
.getElementById("tripList")
.innerHTML=html;


}
