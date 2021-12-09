const apiKey = "&appid=2d0af2f2d383f295249a72ce853cc36b";

const weatherUrlPrefix = "https://api.openweathermap.org/";

//oneCall requires lat/lon to query
//?lat=nnn&lon=nnn
const oneCallUrl = weatherUrlPrefix + "data/2.5/onecall";
const oneCallParams = "units=imperial&exclude=minutely,hourly" + apiKey;

const geocodeUrl = weatherUrlPrefix + "geo/1.0/direct";
const geocodeParams = "limit=5" + apiKey;


function getWeatherFromLatLon(cName, lat, lon, callbackFun, errorCallback) {
    requestUrl = oneCallUrl + `?lat=${lat}&lon=${lon}&${oneCallParams}`;

    fetch(requestUrl)
	.then (function (response) {
		if (response.status != 200) {
			errorCallback("Weather currently unavailable.  Response Code: " + response.status);
			return;
		}
		return (response.json());
	})
	.then (function (data) {
		if (data != null) {callbackFun(data, cName)}
		else {errorCallback("Weather returned empty data")}
	});
}

function getWeatherFromCityName(cName, geoCallbackFun, callbackFun, errorCallback) {

	// fetch the geocode info
	requestUrl = geocodeUrl + "?q=" + cName + "&" + geocodeParams;

	fetch(requestUrl)
	.then (function (response) {
		if (response.status != 200) {
			errorCallback("Weather currently unavailable.  Geocoding Response Code: " + response.status);
			return;
		}
		return (response.json());
	})
	.then (function (data) {
		if (data != null) {geocodeCallback(data)}
		else {errorCallback("Weather returned empty data")}
	});

	function geocodeCallback(data) {

		if (data.length === 0) {
			errorCallback("Invalid city entry");
			return;
		}

		geoCallbackFun(data);
		let lat = data[0].lat;
		let lon = data[0].lon;
		let cityName = `${data[0].name}, ${(data[0].state ? data[0].state + ',' : "")} ${data[0].country}`;

		return getWeatherFromLatLon(cityName, lat, lon, callbackFun, errorCallback);
	}
}

// requestUrl = forecastUrl + cityTest + apiKey;
// getWeather(requestUrl);

// getting a city ID from a name, st, cntry:
// http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}