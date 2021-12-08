var cityInputEl = document.getElementById("city-input");
const appID = "wthr-"

// this populates any already visited cities -- to a max of 10.
createCityHistory(cityInputEl);

// This is the entire Form
cityInputEl.addEventListener("click", processClick);

function createCityHistory(element) {

	let historyList = Array.from(element.getElementsByClassName("city-from-history"));

	let historyIdList = [];

	for (a in historyList) {
		historyIdList.push(historyList[a].id);
	}

	let keys = Object.keys(localStorage),
		i = 0,
		prevEl = document.getElementById("border-line");

	while (i < keys.length) {
		if (keys[i].substring(0,5) === appID) {
			let data = JSON.parse(localStorage.getItem(keys[i]));
			let btnId = keys[i].substring(5).replace(/\s/g,"").replace(/,/g,"-");
					
			// ensure the button doesn't already exist before creating it
			if (!historyIdList.includes(btnId)) {
				
				let newButton = document.createElement("button");
				newButton.type = "button";
				newButton.id = btnId;
				newButton.classList.add("city-from-history");
				newButton.textContent = keys[i].substring(5);
				newButton.dataset.lat = data.cLat;
				newButton.dataset.lon = data.cLon;

				prevEl.parentNode.insertBefore(newButton,prevEl.nextSibling);
			}
		}
		i++;
	}
}

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
		let cityName = document.getElementById("city-name").value;
		verifyCityName(cityName);
		return; // request processed asynchronously
	}

	// When a historic city button was pressed:
	// - Get the city name from the innerText
	var targetEl = document.getElementById(event.target.id);

	let cLat = targetEl.dataset.lat;
	let cLon = targetEl.dataset.lon;
	let searchName = targetEl.textContent;

	getWeatherFromLatLon(searchName, cLat, cLon, weatherOneCall_CallBack, errorOneCall_CallBack);
}

function weatherOneCall_CallBack(data, cityName) {
	// set current info

	console.log(data);

	cityNameEl = document.getElementById("city-info-hdr");
	cityTempEl = document.getElementById("city-temp");
	cityWindEl = document.getElementById("city-wind");
	cityHumidityEl = document.getElementById("city-humidity");
	cityUVIndexEl = document.getElementById("city-UV");
	cityIconEl = document.getElementById("current-icon");
	
	var currDate = moment();

	cityNameEl.textContent = cityName + " (" + currDate.format("MMMM Do, YYYY)");
	cityTempEl.textContent = data.current.temp + " °F";
	cityWindEl.textContent = data.current.wind_speed + " MPH";
	cityHumidityEl.textContent = data.current.humidity + "%";
	cityUVIndexEl.textContent = data.current.uvi;
	
	if (cityUVIndexEl.textContent < 3) {
		setUVclass(cityUVIndexEl, "bg-green");
	} else if (cityUVIndexEl.textContent < 6) {
		setUVclass(cityUVIndexEl, "bg-yellow");
	} else if (cityUVIndexEl.textContent < 8) {
		setUVclass(cityUVIndexEl, "bg-orange");
	} else if (cityUVIndexEl.textContent < 11) {
		setUVclass(cityUVIndexEl, "bg-red");
	} else {
		setUVclass(cityUVIndexEl, "bg-purple");
	}

	var iconSrc = "http://openweathermap.org/img/wn/" + data.current.weather[0].icon.substring(0,2) + "d@2x.png";
	cityIconEl.src = iconSrc;
	cityIconEl.alt = data.current.weather[0].main;

	// set 5-day forecast
	for (let day=0; day < 5; day++) {

		forecastDateEl = document.getElementById(`day-${day+1}-date`);
		forecastIconEl = document.getElementById(`day-${day+1}-icon`);
		forecastTempEl = document.getElementById(`day-${day+1}-temp`);
		forecastWindEl = document.getElementById(`day-${day+1}-wind`);
		forecastHumidityEl = document.getElementById(`day-${day+1}-humidity`);

		forecastDateEl.textContent = currDate.add(1, 'days').format("L");
		forecastTempEl.textContent = data.daily[day].temp.day + " °F";
		forecastWindEl.textContent = data.daily[day].wind_speed + " MPH";
		forecastHumidityEl.textContent = data.daily[day].humidity + "%";


		var iconSrc = "http://openweathermap.org/img/wn/" + data.daily[day].weather[0].icon.substring(0,2) + "d@2x.png";
		forecastIconEl.src = iconSrc;
		forecastIconEl.alt = data.daily[day].weather[0].main;
	}

	function setUVclass(element, className) {
		isSet = false;
		for (let cssClass of element.classList) {
			if (cssClass.substring(0,3) === "bg-") {
				if (cssClass === className) {
					isSet = true;
				} else {
					element.classList.remove(cssClass);
				}
			}
		}
		if (!isSet) {element.classList.add(className)}
	}
}

function verifyCityName(cName) {
	if (cName == "") {
		errorMsg("Please enter a city name");
		return;
	}

	getWeatherFromCityName(cName, cityName_Callback, weatherOneCall_CallBack, errorOneCall_CallBack);
	
}

function cityName_Callback(data) {

	searchName = `${appID}${data[0].name}, ${((data[0].state != undefined) ? data[0].state + ',' : "")} ${data[0].country}`;

	if (localStorage.getItem(searchName)) {
		errorMsg(`${searchName} is already in local storage`);
		return;
	}

	let cData = {
		cName : data[0].name,
		cState : data[0].state,
		cCountry : data[0].country,
		cLat : data[0].lat,
		cLon : data[0].lon
	}

	localStorage.setItem(searchName, JSON.stringify(cData));
	createCityHistory(cityInputEl);
};

function errorOneCall_CallBack (msg) {
	console.log("One Call Error: " + msg);
}

function errorMsg (msg) {
	console.log(msg);
}
