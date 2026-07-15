let trips = [];



fetch("data/trips.json")

.then(response => {

    if (!response.ok) {

        throw new Error(
            "여행 목록 파일을 불러올 수 없습니다."
        );

    }

    return response.json();

})

.then(data => {

    trips = data;

    showTrips();

})

.catch(error => {


    document
    .getElementById("tripList")
    .innerHTML =

    `
    ❌ 오류 발생

    <br>

    ${error.message}
    `;


});






function showTrips(){


    let categories = {


        upcoming: {

            title:"✈️ 다가올 여행",

            items:[]

        },


        active: {

            title:"🌏 여행 중",

            items:[]

        },


        memory: {

            title:"📸 여행의 기억",

            items:[]

        }


    };





    trips.forEach(trip => {


        if(categories[trip.status]) {


            categories[trip.status]
            .items
            .push(trip);


        }


    });





    let html = "";





    Object.values(categories)

    .forEach(category => {



        html += `

        <h3>
        ${category.title}
        </h3>

        `;





        if(category.items.length === 0){


            html += `

            <p>
            등록된 여행이 없습니다.
            </p>

            `;


        }







        category.items.forEach(trip => {



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

    .innerHTML = html;



}
