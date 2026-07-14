
let trips=[];



fetch("data/trips.json")

.then(res=>res.json())

.then(data=>{


trips=data;


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
