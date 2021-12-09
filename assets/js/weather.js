// This is my account specific key to access the weather data.  It should really be hidden somewhere, but is publicly accessible via this file,
const apiKey = "&appid=2d0af2f2d383f295249a72ce853cc36b";

// This is the primary URL that all the weather API's start from.
const weatherUrlPrefix = "https://api.openweathermap.org/";

//oneCall requires lat/lon to query
const oneCallUrl = weatherUrlPrefix + "data/2.5/onecall";
const oneCallParams = "units=imperial&exclude=minutely,hourly" + apiKey;

// geocode can translate a city name into a lat/lon so that oneCall can be used
const geocodeUrl = weatherUrlPrefix + "geo/1.0/direct";
const geocodeParams = "limit=5" + apiKey; // I could later implement logic to allow the user to select which city they desired.

// This is an exported function that allows callers to retrieve weather given the noted inputs.
// Note, the last two inputs are functions so the calling app can perform operations on these asynchronous results
function getWeatherFromLatLon(cName, lat, lon, callbackFun, errorCallback) {
    requestUrl = oneCallUrl + `?lat=${lat}&lon=${lon}&${oneCallParams}`;

    fetch(requestUrl)
	.then (function (response) {
		if (response.status != 200) {
			errorCallback("Weather currently unavailable.  OneCall Response Code: " + response.status);
			return;
		}
		return (response.json());
	})
	.then (function (data) {
		if (data != null) {callbackFun(data, cName)}
		else {errorCallback("Weather returned empty data")}
	});
}

// This function first gets the lat/lon for a given cName, then calls the above function to return the actual weather data
// Note, this is handled asynchronously, so must be supplied callback functions for the calling app to be able to process the data.
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

		getWeatherFromLatLon(cityName, lat, lon, callbackFun, errorCallback);
	}
}