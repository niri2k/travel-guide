

fetch("data/xian2026.json")

.then(response => response.json())

.then(data=>{


let html="";


data.days.forEach(day=>{


html += `

<div class="day">

<h3>

DAY ${day.day}

${day.title}

</h3>


<p>

${day.description}

</p>


</div>

`;

});


document.getElementById(
"schedule"
).innerHTML=html;


});



function saveExpense(){


let money =
document.getElementById("money").value;


let memo =
document.getElementById("memo").value;


localStorage.setItem(

"expense",

JSON.stringify({

money,

memo

})

);


alert(
"저장되었습니다"
);


}
