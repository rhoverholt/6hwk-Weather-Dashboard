const apiKey = "&appid=2d0af2f2d383f295249a72ce853cc36b";

const weatherUrlPrefix = "https://api.openweathermap.org/";

//oneCall requires lat/lon to query
//?lat=nnn&lon=nnn
const oneCallUrl = "data/2.5/onecall";
const oneCallParams = "units=imperial&exclude=minutely,hourly" + apiKey;

//forecast can use a variety of city; city,st; zip; city,st,country;
//?q=
const forecastUrl = "data/2.5/forecast";
const forecastParams = "units=imperial" + apiKey;

const latLonTest = "?lat=40.12&lon=-96.66&exclude=minutely,hourly";
const cityTest = "?q=Atlanta,ga,us&units=imperial";

function callOneCallUrl(lat, lon, callbackFun) {
    requestUrl = weatherUrlPrefix + oneCallUrl + `?lat=${lat}&lon=${lon}&${oneCallParams}`;
    console.log(requestUrl);
    fetch(requestUrl)
	.then (function (response) {
		console.log(response.status);
		return (response.json());
	})
	.then (function (data) {
		console.log(data);
        callbackFun(data);
	});
}

function getWeatherInfo(city, callbackFun) {
    return callOneCallUrl(40.12, -96.66, callbackFun);
}

function testWeather(city) {
    console.log(city);
}

// requestUrl = forecastUrl + cityTest + apiKey;
// getWeather(requestUrl);

// getting a city ID from a name, st, cntry:
// http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}