// API Keys.
const WEATHER_API_KEY = 'f4263c2cc70bf0b69dc84a4c38ca0e14';
const GEMINI_API_KEY = 'AIzaSyCCVppZXr20Pz28-o15xByl-fk-2YHn8Xg';

// DOM Elements.
const cityInput = document.getElementById('cityInput');
const weatherWidget = document.getElementById('weatherWidget');
const dashboardLink = document.getElementById('dashboardLink');
const tablesLink = document.getElementById('tablesLink');
const dashboardSection = document.getElementById('dashboard');
const tablesSection = document.getElementById('tables');
const weatherTable = document.getElementById('weatherTable');
const pagination = document.getElementById('pagination');
const sendButton = document.getElementById('send-query');
const userInput = document.getElementById('user-query');
const chatbotResponse = document.getElementById('chatbot-response');
const getWeatherBtn = document.getElementById('getWeatherBtn');

// Chart instances.
let tempBarChart, weatherDonutChart, tempLineChart;

// Weather data.
let currentWeatherData = null;
let forecastData = null;

// Pagination variables.
const itemsPerPage = 10;
let currentPage = 1;
let currentData = [];

// Temperature Unit .
let currentUnit = 'metric'; 

// Main initialization.
document.addEventListener('DOMContentLoaded', () => 
{
    initializeElements();
    initializeCharts();
    setupEventListeners();
    
    // Get user's location.
    if (navigator.geolocation) 
    {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    }

    // Profile card functionality.
    const userProfile = document.querySelector('.user-profile');
    const profileCard = document.querySelector('.profile-card');
    const closeProfileCard = document.querySelector('#closeProfileCard');
    const overlay = document.querySelector('.overlay');

    function toggleProfileCard() 
    {
        profileCard.classList.toggle('hidden');
        overlay.classList.toggle('hidden');
    }

    userProfile.addEventListener('click', toggleProfileCard);
    overlay.addEventListener('click', toggleProfileCard);
    closeProfileCard.addEventListener('click', toggleProfileCard);

});

function initializeElements() 
{
    
    // Verify that all required DOM elements exist.
    const requiredElements = 
    [
        cityInput, weatherWidget, weatherTable, pagination,
        sendButton, userInput, chatbotResponse, getWeatherBtn
    ];
    
    if (requiredElements.some(element => !element)) 
    {
        console.error('Some required DOM elements are missing');
    }
}

function setupEventListeners() 
{
    
    // City input events.
    cityInput.addEventListener('keypress', (event) => 
    {
        if (event.key === 'Enter') 
        {
            fetchWeatherData(cityInput.value);
        }
    });

    // Get Weather button click.
    getWeatherBtn.addEventListener('click', () => 
    {
        const city = cityInput.value;
        if (city) 
        {
            fetchWeatherData(city);
        }
    });

    // Navigation events.
    dashboardLink.addEventListener('click', showDashboard);
    tablesLink.addEventListener('click', showTables);

    // Chatbot events.
    sendButton.addEventListener('click', () => 
    {
        const question = userInput.value;
        if (question.trim() !== '') 
        {
            handleQuery(question);
            userInput.value = '';
        } 
        
        else 
        {
            displayChatbotResponse('Please enter a question.');
        }
    });

    // Sort and filter events.
    document.getElementById('sortSelect')?.addEventListener('change', handleSort);
    document.getElementById('filterSelect')?.addEventListener('change', handleFilter);
    document.getElementById('sortAscBtn')?.addEventListener('click', () => sortTemperatures('asc'));
    document.getElementById('sortDescBtn')?.addEventListener('click', () => sortTemperatures('desc'));
    document.getElementById('filterRainBtn')?.addEventListener('click', filterRainyDays);
    document.getElementById('highestTempBtn')?.addEventListener('click', showHighestTemperatureDay);
}

// Geolocation handlers.
function successCallback(position) 
{
    const { latitude, longitude } = position.coords;
    fetchWeatherDataByCoords(latitude, longitude);
}

function errorCallback(error) 
{
    console.error("Error getting location:", error.message);
}

