const API_KEY = "9f2a16fd45c55a3814f9b31aa05dbf34";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const themeBtn = document.getElementById("themeBtn");
const voiceBtn = document.getElementById("voiceBtn");
const saveCityBtn = document.getElementById("saveCity");

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");

const forecastGrid = document.getElementById("forecastGrid");
const hourlyContainer = document.getElementById("hourlyContainer");

let chartInstance = null;


/* =========================
   FETCH WEATHER BY CITY
========================= */

async function fetchWeather(city){

showLoading();

try{

const lang=document.getElementById("langSelect").value;

const currentRes = await fetch(

`${BASE_URL}/weather?q=${city}&units=metric&lang=${lang}&appid=${API_KEY}`

);

if(!currentRes.ok){

throw new Error("City not found");

}

const currentData = await currentRes.json();

const forecastRes = await fetch(

`${BASE_URL}/forecast?q=${city}&units=metric&lang=${lang}&appid=${API_KEY}`

);

const forecastData = await forecastRes.json();

updateUI(currentData,forecastData);

fetchAQI(currentData.coord.lat,currentData.coord.lon);

}
catch(err){

showError(err.message);

}

}


/* =========================
   FETCH WEATHER BY LOCATION
========================= */

async function fetchWeatherByCoords(lat,lon){

showLoading();

try{

const currentRes = await fetch(

`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`

);

const currentData = await currentRes.json();

const forecastRes = await fetch(

`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`

);

const forecastData = await forecastRes.json();

updateUI(currentData,forecastData);

fetchAQI(lat,lon);

}
catch{

showError("Location weather unavailable");

}

}


/* =========================
   FETCH AIR QUALITY
========================= */

async function fetchAQI(lat,lon){

try{

const res = await fetch(

`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`

);

const data = await res.json();

document.getElementById("aqi").textContent = data.list[0].main.aqi;

}
catch{

document.getElementById("aqi").textContent = "--";

}

}


/* =========================
   UPDATE UI
========================= */

function updateUI(current,forecast){

hideLoading();

/* MAIN WEATHER */

document.getElementById("cityName").textContent=current.name;

document.getElementById("weatherDesc").textContent=

current.weather[0].description;

document.getElementById("currentTemp").textContent=

Math.round(current.main.temp)+"°";

document.getElementById("humidity").textContent=

current.main.humidity+"%";

document.getElementById("windSpeed").textContent=

current.wind.speed+" m/s";

document.getElementById("pressure").textContent=

current.main.pressure+" hPa";

document.getElementById("visibility").textContent=

(current.visibility/1000).toFixed(1)+" km";

document.getElementById("feelsLike").textContent=

Math.round(current.main.feels_like)+"°";

document.getElementById("feelsCard").textContent=

Math.round(current.main.feels_like)+"°";

document.getElementById("windDirection").textContent=

current.wind.deg+"°";

document.getElementById("uvIndex").textContent="Moderate";

document.getElementById("uvCard").textContent="Moderate";


/* SUNRISE SUNSET */

document.getElementById("sunrise").textContent=

new Date(current.sys.sunrise*1000).toLocaleTimeString();

document.getElementById("sunset").textContent=

new Date(current.sys.sunset*1000).toLocaleTimeString();


/* WEATHER ICON */

const icon=document.getElementById("weatherIcon");

icon.src=

`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`;


/* DYNAMIC BACKGROUND */

document.body.className="";

const weather=current.weather[0].main.toLowerCase();

if(weather.includes("rain")){

document.body.classList.add("rainy");

}
else if(weather.includes("cloud")){

document.body.classList.add("cloudy");

}
else if(weather.includes("clear")){

document.body.classList.add("sunny");

}
else{

document.body.classList.add("night");

}


/* AI RECOMMENDATIONS */

let tip="";

if(current.main.temp>40){

tip="🔥 Heatwave alert. Stay hydrated and avoid direct sunlight.";

showWeatherAlert("⚠️ Heatwave Warning");

}
else if(weather.includes("rain")){

tip="☔ Carry an umbrella today.";

showWeatherAlert("🌧 Heavy rain expected");

}
else if(current.main.temp<10){

tip="🧥 Wear warm clothes outside.";

}
else{

tip="🌤 Perfect weather for outdoor activities.";

}

document.getElementById("aiTip").textContent=tip;


/* WEEKLY FORECAST */

forecastGrid.innerHTML="";

const daily=[];
const seen=new Set();

forecast.list.forEach(item=>{

const date=new Date(item.dt*1000)

.toLocaleDateString("en-US",{weekday:"short"});

if(!seen.has(date)){

seen.add(date);

daily.push(item);

}

});

daily.slice(0,7).forEach(day=>{

const date=new Date(day.dt*1000)

.toLocaleDateString("en-US",{weekday:"short"});

const temp=Math.round(day.main.temp);

const icon=day.weather[0].icon;

const card=document.createElement("div");

card.className="forecast-card";

card.innerHTML=`

<p>${date}</p>

<img src="https://openweathermap.org/img/wn/${icon}@2x.png">

<p>${temp}°</p>

`;

forecastGrid.appendChild(card);

});


/* HOURLY FORECAST */

hourlyContainer.innerHTML="";

forecast.list.slice(0,8).forEach(item=>{

const time=item.dt_txt.split(" ")[1].slice(0,5);

const temp=Math.round(item.main.temp);

const icon=item.weather[0].icon;

hourlyContainer.innerHTML+=`

<div class="forecast-card">

<p>${time}</p>

<img src="https://openweathermap.org/img/wn/${icon}@2x.png">

<p>${temp}°</p>

</div>

`;

});


/* CHART */

createChart(forecast);


/* SAVE RECENT SEARCH */

saveRecentCity(current.name);

}


