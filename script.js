const apiKey = '6e37badf1f30e16608cb39cbc37acaf4';
const searchButton = document.getElementById('search-button');
const cityInput = document.getElementById('city-input');
const weatherInfo = document.getElementById('weather-info');
const forecastContainer = document.getElementById('forecast');
const loadingIndicator = document.createElement('p');

loadingIndicator.textContent = 'Loading...';
loadingIndicator.style.display = 'none';
document.body.appendChild(loadingIndicator);

// Get geolocation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    enableGeolocation();
});

// Function to enable geolocation
function enableGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Success callback for geolocation
function onLocationSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    fetchWeatherByCoordinates(latitude, longitude);
    updateCurrentTime(latitude, longitude);
}

// Error callback for geolocation
function onLocationError(error) {
    console.error("Geolocation error:", error);
    weatherInfo.innerHTML = `<p>Could not retrieve location. Please search for a city.</p>`;
}

// Fetch weather using city input
searchButton.addEventListener('click', () => {
    const city = cityInput.value;
    fetchWeather(city);
    fetchForecast(city);
});

// Show loading indicator
function showLoading() {
    loadingIndicator.style.display = 'block';
}

// Hide loading indicator
function hideLoading() {
    loadingIndicator.style.display = 'none';
}

// Fetch weather by city name
function fetchWeather(city) {
    showLoading();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            displayWeather(data);
        })
        .catch(error => {
            hideLoading();
            weatherInfo.innerHTML = `<p>${error.message}</p>`;
            forecastContainer.innerHTML = '';
        });
}

// Fetch weather by coordinates
function fetchWeatherByCoordinates(lat, lon) {
    showLoading();
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to retrieve weather data');
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            displayWeather(data);
        })
        .catch(error => {
            hideLoading();
            weatherInfo.innerHTML = `<p>${error.message}</p>`;
            forecastContainer.innerHTML = '';
        });
}

// Function to update background color based on weather condition
function updateBackground(condition) {
    const body = document.body;

    switch (condition) {
        case 'clear sky':
            body.style.backgroundColor = '#87CEEB'; // Light blue
            break;
        case 'few clouds':
            body.style.backgroundColor = '#B0C4DE'; // Light steel blue
            break;
        case 'scattered clouds':
            body.style.backgroundColor = '#D3D3D3'; // Light grey
            break;
        case 'broken clouds':
            body.style.backgroundColor = '#A9A9A9'; // Dark grey
            break;
        case 'shower rain':
        case 'rain':
            body.style.backgroundColor = '#4682B4'; // Steel blue
            break;
        case 'thunderstorm':
            body.style.backgroundColor = '#2F4F4F'; // Dark slate grey
            break;
        case 'snow':
            body.style.backgroundColor = '#FFFFFF'; // White
            break;
        case 'mist':
            body.style.backgroundColor = '#B0E0E6'; // Powder blue
            break;
        default:
            body.style.backgroundColor = '#F0F8FF'; // Alice blue
            break;
    }
}

// Display weather data
function displayWeather(data) {
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const condition = data.weather[0].description;
    const icon = data.weather[0].icon;

    // Update background color based on weather condition
    updateBackground(condition);

    weatherInfo.innerHTML = `
        <h2>${data.name}</h2>
        <img src="http://openweathermap.org/img/w/${icon}.png" alt="${condition}">
        <p><i class="fas fa-temperature-high"></i> Temperature: ${temp}°C</p>
        <p><i class="fas fa-water"></i> Humidity: ${humidity}%</p>
        <p><i class="fas fa-wind"></i> Wind Speed: ${windSpeed} m/s</p>
        <p>Condition: ${condition}</p>
    `;
}

// Fetch 5-day weather forecast
function fetchForecast(city) {
    showLoading();
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            displayForecast(data);
        })
        .catch(error => {
            hideLoading();
            forecastContainer.innerHTML = `<p>${error.message}</p>`;
        });
}

// Display the 5-day forecast
function displayForecast(data) {
    forecastContainer.innerHTML = '';

    for (let i = 0; i < data.list.length; i += 8) {
        const dayData = data.list[i];
        const temp = dayData.main.temp.toFixed(1);
        const icon = dayData.weather[0].icon;
        const date = new Date(dayData.dt * 1000).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <p class="forecast-date">${date}</p>
            <img src="http://openweathermap.org/img/w/${icon}.png" alt="Weather icon">
            <p>${temp}°C</p>
        `;
        forecastContainer.appendChild(forecastItem);
    }
}

// Function to update and display current time
function updateCurrentTime(latitude, longitude) {
    const timezoneUrl = `https://api.openweathermap.org/data/2.5/timezone?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    fetch(timezoneUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to retrieve timezone');
            }
            return response.json();
        })
        .then(data => {
            const now = new Date();
            const localTime = new Date(now.getTime() + (data.dst_offset + data.raw_offset) * 1000);
            const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
            const timeString = localTime.toLocaleTimeString([], options);
            document.getElementById('current-time').innerHTML = `<i class="fas fa-clock"></i> Current Time: ${timeString}`;
        })
        .catch(error => {
            console.error("Error fetching timezone:", error);
        });
}

// Initial call to set the time immediately
updateCurrentTime();
setInterval(updateCurrentTime, 1000);
