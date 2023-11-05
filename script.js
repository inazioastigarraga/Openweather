var citySearchForm = $("#citySearchForm");
var cityInput = $("#cityInput");
var searchedCitysGroup = $("#cityHistoryBtns");
var cityHist;
//contenidos principales
var curWeatherCard = $("#curWeatherCard");
var dayForcastDiv = $("#dayForcast");

//OpenWeather
var authKey = "6b1f3503a9686063d7fa4518108b400c";
var dayforcastQry = "https://api.openweathermap.org/data/2.5/forecast?appid="+authKey+"&q=";
var curWeatherQry = "https://api.openweathermap.org/data/2.5/weather?appid="+authKey+"&q=";
var uvQry = "https://api.openweathermap.org/data/2.5/uvi?appid="+authKey;


function printButtons(){
    //limpiar anteriores botones
    searchedCitysGroup.empty();

    for(city of cityHist){
        searchedCitysGroup.prepend( $("<button/>",{class:"btn btn-secondary btn-white city-btn", 'data-city':city, text:city}) )
    }
    saveHist();

}

function saveHist(){
    localStorage.setItem('history',JSON.stringify(cityHist));
}


function loadHist(){
    cityHist = JSON.parse(localStorage.getItem('history'));
    if(cityHist === null){
        cityHist = [];
    }
}


function getIcon(weather){  
    weatherIcon = $("<i/>");
    for (const elem of weather){
        weatherIcon.append( $("<img/>",{src:'http://openweathermap.org/img/wn/'+elem.icon+'@2x.png', alt:elem.description}))
    }
    return weatherIcon;
}


function printWeatherForCity(cityName){
   $.ajax({ 
        url:curWeatherQry+cityName,
        method:"GET",
        error:function (xhr, ajaxOptions, thrownError){
            if(xhr.status==404) {
                curWeatherCard.empty();
                curWeatherCard.append($("<h4/>",{text: "I'm sorry, but '"+cityHist.pop()+"' could not be found by Open Weather API.  I took the liberty of removing this from your history.  Please try another city!" }));
                dayForcastDiv.empty();
                printButtons();
            }
        }
    })
    .then(function(response){
        var time = moment();

        curWeatherCard.empty();

        // añadir datos de JSON a DOM
        curWeatherCard.append([
            $("<div/>",{class:"card-header text-center m-0 h-3", text:time.format('ddd MMMM Do YYYY, h:mm a')}),
            $("<div/>",{class:"card-body"}).append([
                $('<h3/>',{text:response.name}).append(
                    getIcon(response.weather)
                ),
                $('<div/>',{text:"Temperatura: "+Math.trunc(response.main.temp-273.15)+"°C"}),
                $('<div/>',{text:"Humedad: "+response.main.humidity+"%"}),
                $('<div/>',{text:"Viento: "+Math.trunc(response.wind.speed*1.6)+" km/h"}),
            ])
        ])
        //cuando la ciudad es válida se hacen las demás llamadas
        printWeatherForecast(cityName)
        getUV(response);
    });
}



function printWeatherForecast(cityName){
    $.ajax({
        url:dayforcastQry+cityName,
        method:"GET",
    })
    .then(function(response){
        dayForcastDiv.empty()
        for (chunk of response.list){
            if(chunk.dt_txt.includes("12:00:00")){
                dayForcastDiv.append( 
                    $("<div/>",{class:"card bg-primary text-center text-white border border-white p-2 col-xs-12 col-sm-6 col-md-4 col-lg"}).append([
                        $("<div/>",{class:"font-weight-bold", text:moment.unix(chunk.dt).format("MM/DD/YYYY")}),
                        $('<h3/>',{text:response.name}).append(
                            getIcon(chunk.weather)
                        ),
                        $('<div/>',{text:"Temp: "+Math.trunc(chunk.main.temp - 273.15)+"°C"}),
                        $('<div/>',{text:"Hum: "+chunk.main.humidity+"%"})
                    ])
                )

            }
        }
    });
}


function cityAdded(event){
    event.preventDefault();
    newCity = cityInput.val().toLowerCase().trim();
    if (newCity ==""){return;}

    //si no está en la lista todavía
    if(cityHist.indexOf(newCity) < 0){
        cityHist.push(newCity)
    }
    else{
        printWeatherForCity(newCity);
        return;
    }

    cityInput.val("");

    printWeatherForCity(newCity);

    //imprimir todos los botones
    printButtons();
}

//MAIN

$(window).on("load", function(){
    loadHist();
    printButtons();
});

citySearchForm.on("submit", cityAdded);

$(document).on("click",".city-btn", function(){
    city = $(this).attr("data-city");
    printWeatherForCity(city);
})

