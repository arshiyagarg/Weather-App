const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const grantAccess = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-SearchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const notFoundClass = document.querySelector(".not-found-page");

let currentTab = userTab;
const API_key = "57dceb3ee57d3ede95531e9c9e636dc8";
currentTab.classList.add("current-tab");

getUserWeatherFromSession();

userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));



function storeInSessionStorage(key, data) {
    sessionStorage.setItem(key, JSON.stringify(data));
}



function getFromSessionStorage(key) {
    const data = sessionStorage.getItem(key);
    if(data){
        return JSON.parse(data);
    }
    return null;
}



function switchTab(tab) {
    if (tab !== currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = tab;
        currentTab.classList.add("current-tab");

        if (tab === searchTab) {
            searchForm.classList.add("active");
            grantAccess.classList.remove("active");
            userInfoContainer.classList.remove("active");
            notFoundClass.classList.remove("active");
            loadingScreen.classList.remove("active");
        } 
        else {
            userInfoContainer.classList.remove("active");
            notFoundClass.classList.remove("active");
            loadingScreen.classList.remove("active");
            searchForm.classList.remove("active");
            getUserWeatherFromSession();
        }
    }
}



function getUserWeatherFromSession() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");

    if (!localCoordinates) {
        grantAccess.classList.add("active");
        return;
    }

    const coordinates = JSON.parse(localCoordinates);
    const cachedData = getFromSessionStorage(`weather_${coordinates.lat}_${coordinates.lon}`);

    if (cachedData) {
        renderWeatherInfo(cachedData);
    } 
    else {
        fetchUserWeatherInfo(coordinates);
    }
}



async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;

    const cachedData = getFromSessionStorage(`weather_${lat}_${lon}`);
    if (cachedData) {
        renderWeatherInfo(cachedData);
        return;
    }

    grantAccess.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`
        );
        if (!response.ok) {
            showNotFound();
            return;
        }

        let data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        storeInSessionStorage(`weather_${lat}_${lon}`, data);
        renderWeatherInfo(data);
    } 
    catch (error) {
        showNotFound();
    }
}


function showNotFound() {
    notFoundClass.classList.add("active");

    setTimeout(() => {
        notFoundClass.classList.remove("active");
    }, 3000);
}



function renderWeatherInfo(data) {
    if (!data) {
        showNotFound();
        return;
    }

    userInfoContainer.classList.add("active");

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-WeatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-clouds]");

    cityName.innerText = data.name;
    countryIcon.src = `https://flagcdn.com/144x108/${data.sys.country.toLowerCase()}.png`;
    desc.innerText = data.weather[0].description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    temp.innerText = `${data.main.temp.toFixed(2)} °C`;
    windspeed.innerText = `${data.wind.speed} m/s`;
    humidity.innerText = `${data.main.humidity} %`;
    cloudiness.innerText = `${data.clouds.all} %`;
}


const grantAccessBtn = document.querySelector("[data-GrantAccess]");
grantAccessBtn.addEventListener("click", getLocation);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } 
    else {
        alert("Location Access not available");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}



const searchInput = document.querySelector("[data-SearchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value.trim();
    if (cityName === "") return;
    fetchSearchWeatherInfo(cityName);
});



async function fetchSearchWeatherInfo(city) {
    const cachedData = getFromSessionStorage(`weather_${city}`);
    if (cachedData) {
        renderWeatherInfo(cachedData);
        return;
    }

    loadingScreen.classList.add("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`
        );
        if (!response.ok) {
            showNotFound();
            return;
        }

        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        storeInSessionStorage(`weather_${city}`, data);
        renderWeatherInfo(data);
    } 
    catch (error) {
        showNotFound();
    }
}
