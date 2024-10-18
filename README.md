# Weather-Dashboard
Project Overview
The Weather Dashboard is a web application that provides users with current weather information and forecasts. It features a clean, responsive interface with a sidebar for navigation, a main content area for displaying weather data, and interactive charts for visualizing weather trends.
Key Features
1.	Current Weather Display: 
Shows current temperature, humidity, weather conditions, and wind speed for a searched city.
2.	5-Day Forecast: 
Presents temperature using various chart types (bar, doughnut, and line).
3.	Temperature Unit Toggle: 
Allows users to switch between Celsius and Fahrenheit.
4.	Data Tables: 
Displays detailed weather data in a tabular format with sorting and filtering options for the next five Days.
5.	Weather Chatbot: 
An interactive chatbot for answering weather and general questions.
6.	Responsive Design: 
Adapts to different screen sizes for optimal viewing on various devices like Mobile, Laptop or Tablet.
7.	Geolocation: 
Automatically fetches weather data for the user's current location.
8.	Dynamic Charts: 
Includes bar, doughnut, and line charts for visualizing weather data.
9.	Profile Card: 
Displays user information in a pop-up card.
Project Structure
•	index.html: The main HTML file containing the structure of the web application.
•	style.css: The CSS file that defines the styling and layout of the application.
•	script.js: The JavaScript file that handles the application's functionality, API calls, and dynamic content updates.
•	background.jpg: Background image for the application.
•	logo.jpg: Logo image for the sidebar.
•	profile.jpg: User profile image.
Running Locally
•	Open your index.html file and click on Run with Live Server or you can run using this Weather Dashboard or also open clicking on this link https://hadiaraheel.github.io/Weather-Dashboard/ .
Dependencies
•	Chart.js: Used for creating interactive charts (included via CDN).
•	OpenWeatherMap API: Used for fetching weather data.
•	Gemini API: Used for the chatbot functionality.
JavaScript Functionality
The script.js file contains:
1.	API Integration: 
•	OpenWeatherMap API for weather data.
•	Gemini AI for chatbot functionality.
2.	Weather Data Fetching: 
•	fetchWeatherData(): Gets current weather for a specified city.
•	fetchWeatherDataByCoords(): Gets weather based on coordinates.
•	fetchFiveDayForecastByCoords(): Retrieves 5-day forecast.
3.	Data Display: 
•	displayWeatherData(): Updates weather widget.
•	updateWeatherTable(): Populates forecast table.
4.	Chart Functionality: 
•	initializeCharts(): Sets up charts.
•	updateCharts(): Updates with new data according to City.
5.	User Interaction: 
•	Event listeners for city search, unit toggle, and navigation.
•	Sorting and filtering for weather table.
6.	Chatbot Integration: 
•	handleQuery(): Processes user queries.
•	askChatbot(): Interfaces with Gemini AI.
7.	Geolocation and Unit Conversion features
Browser Compatibility
Works on all modern web browsers, including:
•	Google Chrome.
•	Microsoft Edge.
Limitations
•	Chatbot functionality is limited to weather and general question.
•	Application requires an internet connection to fetch weather data and use the chatbot.
•	Ensure that you have valid API keys for both OpenWeatherMap and Google's Gemini AI.
Future Enhancements
1.	Implement user accounts for saving favorite locations and preferences.
2.	Add more detailed weather information (UV index, air quality, etc.).
3.	Enhance chatbot with advanced natural language processing.
4.	Implement dark mode option.
5.	Add caching mechanisms to reduce API calls.
6.	Enhance error handling and user feedback.
License
I don’t have any I created this for my University Assignment under Sir Zaheer Sani.
Contact
Hadia Raheel.
i222700@nu.edu.pk.
Thank you for using the Weather Dashboard! I hope you find it useful and informative.
