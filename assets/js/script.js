/*
- set localStorage to save my-home key with city name and attach to home icon
- set localStorage to save city names as key with fetched object as data?
- auto update interval: every 10 minutes
- recommended to represent weather with central point in territory instead of all 200,000+ cities
- calling more than once per 10 min on free plan will auto-suspend key (code 429: blocked account)

CUSTOMIZATION
- consider changing navbar to have a dropdown that allows different search types: city name, city name and country, city name and state and country,  (first search-type done)
    - city: `http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=${measurementSystem()}`
    - city & country code: `api.openweathermap.org/data/2.5/forecast?q={city name},{country code}&appid={API key}`
    - city, state, country code: `api.openweathermap.org/data/2.5/forecast?q={city name},{state code},{country code}&appid={API key}`
    ************************assignment requires latitude and longitude url*********************************
    - longitude & latitude: `api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}`
        - use geocoding API to convert coordinates to city name & zip
        - direct geocoding (coordinate to city name): `http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}`
        - use LIMIT parameter to limit how many similar named cities appear in call (Springfield in every state). default is maximum 5.
        - city: http://api.openweathermap.org/geo/1.0/direct?q={city name}&limit=5&appid={API key}
        - zip code: http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}


ERRORS
- 401 - did not specify api key in request, wrong key, or fetching disallowed info (paid vs unpaid subscription)
- 404 - wrong city name, ZIP, or city ID. or wrong request format
- 429 - surpassing limit of free subscription
- 500, 502, 503, 504 - CONTACT OpenWeather via email with example of api request that failed
*/

const citySearchEl = $(".city-search");
var cityName = "Phoenix"; // store user input in this var as a query. state and country need to be specified as well
var zip = "85003";
var state = "AZ";
var country = "US";
var latitude = "";
var longitude = "";

// function tempConversions(kelvin) {
//     var celcius = Math.round(parseFloat(kelvin) - 273.15);
// 	var fahrenheit = Math.round(((parseFloat(kelvin) - 273.15) * 1.8) + 32);
//     // var temperature = $("#temp");
//     // if (locale === usa) {
//         // temperature.text(fahrenheit + "\u00B0" + "F");
//         return fahrenheit + "\u00B0" + "F";
//     // } else {
//         // temperature.text(celcius + "\u00B0" + "C");
//         // return celcius;
//     // }
// }

// sets units of measurement based on measurement system
function units() {
    var imperialUnits = {
        temp: " \u00B0" + "F",
        speed: " mph",
        pressure: " mb",
        humidPercent: "%"
    };
    var metricUnits = {
        temp: " \u00B0" + "C",
        speed: " m/s",
        pressure: " hPa",
        humidPercent: "%"
    };
    if ($(".switch").prop("checked")) {
        return imperialUnits;
    } else {
        return metricUnits;
    }
}

// sets page to return data in Imperial or Metric
function measurementSystem() {
    if ($(".switch").prop("checked")) {
        return "imperial";
    } else {
        return "metric";
    }
}

