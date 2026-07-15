let exchangeRate=0;


function loadExchange(){


fetch("data/exchange.json")

.then(res=>res.json())

.then(data=>{


exchangeRate =
data[currentCurrency];


document
.getElementById("exchangeRate")
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
