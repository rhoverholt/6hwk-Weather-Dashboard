var cityInputEl = document.getElementById("city-input");
var cityName; // set when searching, and used when displaying

cityInputEl.addEventListener("click", processClick);


function processClick(event) {

	// ignore irrelevant clicks
	if (!(event.target.id === "form-search" || event.target.classList.contains("city-from-history"))) {
		return;
	}

	// When the search button was pressed:
	// - Prevent screen refresh/etc
	// - Get the user entered city-name
	if (event.target.id === "form-search") {
		event.preventDefault();
		cityName = document.getElementById("city-name").value;
	}

	// When a historic city button was pressed:
	// - Get the city name from the innerText
	else {
		cityName = event.target.innerText;
	}

	if (cityName == "") {
		errorMsg("Please enter a city name");
		return;
	}

	getWeatherInfo(cityName, weatherOneCall_CallBack, errorOneCall_CallBack);
}

function weatherOneCall_CallBack(data) {

	// set current info
	cityNameEl = document.getElementById("city-info-hdr");
	cityTempEl = document.getElementById("city-temp");
	cityWindEl = document.getElementById("city-wind");
	cityHumidityEl = document.getElementById("city-humidity");
	cityUVIndexEl = document.getElementById("city-UV");

	cityNameEl.textContent = cityName;
	cityTempEl.textContent = data.current.temp + " F";
	cityWindEl.textContent = data.current.wind_speed + " MPH";
	cityHumidityEl.textContent = data.current.humidity + "%";
	cityUVIndexEl.textContent = data.current.uvi;

	// set 5-day forecast
	for (let day=0; day < 5; day++) {
		forecastDateEl = document.getElementById(`day-${day+1}-date`);
		forecastTempEl = document.getElementById(`day-${day+1}-temp`);
		forecastWindEl = document.getElementById(`day-${day+1}-wind`);
		forecastHumidityEl = document.getElementById(`day-${day+1}-humidity`);

		forecastDateEl.textContent = `Day ${day+1}`;
		forecastTempEl.textContent = data.daily[day].temp.day + " F";
		forecastWindEl.textContent = data.daily[day].wind_speed + " MPH";
		forecastHumidityEl.textContent = data.daily[day].humidity + "%";

		console.log(data.daily[day]);
		console.log(forecastTempEl);
	}

}

function errorOneCall_CallBack (msg) {
	console.log("One Call Error: " + msg);
}

function errorMsg (msg) {
	console.log(msg);
}
