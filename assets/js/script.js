var cityInputEl = document.getElementById("city-input");
const appID = "wthr-"; // used for local storage...I like to have app unique keys.

// this populates the list of buttons for already queried cities
createCityHistory(cityInputEl);

// This listens for clicks anywhere in the form, buttons, etc.
cityInputEl.addEventListener("click", processClick);

// Takes in the form element where the buttons need to be
// and creates buttons for everything in local Storage.
// In the future, I may want to limit this to 10 buttons or such.
function createCityHistory(element) {

	// note, the Array.from is needed, otherwise the result changes over time!
	let historyList = Array.from(element.getElementsByClassName("city-from-history"));

	// This is used later to know if a button has already been made or not.
	let historyIdList = [];
	for (a in historyList) {
		historyIdList.push(historyList[a].id);
	}

	let keys = Object.keys(localStorage),
		i = 0,
		prevEl = document.getElementById("border-line"); // used to place the new button on top of the button-list.

	// read localStorage into lStorage - there was some funny sorting going on, so I enforce a sort by timestamp.
	let lStorage = [];
	while (i < keys.length) {
		if (keys[i].substring(0,5) === appID) {
			let stored = JSON.parse(localStorage.getItem(keys[i]));
			stored.key = keys[i];
			lStorage.push(stored);
		}
		i++;
	}

	// sort local storage to show the earliest first
	lStorage.sort(dynamicSort("timestamp"));

	i = 0; // reset the index to 0 to loop through lStorage
	while (i < lStorage.length) {

		// Change, for example, "wthr-Altanta, Georgia, US" to "Atlanta-Georgia-US"
		let btnId = lStorage[i].key.substring(5).replace(/\s/g,"").replace(/,/g,"-");
				
		// if the button already exists, ignore it for now 
		if (!historyIdList.includes(btnId)) {
			
			// create a new button for this city
			let newButton = document.createElement("button");
			newButton.type = "button";
			newButton.id = btnId;
			newButton.classList.add("city-from-history");
			newButton.textContent = lStorage[i].key.substring(5);
			newButton.dataset.lat = lStorage[i].cLat;
			newButton.dataset.lon = lStorage[i].cLon;

			prevEl.parentNode.insertBefore(newButton,prevEl.nextSibling); // place the new button on top, just after the border line.
		}
		i++;
	}
	
	// I definitely just looked this one up...but it can be passed to sort() to define the sort order.
	function dynamicSort(property) {
		var sortOrder = 1;
	
		if(property[0] === "-") { // in case I later need to sort in reverse order
			sortOrder = -1;
			property = property.substr(1);
		}
	
		return function (a,b) {
			if(sortOrder == -1){
				return b[property].localeCompare(a[property]);
			}else{
				return a[property].localeCompare(b[property]);
			}        
		}
	}

}

// This is the main listening function to process the user's input
function processClick(event) {

	// ignore irrelevant clicks
	if (!(event.target.id === "form-search" || event.target.classList.contains("city-from-history"))) {
		return;
	}

	// When the search button was pressed:
	// - Prevent screen refresh/etc
	// - Get the user entered city-name
	// - leave the entered name in place for now as it might include a typo or such
	if (event.target.id === "form-search") {
		event.preventDefault();
		let cityName = document.getElementById("city-name").value;
		verifyCityName(cityName);
		return; // request processed asynchronously
	}

	// When a historic city button was pressed:

	// Erase anything in the form input field:
	document.getElementById("city-name").value = "";

	// - Get the city name from the innerText
	var targetEl = document.getElementById(event.target.id);

	let cLat = targetEl.dataset.lat;
	let cLon = targetEl.dataset.lon;
	let searchName = targetEl.textContent;

	// this populates the weather fields on the screen through a call to the weather API.
	getWeatherFromLatLon(searchName, cLat, cLon, weatherOneCall_CallBack, errorOneCall_CallBack);
}

// This gets called when valid weather data is returned from the API
// This paints the weather data on the screen for the user.
function weatherOneCall_CallBack(data, cityName) {
	
	// set current info
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

	// assign UV indexes -- note, most locations seem to be in the green zone!
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

	// this is where the weather icons are stored -- access them here rather than download into my assets for now.
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
			if (cssClass.substring(0,3) === "bg-") { // these are just the UV classes...maybe I could have named them UV- instead!
				if (cssClass === className) {
					isSet = true;
				} else {
					// remove any UV classes that are not the one given.
					element.classList.remove(cssClass);
				}
			}
		}
		// if our given class was not already included, add it.
		if (!isSet) {element.classList.add(className)}
	}
}

function verifyCityName(cName) {
	if (cName == "") {
		errorMsg("Please enter a city name");
		return;
	}

	// this call will validate the cName and make the appropriate weather calls to populate the screen
	getWeatherFromCityName(cName, cityName_Callback, weatherOneCall_CallBack, errorOneCall_CallBack);
}

// when a valid, new city has been searched on, make a button and store the info so user can just clikc and we can use lat/lon in the future
function cityName_Callback(data) {

	searchName = `${appID}${data[0].name}, ${((data[0].state != undefined) ? data[0].state + ',' : "")} ${data[0].country}`;

	if (localStorage.getItem(searchName)) {
		// if it's already in local storage, then it already has a button and we can simply remove the input field and exit.
		inputTextEl = document.getElementById("city-name");
		inputTextEl.value = "";
		return;
	}

	// the rest simply creates the local storage and the button.
	let cData = {
		cName : data[0].name,
		cState : data[0].state,
		cCountry : data[0].country,
		cLat : data[0].lat,
		cLon : data[0].lon,
		timestamp : moment()
	}

	// remove the text from the input field.
	inputTextEl = document.getElementById("city-name");
	inputTextEl.value = "";

	// Add to local storage and display associate button
	localStorage.setItem(searchName, JSON.stringify(cData));
	createCityHistory(cityInputEl);
}

function errorOneCall_CallBack (msg) {
	msgEl = document.getElementById("modal-msg");
	// modalEl = document.getElementById("errorModal");

	msgEl.textContent = msg;
	$("#errorModal").modal(); // I can't figure out how to do this without jQuery!
}

function errorMsg (msg) {
	errorOneCall_CallBack(msg);
}