// adds specific data to HTML
// function postWeather(data) {
//     // left-side image with date, city, temp, description
//     var weekday = $("#weekday");
//     var monthDate = $("#month-date");
//     var city = $("#city-name");
//     var description = $("#weather-event");
//     // sets HTML in left-side
//     weekday.text(dayjs().format("dddd"));
//     monthDate.text(dayjs().format("MMMM Do"));
//     // sample of how to print today's day name, example: Tue
//     // var todayData = Date((data.list[0].dt) * 1000).split(" ");
//     // var today = todayData[0];
//     city.text(data.city.name + ", " + data.city.country);
//     description.text(data.list[0].weather[0].description);
//     var icon = data.list[0].weather[0].icon;
//     var iconEl = $("#today-icon")
//     iconEl.children().attr("href", "http://openweathermap.org/img/wn/" + icon + "@2x.png");
//     var temperature = $("#temp");
//     temperature.text(Math.floor(data.list[0].main.temp) + units().temp);
//     // upper-right-side text with humidity, wind, air pressure, high, low
//     var humidity = $("#humidity");
//     var wind = $("#wind");
//     var airPressure = $("#air-pressure");
//     var tempHigh = $("#high-temp");
//     var tempLow = $("#low-temp");
//     humidity.text("Humidity: " + (Math.floor(data.list[0].main.humidity) + " " + units().humidPercent));
//     wind.text("Wind speed: " + (Math.floor(data.list[0].wind.speed) + units().speed));
//     airPressure.text("Air pressure: " + (Math.floor(data.list[0].main.pressure) + units().pressure)); // CONVERSION REQUIRED?!
//     tempHigh.text("High temp: " + (Math.floor(data.list[0].main.temp_max) + units().temp));
//     tempLow.text("Low temp: " + (Math.floor(data.list[0].main.temp_min) + units().temp));
//     // lower-right-side text with 5-day forecast icon, temperature
//     var fiveDay = $(".five-day");
//     // i++ on h6 elements; *7 on list location (*8 would produce one day short)
//     for (var i = 0; i < data.list.length; i ++) { // each day has 8 datasets (3hr-increment updates = 40 datasets per 5 days)
//         fiveDay.eq(i).find(".days").text((new Date((data.list[(i+1) * 7].dt) * 1000)).toDateString().split(" ")[0]) // day name
//         fiveDay.eq(i).find(".temps").text(Math.floor(data.list[(i+1) * 7].main.temp) + units().temp); // temperature
//         fiveDay.eq(i).find(".winds").text(Math.floor(data.list[(i+1) * 7].wind.speed) + units().speed); // wind speed
//         fiveDay.eq(i).find(".humidities").text(Math.floor(data.list[(i+1) * 7].main.humidity) + units().humidPercent); // humidity percentage
//     }
// }

// fetches all data from OpenWeather API
// function findWeatherByName(cityName) {
//     // variables used to fetch
//     const apiKey = "c6923045c685289a8524ccba359c3265";
//     const cityQueryUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=${measurementSystem()}`;
//     // prevents empty value from being submitted
//     // if (!cityName) { // don't need this b/c geocoordinates have IF EMPTY conditions
//     //     return alert("Please select a city to view.");
//     // }
//     fetch(cityQueryUrl)
//     // async promise function initiates AFTER fetch
//     .then(function (response) {
//         // returns JSON data
//         // add 100-500 error codes? and 200s?
//         return response.json();
//     })
//     .catch(function(error) {
//         console.log("An error occurred.");
//         console.log(error);
//     })
//     // linking JSON to DOM
//     .then(function (data) {
//         console.log(data);
//         postWeather(data);
//     })
// }
const geoCoordinates = [];

// converts user-proivded CITY NAME to longitude and latitude
function getGeocoordinates(cityName, state, country) {
    var limit = 1; // max number of cities with shared names. possible values: 1-5
    const apiKey = "c6923045c685289a8524ccba359c3265";
    const geoCodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${state},${country}&limit=${limit}&appid=${apiKey}&$lang=en`
    // prevents empty value from being submitted
    // if (!cityName || !state || !country) { // don't need this b/c geocoordinates have IF EMPTY conditions
    //     return alert("Please specify a city, state, and country to view weather.");
    // }
    fetch(geoCodeUrl)
    .then(function (response) {
        // returns JSON data
        // add 100-500 error codes? and 200s?
        return response.json();
    })
    .catch(function(error) {
        console.log("An error occurred.");
        console.log(error);
    })
    .then(function (data) {
        geoCoordinates.push(data);
        latitude = geoCoordinates[0].lat;
        longitude = geoCoordinates[0].lon;
    })
    getCityName(latitude, longitude);
    return [latitude, longitude];
}
getGeocoordinates(cityName, state, country);

// fetch longitude and latitude
function getCityName(latitude, longitude) {
    const apiKey = "c6923045c685289a8524ccba359c3265";
    const coordinateQueryUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    fetch(coordinateQueryUrl)
    .then(function (response) {
        // add 100-500 error codes? and 200s?
        return response.json();
    })
    .catch(function(error) {
        console.log("An error occurred.");
        console.log(error);
    })
    // linking JSON to DOM
    .then(function (data) {
        console.log(data);
    })
}

// collects city name to put into query
// citySearchEl.submit(function(event) {
//     event.preventDefault();
//     cityName = $("#form-text").val();
//     findWeatherByName(cityName);
// })