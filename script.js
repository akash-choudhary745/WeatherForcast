const API_KEY = "9f2a16fd45c55a3814f9b31aa05dbf34";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");

const forecastGrid = document.getElementById("forecastGrid");

async function fetchWeather(city){

showLoading();

try{

const currentRes = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`);

if(!currentRes.ok) throw new Error("City not found");

const currentData = await currentRes.json();

const forecastRes = await fetch(`${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`);

const forecastData = await forecastRes.json();

updateUI(currentData,forecastData);

}

catch(err){

showError(err.message);

}

}



async function fetchWeatherByCoords(lat,lon){

showLoading();

try{

const currentRes = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);

const currentData = await currentRes.json();

const forecastRes = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);

const forecastData = await forecastRes.json();

updateUI(currentData,forecastData);

}

catch{

showError("Location weather unavailable");

}

}



function updateUI(current,forecast){

document.getElementById("cityName").textContent=current.name;

document.getElementById("weatherDesc").textContent=current.weather[0].description;

document.getElementById("currentTemp").textContent=Math.round(current.main.temp)+"°";

document.getElementById("humidity").textContent=current.main.humidity+"%";

document.getElementById("windSpeed").textContent=current.wind.speed+" m/s";


const icon=document.getElementById("weatherIcon");

icon.src=`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;


forecastGrid.innerHTML="";

const daily=[];

const seen=new Set();


forecast.list.forEach(item=>{

const date=new Date(item.dt*1000).toLocaleDateString("en-US",{weekday:"short"});

if(!seen.has(date)){

daily.push(item);

seen.add(date);

}

});


daily.slice(0,7).forEach(day=>{

const date=new Date(day.dt*1000).toLocaleDateString("en-US",{weekday:"short"});

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


hideLoading();

}



function showLoading(){

loadingState.classList.remove("hidden");

errorState.classList.add("hidden");

}



function hideLoading(){

loadingState.classList.add("hidden");

errorState.classList.add("hidden");

}



function showError(msg){

loadingState.classList.add("hidden");

errorState.classList.remove("hidden");

document.getElementById("errorMessage").textContent=msg;

}



searchBtn.addEventListener("click",()=>{

if(cityInput.value.trim())

fetchWeather(cityInput.value.trim());

});


cityInput.addEventListener("keypress",(e)=>{

if(e.key==="Enter")

fetchWeather(cityInput.value.trim());

});


locationBtn.addEventListener("click",()=>{

if(navigator.geolocation){

navigator.geolocation.getCurrentPosition(

(pos)=>fetchWeatherByCoords(pos.coords.latitude,pos.coords.longitude),

()=>fetchWeather("London")

);

}

});


window.onload=()=>{

fetchWeather("delhi");

};