/* =========================
   CREATE TEMPERATURE CHART
========================= */

function createChart(forecast){

const labels=[];
const temps=[];

forecast.list.slice(0,8).forEach(item=>{

labels.push(item.dt_txt.split(" ")[1].slice(0,5));

temps.push(item.main.temp);

});

const ctx=document.getElementById("tempChart");

if(chartInstance){

chartInstance.destroy();

}

chartInstance = new Chart(ctx,{

type:"line",

data:{

labels:labels,

datasets:[{

label:"Temperature °C",

data:temps,

borderWidth:3,

tension:0.4,

fill:true

}]

},

options:{

responsive:true,

plugins:{

legend:{

labels:{

color:"white"

}

}

},

scales:{

x:{

ticks:{color:"white"}

},

y:{

ticks:{color:"white"}

}

}

}

});

}


/* =========================
   SAVE FAVORITES
========================= */

saveCityBtn.addEventListener("click",()=>{

const city=document.getElementById("cityName").textContent;

let favorites=

JSON.parse(localStorage.getItem("favorites")) || [];

if(!favorites.includes(city)){

favorites.push(city);

localStorage.setItem(

"favorites",

JSON.stringify(favorites)

);

displayFavorites();

alert("⭐ City Saved");

}

});


function displayFavorites(){

const favoriteContainer=

document.getElementById("favoriteCities");

favoriteContainer.innerHTML="";

const favorites=

JSON.parse(localStorage.getItem("favorites")) || [];

favorites.forEach(city=>{

const div=document.createElement("div");

div.className="favorite-city";

div.textContent=city;

div.onclick=()=>fetchWeather(city);

favoriteContainer.appendChild(div);

});

}


/* =========================
   RECENT SEARCHES
========================= */

function saveRecentCity(city){

let recent=

JSON.parse(localStorage.getItem("recentCities")) || [];

recent=recent.filter(c=>c!==city);

recent.unshift(city);

recent=recent.slice(0,5);

localStorage.setItem(

"recentCities",

JSON.stringify(recent)

);

}


/* =========================
   WEATHER ALERT
========================= */

function showWeatherAlert(message){

const alertBox=document.getElementById("weatherAlert");

alertBox.textContent=message;

alertBox.classList.remove("hidden");

setTimeout(()=>{

alertBox.classList.add("hidden");

},5000);

}


/* =========================
   LOADING
========================= */

function showLoading(){

loadingState.classList.remove("hidden");

errorState.classList.add("hidden");

}


function hideLoading(){

loadingState.classList.add("hidden");

errorState.classList.add("hidden");

}


/* =========================
   ERROR
========================= */

function showError(msg){

loadingState.classList.add("hidden");

errorState.classList.remove("hidden");

document.getElementById("errorMessage").textContent=msg;

}


/* =========================
   SEARCH EVENTS
========================= */

searchBtn.addEventListener("click",()=>{

if(cityInput.value.trim()){

fetchWeather(cityInput.value.trim());

}

});


cityInput.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

fetchWeather(cityInput.value.trim());

}

});


/* =========================
   LOCATION BUTTON
========================= */

locationBtn.addEventListener("click",()=>{

if(navigator.geolocation){

navigator.geolocation.getCurrentPosition(

(pos)=>{

fetchWeatherByCoords(

pos.coords.latitude,

pos.coords.longitude

);

},

()=>{

fetchWeather("Delhi");

}

);

}

});


/* =========================
   DARK MODE
========================= */

themeBtn.addEventListener("click",()=>{

document.body.classList.toggle("light-mode");

});


/* =========================
   VOICE SEARCH
========================= */

if("webkitSpeechRecognition" in window){

const recognition = new webkitSpeechRecognition();

recognition.lang="en-US";

voiceBtn.addEventListener("click",()=>{

recognition.start();

});

recognition.onresult=(event)=>{

const city=

event.results[0][0].transcript;

cityInput.value=city;

fetchWeather(city);

};

}


/* =========================
   AUTO LOAD
========================= */

window.onload=()=>{

displayFavorites();

fetchWeather("Delhi");

};
