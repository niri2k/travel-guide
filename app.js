
let trips=[];



fetch("data/trips.json")

.then(res=>res.json())

.then(data=>{


trips=data;


showTrips();


});




function showTrips(){


let html="";


trips.forEach(trip=>{


html += `


<div class="trip"
onclick="openTrip('${trip.file}')">


<h3>

${trip.title}

</h3>


<p>

${trip.date}

</p>


<p>

${trip.status}

</p>


</div>


`;

});


document.getElementById(
"tripList"
).innerHTML=html;


}




function openTrip(file){


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


<p>

${day.description}

</p>


</div>


`;

});



document
.getElementById("schedule")
.innerHTML=html;


});


}