// Weather API functions.
async function fetchWeatherData(city, units = 'metric') 
{
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');

    try 
    {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=${units}`);
        const data = await response.json();

        if (loadingSpinner) loadingSpinner.classList.add('hidden');

        if (data.cod !== 200) 
        {
            throw new Error(data.message);
        }

        currentWeatherData = data;
        displayWeatherData(data);
        await fetchFiveDayForecastByCoords(data.coord.lat, data.coord.lon, units);
    } 
    
    catch (error) 
    {
        console.error('Error fetching weather data:', error);
        alert(`Error: ${error.message}`);
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
    }
}

async function fetchWeatherDataByCoords(lat, lon, units = 'metric') 
{
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
    
    try 
    {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${units}`);
        const data = await response.json();
        
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        
        if (data.cod !== 200) 
        {
            throw new Error(data.message);
        }

        currentWeatherData = data;
        displayWeatherData(data);
        await fetchFiveDayForecastByCoords(lat, lon, units);
    } 
    
    catch (error) 
    {
        console.error('Error fetching weather data:', error);
        alert(`Error: ${error.message}`);
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
    }
}

async function fetchFiveDayForecastByCoords(lat, lon, units = 'metric') 
{
    try 
    {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${units}`);
        const data = await response.json();

        if (data.cod !== "200") 
        {
            throw new Error('Unable to fetch 5-day forecast data.');
        }

        forecastData = data;
        const { tempData, labels, weatherData } = processChartData(data);
        updateCharts(tempData, labels, weatherData);
        updateWeatherTable(data);

    } 
    
    catch (error) 
    {
        console.error('Error fetching forecast:', error);
    }
}

// Display functions.
function displayWeatherData(data) 
{
    const weatherCondition = data.weather[0].description.toLowerCase();
    let widgetBackground = 'default-bg';
    
    // Set background based on weather condition.
    if (weatherCondition.includes('cloud')) 
    {
        widgetBackground = 'cloudy-bg';
    } 
    
    else if (weatherCondition.includes('rain')) 
    {
        widgetBackground = 'rainy-bg';
    } 
    
    else if (weatherCondition.includes('clear')) 
    {
        widgetBackground = 'clear-sky-bg';
    }
    
    else if (weatherCondition.includes('snow')) 
    {
        widgetBackground = 'snowy-bg';
    }

    weatherWidget.className = `weather-widget ${widgetBackground}`;

    const iconCode = data.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Convert temperature if needed.
    const temp = data.main.temp;
    let tempC = currentUnit === 'metric' ? temp : (temp - 32) * 5/9;
    let tempF = currentUnit === 'imperial' ? temp : (temp * 9/5) + 32;

    // Convert wind speed.
    let windSpeed = data.wind.speed;
    let windSpeedUnit = currentUnit === 'metric' ? 'm/s' : 'mph';
    if (currentUnit === 'imperial') 
        {
    }

    weatherWidget.innerHTML = `
        <div class="weather-header">
            <h2>Weather in ${data.name}</h2>
           <div class="unit-toggle">
                <input type="checkbox" id="unitToggle" class="toggle-checkbox" ${currentUnit === 'imperial' ? 'checked' : ''}>
                <label for="unitToggle" class="toggle-label">
                    <span class="toggle-inner"></span>
                    <span class="toggle-switch"></span>
                </label>
                <span class="unit-text">°C</span>
                <span class="unit-text">°F</span>
            </div>
        </div>
        <div class="weather-content">
            <img src="${iconUrl}" alt="Weather Icon" class="weather-icon">
                <p class="temperature">
                <strong>Temperature:</strong> 
                <span class="temp-value">
                    ${currentUnit === 'metric' ? 
                        `${tempC.toFixed(2)}°C ` : 
                        `${tempF.toFixed(2)}°F `
                    }
                </span>
            </p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Weather:</strong> ${data.weather[0].description}</p>
        <p><strong>Wind Speed:</strong> ${windSpeed} ${windSpeedUnit}</p>
        </div>
    `;

    // Add event listeners to the toggle buttons.
    const unitToggle = weatherWidget.querySelector('#unitToggle');
    unitToggle.addEventListener('change', handleUnitToggle);

}

// Update the handleUnitToggle function.
function handleUnitToggle(event) 
{
    const newUnit = event.target.checked ? 'imperial' : 'metric';
    if (newUnit !== currentUnit) 
    {
        currentUnit = newUnit;
        
        // Re-fetch weather data with new unit.
        if (currentWeatherData) 
        {
            fetchWeatherData(currentWeatherData.name, currentUnit);
        }
    }
}

// Table functions.
function updateWeatherTable(data) 
{
    if (!data || !data.list) 
    {
        weatherTable.innerHTML = '<p>No forecast data available</p>';
        return;
    }

    currentData = data.list.map(item => 
    ({
        date: new Date(item.dt * 1000).toLocaleDateString(),
        temp: item.main.temp,
        humidity: item.main.humidity,
        weather: item.weather[0].description,
        windSpeed: currentUnit === 'metric' ? item.wind.speed : (item.wind.speed ).toFixed(2)
    }));

    renderTable();
    renderPagination();
}

function renderTable() 
{
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = currentData.slice(start, end);

    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    const windSpeedUnit = currentUnit === 'metric' ? 'm/s' : 'mph';

    const tableRows = pageData.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.temp}°C</td>
            <td>${item.humidity}%</td>
            <td>${item.weather}</td>
            <td>${item.windSpeed} ${windSpeedUnit}</td>
        </tr>
    `).join('');

    weatherTable.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Temperature (${tempUnit})</th>
                    <th>Humidity (%)</th>
                    <th>Weather</th>
                     <th>Wind Speed (${windSpeedUnit})</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

function renderPagination() 
{
    const pageCount = Math.ceil(currentData.length / itemsPerPage);
    let paginationHTML = '';

    for (let i = 1; i <= pageCount; i++) 
    {
        paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    pagination.innerHTML = paginationHTML;
}

// Navigation functions.
function showDashboard(e) 
{
    e.preventDefault();
    dashboardSection.classList.remove('hidden-section');
    dashboardSection.classList.add('active-section');
    tablesSection.classList.remove('active-section');
    tablesSection.classList.add('hidden-section');
}

function showTables(e) 
{
    e.preventDefault();
    tablesSection.classList.remove('hidden-section');
    tablesSection.classList.add('active-section');
    dashboardSection.classList.remove('active-section');
    dashboardSection.classList.add('hidden-section');
}

// Sort and filter functions.
function handleSort(event) 
{
    const order = event.target.value;
    if (order) 
    {
        sortTemperatures(order);
    } 
    
    else 
    {
        updateWeatherTable(forecastData);
    }
}

function handleFilter(event) 
{
    const filter = event.target.value;
    
    if (filter === 'rain') 
    {
        filterRainyDays();
    } 
    
    else if (filter === 'highest') 
    {
        showHighestTemperatureDay();
    } 
    
    else 
    {
        updateWeatherTable(forecastData);
    }
}

function sortTemperatures(order) 
{
    currentData.sort((a, b) => order === 'asc' ? a.temp - b.temp : b.temp - a.temp);
    currentPage = 1;
    renderTable();
    renderPagination();
}

function filterRainyDays() 
{
    currentData = currentData.filter(item => item.weather.toLowerCase().includes('rain'));
    currentPage = 1;
    renderTable();
    renderPagination();
}

function showHighestTemperatureDay() 
{
    const highestTemp = currentData.reduce((max, item) => item.temp > max.temp ? item : max);
    currentData = [highestTemp];
    currentPage = 1;
    renderTable();
    renderPagination();
}

function goToPage(page) 
{
    currentPage = page;
    renderTable();
    renderPagination();
}

// Chatbot functions.
async function handleQuery(query) 
{
    query = query.toLowerCase();
    if (query.includes('will it rain') || query.includes('weather')) 
    {
        const cityMatch = query.match(/in ([a-zA-Z\s]+)/);
        const city = cityMatch ? cityMatch[1].trim() : 'London';
        const weatherResponse = await getWeather(city);
        displayChatbotResponse(weatherResponse);
    } 
    
    else 
    {
        askChatbot(query);
    }
}

async function getWeather(city) 
{
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;

    try 
    {
        const response = await fetch(weatherUrl);
        
        if (!response.ok) 
        {
            throw new Error('Weather data not found');
        }
        
        const data = await response.json();
        return `The weather in ${city} is ${data.weather[0].description}, temperature: ${data.main.temp}°C.`;
    } 
    
    catch (error) 
    {
        console.error('Fetch error:', error);
        return 'Sorry, I couldn\'t fetch the weather information. Please try again.';
    }
}

async function askChatbot(question) 
{
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const requestBody = 
    {
        contents: 
        [{
            parts: 
            [{
                text: question
            }]
        }]
    };

    try 
    {
        const response = await fetch(url, 
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) 
        {
            const errData = await response.json();
            throw new Error(`Error: ${response.status} - ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) 
        {
            displayChatbotResponse(data.candidates[0].content.parts[0].text);
        } 
        
        else 
        {
            displayChatbotResponse('No content in the chatbot response.');
        }
    } 
    
    catch (error) 
    {
        console.error('Chatbot fetch error:', error);
        displayChatbotResponse(error.message || 'Failed to get a response from the chatbot.');
    }
}

function displayChatbotResponse(responseText) 
{
    chatbotResponse.textContent = responseText || 'No response from the chatbot.';
    chatbotResponse.scrollTop = chatbotResponse.scrollHeight;
}

// Chart initialization and update functions.
function initializeCharts() 
{
     // Bar Chart with Delay Animation.
    const ctxBar = document.getElementById('tempBarChart').getContext('2d');
    tempBarChart = new Chart(ctxBar, 
    {
        type: 'bar',
        data: 
        {
            labels: [],
            datasets: 
            [{
                label: 'Temperature (°C)',
                data: [],
                backgroundColor: 'rgb(255, 153, 153)',
                borderColor: 'rgb(0, 0, 0)',
                borderWidth: 1
            }]
        },
                
        options: 
        {
            animation: 
            {
                duration: 1000,
                delay: (context) => 
                {
                    return context.dataIndex * 100;
                }
            },
                    
            scales: 
            {
                y: 
                { 
                    beginAtZero: true 
                }
            }
        }
    });

    // Doughnut Chart with Delay Animation.
    const ctxDoughnut = document.getElementById('weatherDonutChart').getContext('2d');
    weatherDonutChart = new Chart(ctxDoughnut, 
    {
        type: 'doughnut',
        data: 
        {
            labels: ['Clear', 'Clouds', 'Rain', 'Other'],
            datasets: 
            [{
                data: [0, 0, 0, 0],
                backgroundColor: ['#FFD700', '#87CEEB', '#1E90FF', '#808080'],
                hoverOffset: 4
            }]
        },
                
        options: 
        {
            animation: 
            {
                duration: 1000,  
                delay: (context) => 
                {
                    return context.dataIndex * 300;
                }
        
            }
        }
    });
        
    // Line Chart with Drop Animation.
    const ctxLine = document.getElementById('tempLineChart').getContext('2d');
    tempLineChart = new Chart(ctxLine, 
    {
        type: 'line',
        data: 
        {
            labels: [],
            datasets: 
            [{
                label: 'Temperature ((°C)',
                data: [],
                backgroundColor: 'rgb(255, 26, 26)',
                borderColor: 'rgb(255, 26, 26)',
                tension: 0.1 
            }]
        },
                
        options: 
        {            
            animation: 
            {
                x: 
                {
                    duration: 1000,  
                    from: 0           // start at the first point.
                },    
                        
                y: 
                {
                    duration: 1500,  
                    from: (context) => context.chart.height,  // drop down from the top of the chart.
                }
            }
        }
    });
}

function processChartData(data) 
{
    // Object to store daily temperatures and weather types.
    const dailyData = data.list.reduce((acc, item) => 
    {
        // Get date without time.
        const date = new Date(item.dt * 1000).toLocaleDateString();
        
        if (!acc[date]) 
        {
            acc[date] = 
            {
                temps: [],
                weathers: []
            };
        }
        
        acc[date].temps.push(item.main.temp);
        acc[date].weathers.push(item.weather[0].main);
        
        return acc;
    }, {});

    // Process daily data.
    const tempData = [];
    const labels = [];
    const weatherTypes = {};

    // Calculate average temperature for each day and count weather types.
    Object.entries(dailyData).forEach(([date, dayData]) => 
    {
        // Calculate average temperature for the day.
        const avgTemp = dayData.temps.reduce((sum, temp) => sum + temp, 0) / dayData.temps.length;
        
        // Add to final arrays.
        labels.push(date);
        tempData.push(Number(avgTemp.toFixed(1)));

        // Count most frequent weather type for the day.
        const mostFrequentWeather = getMostFrequentWeather(dayData.weathers);
        weatherTypes[mostFrequentWeather] = (weatherTypes[mostFrequentWeather] || 0) + 1;
    });

    return {
        tempData,
        labels,
        weatherData: 
        {
            labels: Object.keys(weatherTypes),
            data: Object.values(weatherTypes)
        }
    };
}

// Helper function to get most frequent weather type.
function getMostFrequentWeather(weatherArray) 
{
    return weatherArray.sort((a, b) =>
        weatherArray.filter(v => v === a).length - weatherArray.filter(v => v === b).length
    ).pop();
}

// Update Charts.
function updateCharts(tempData, labels, weatherData) 
{
    if (tempBarChart) 
    {
        tempBarChart.data.labels = labels;
        tempBarChart.data.datasets[0].data = tempData;
        tempBarChart.update();
    }

    if (weatherDonutChart) 
    {
        weatherDonutChart.data.labels = weatherData.labels;
        weatherDonutChart.data.datasets[0].data = weatherData.data;
        weatherDonutChart.update();
    }

    if (tempLineChart) 
    {
        tempLineChart.data.labels = labels;
        tempLineChart.data.datasets[0].data = tempData;
        tempLineChart.update();
    }
}

