const cityInput = document.getElementById("cityInput");

async function getWeather() {

    const city = cityInput.value.trim();

    const error = document.getElementById("error");

    if (city === "") {
        error.textContent = "Please enter a city name.";
        return;
    }

    error.textContent = "";

    try {

        // Find the city's latitude and longitude
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found.");
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        const cityName = location.name;
        const country = location.country;

        // Get weather
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
            `&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        const weatherData = await weatherResponse.json();

        displayWeather(
            cityName,
            country,
            weatherData
        );

    } catch (error) {

        console.error(error);

        document.getElementById("error").textContent =
            "Unable to find weather. Please check the city name.";

    }
}


function displayWeather(city, country, data) {

    const current = data.current;

    document.getElementById("city").textContent =
        `${city}, ${country}`;

    document.getElementById("temperature").textContent =
        `${Math.round(current.temperature_2m)}°C`;

    document.getElementById("humidity").textContent =
        `${current.relative_humidity_2m}%`;

    document.getElementById("wind").textContent =
        `${current.wind_speed_10m} km/h`;

    document.getElementById("feels").textContent =
        `${Math.round(current.apparent_temperature)}°C`;

    document.getElementById("description").textContent =
        getWeatherDescription(current.weather_code);

    document.getElementById("weatherIcon").textContent =
        getWeatherIcon(current.weather_code);

    displayForecast(data.daily);
}


function displayForecast(daily) {

    const forecastContainer =
        document.getElementById("forecast");

    forecastContainer.innerHTML = "";

    // Show next 5 days
    for (let i = 0; i < 5; i++) {

        const date = new Date(daily.time[i]);

        const dayName = date.toLocaleDateString(
            "en-US",
            {
                weekday: "short"
            }
        );

        const maxTemp =
            Math.round(daily.temperature_2m_max[i]);

        const minTemp =
            Math.round(daily.temperature_2m_min[i]);

        const icon =
            getWeatherIcon(daily.weather_code[i]);

        const card = document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <h3>${dayName}</h3>

            <div class="forecast-icon">
                ${icon}
            </div>

            <p class="temp">
                ${maxTemp}° / ${minTemp}°
            </p>

            <p>
                ${getWeatherDescription(daily.weather_code[i])}
            </p>
        `;

        forecastContainer.appendChild(card);
    }
}


function getWeatherDescription(code) {

    const weatherCodes = {

        0: "Clear sky",

        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",

        45: "Foggy",
        48: "Rime fog",

        51: "Light drizzle",
        53: "Drizzle",
        55: "Heavy drizzle",

        61: "Light rain",
        63: "Rain",
        65: "Heavy rain",

        71: "Light snow",
        73: "Snow",
        75: "Heavy snow",

        80: "Rain showers",
        81: "Rain showers",
        82: "Heavy rain showers",

        95: "Thunderstorm",

        96: "Thunderstorm with hail",
        99: "Thunderstorm with heavy hail"
    };

    return weatherCodes[code] || "Unknown weather";
}


function getWeatherIcon(code) {

    if (code === 0) {
        return "☀️";
    }

    if (code === 1 || code === 2) {
        return "🌤️";
    }

    if (code === 3) {
        return "☁️";
    }

    if (code === 45 || code === 48) {
        return "🌫️";
    }

    if (
        code >= 51 &&
        code <= 67
    ) {
        return "🌧️";
    }

    if (
        code >= 71 &&
        code <= 77
    ) {
        return "❄️";
    }

    if (
        code >= 80 &&
        code <= 82
    ) {
        return "🌦️";
    }

    if (
        code >= 95
    ) {
        return "⛈️";
    }

    return "🌤️";
}


// Press Enter to search
cityInput.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        getWeather();
    }

});
