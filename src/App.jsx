import React, { useState, useEffect, useRef } from 'react';
import './App.css'
import axios from "axios"

function App() {
  const [currentHour] = useState(new Date().getHours());
  const [city, setCity] = useState('');
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  // Weather data states
  const [weatherData, setWeatherData] = useState({
    name: '',
    region: '',
    country: '',
    temp: '',
    wind: '',
    humidity: '',
    condition: '',
    icon: '',
    sunrise: '',
    sunset: ''
  });

  // Forecast states - using array for better management
  const [forecast, setForecast] = useState([]);

  // Current location weather
  const [currentLocationWeather, setCurrentLocationWeather] = useState(null);
  const [error, setError] = useState('');

  const weatherApiKey = '412b492bf8de4497ae193119252801';
  const openWeatherApiKey = '4ad9576e6c0979aaa8bfa432f80acf4b';
  const searchRef = useRef(null);

  // Fetch weather for searched city
  const checkWeather = async () => {
    if (!city.trim()) {
      alert("Please enter a city name");
      return;
    }
    setLoading(true);

    try {
      const res = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${city}`
      );

      setWeatherData({
        name: res.data.location.name + " ,",
        region: res.data.location.region + " ,",
        country: res.data.location.country,
        temp: res.data.current.temp_c + " °C",
        wind: res.data.current.wind_kph + " km/hr",
        humidity: res.data.current.humidity + " %",
        condition: "Condition: " + res.data.current.condition.text,
        icon: res.data.current.condition.icon,
        sunrise: "Sunrise: " + res.data.forecast.forecastday[0].astro.sunrise,
        sunset: "Sunset: " + res.data.forecast.forecastday[0].astro.sunset
      });

      // Set forecast data
      const hoursForecast = [];
      for (let i = 1; i <= 6; i++) {
        const hourData = res.data.forecast.forecastday[0].hour[(currentHour + i) % 24];
        hoursForecast.push({
          temp: hourData.temp_c + " °C",
          time: hourData.time.slice(11, 16)
        });
      }
      setForecast(hoursForecast);
      setAvailable(true);
      setCity('');
    } catch (error) {
      alert("Please enter a valid city name");
      setCity('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [weatherData]);

  // Get current location weather
  const getLocationWeather = () => {
    setLocationLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`
          );
          setCurrentLocationWeather(res.data);
          setError('');
        } catch {
          setError('Failed to fetch weather data');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        let errorMessage = 'Location access denied';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
            break;
        }
        setError(errorMessage);
        setLocationLoading(false);
      }
    );
  };

  // Auto-fetch current location on component mount
  useEffect(() => {
    getLocationWeather();
  }, []);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkWeather();
    }
  };

  // Helper function to get appropriate weather emoji based on condition
  const getWeatherEmoji = (condition) => {
    if (!condition) return '🌤️';
    const conditionText = condition.toLowerCase();
    if (conditionText.includes('sunny') || conditionText.includes('clear')) return '☀️';
    if (conditionText.includes('cloud')) return '☁️';
    if (conditionText.includes('rain')) return '🌧️';
    if (conditionText.includes('snow')) return '❄️';
    if (conditionText.includes('storm')) return '⛈️';
    if (conditionText.includes('fog') || conditionText.includes('mist')) return '🌫️';
    if (conditionText.includes('wind')) return '💨';
    return '🌤️';
  };

  // Helper function to get back side emoji for 3D effect
  const getWeatherBackEmoji = (condition) => {
    if (!condition) return '🌈';
    const conditionText = condition.toLowerCase();
    if (conditionText.includes('sunny') || conditionText.includes('clear')) return '🌤️';
    if (conditionText.includes('cloud')) return '⛅';
    if (conditionText.includes('rain')) return '☔';
    if (conditionText.includes('snow')) return '🌨️';
    if (conditionText.includes('storm')) return '⚡';
    return '🌈';
  };

  // Helper function to get CSS class for weather condition
  const getWeatherConditionClass = (condition) => {
    if (!condition) return 'sunny';
    const conditionText = condition.toLowerCase();
    if (conditionText.includes('sunny') || conditionText.includes('clear')) return 'sunny';
    if (conditionText.includes('cloud')) return 'cloudy';
    if (conditionText.includes('rain')) return 'rainy';
    if (conditionText.includes('snow')) return 'snowy';
    if (conditionText.includes('storm')) return 'stormy';
    return 'sunny';
  };

  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="header">
        <div className="logo-section">
          <img src="WIcon.png" alt="Weather Icon" className="logo" />
          <span className="logo-text">
            <span className="logo-part-1">Sky</span>
            <span className="logo-part-2">Watcher</span>
          </span>
        </div>

        <div className="search-section">
          <input
            type="text"
            placeholder='Enter city name'
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button onClick={checkWeather} disabled={loading}>
            {loading ? 'Loading...' : 'Check'}
          </button>
        </div>
      </header>

      {/* Current Location Weather */}
      <section className="current-location-section">
        <button onClick={getLocationWeather} disabled={locationLoading} className="location-btn">
          {locationLoading ? '🔄 Loading...' : '📍 Refresh  Location'}
        </button>

        {locationLoading && (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Fetching your location weather...</p>
          </div>
        )}

        {error && !locationLoading && (
          <div className="error-section">
            <p className="error-message">⚠️ {error}</p>
            <button onClick={getLocationWeather} className="retry-btn">
              🔄 Retry
            </button>
          </div>
        )}

        {currentLocationWeather && !locationLoading && (
          <div className="current-weather-grid">

            <div className="location-info">
              <h4>Current Location :  </h4>
              <h3>
                🌆 {currentLocationWeather.name || 'Unknown Location'},
                {currentLocationWeather.sys?.country}D
              </h3>
            </div>

            <div className="weather-card temp-card">
              <h2>{Math.round(currentLocationWeather.main?.temp)}°C</h2>
              <h3>Temperature</h3>
            </div>

            <div className="weather-card condition-card">
              <h2 className="condition-text">
                {currentLocationWeather.weather?.[0]?.description || 'N/A'}
              </h2>
              <h3>Condition</h3>
            </div>

            <div className="weather-card humidity-card">
              <h2>{currentLocationWeather.main?.humidity}%</h2>
              <h3>Humidity</h3>
            </div>

            <div className="weather-card wind-card">
              <h2>{currentLocationWeather.wind?.speed} km/h</h2>
              <img src="Wind.png" alt="Wind" />
              <h3>Wind Speed</h3>
            </div>

          </div>
        )}
      </section>

      {/* Searched City Weather */}
      {available && (
        <div id="Search-page" ref={searchRef}>
          <br />
        <section className="searched-weather-section">
          {/* Location Info */}
          <div className="location-details">
            <h1>{weatherData.name} {weatherData.region} {weatherData.country}</h1>
          </div>

          {/* Condition and Sunrise/Sunset */}
          <div className="weather-condition">
            <div className={`icon-3d condition-icon ${getWeatherConditionClass(weatherData.condition)}`}>
              <div className="icon-3d-inner">
                <div className="icon-3d-front">
                  {getWeatherEmoji(weatherData.condition)}
                </div>
                <div className="icon-3d-back">
                  {getWeatherBackEmoji(weatherData.condition)}
                </div>
              </div>
            </div>
            <h2>{weatherData.condition}</h2>
          </div>

          <div className="sun-times">
            <div className="sun-time">
              <div className="icon-3d sunrise-icon">
                <div className="icon-3d-inner">
                  <div className="icon-3d-front"><img src="/sun-times/Sunrise.jpg" alt="" /></div>
                  <div className="icon-3d-back">⏰</div>
                </div>
              </div>
              <h3>{weatherData.sunrise}</h3>
            </div>
            <div className="sun-time">
              <div className="icon-3d sunset-icon">
                <div className="icon-3d-inner">
                  <div className="icon-3d-front"><img src="/sun-times/Snset.jpg" alt="" /></div>
                  <div className="icon-3d-back">⏰</div>
                </div>
              </div>
              <h3>{weatherData.sunset}</h3>
            </div>
          </div>

          {/* Main Weather Stats */}
          <div className="weather-stats">
            <div className="stat-card temperature-stat">
              <div className="icon-3d temperature-icon">
                <div className="icon-3d-inner">
                  <div className="icon-3d-front">🌡️</div>
                  <div className="icon-3d-back">🔥</div>
                </div>
              </div>
              <h3>Temperature</h3>
              <h2>{weatherData.temp}</h2>
            </div>

            <div className="stat-card wind-stat">
              <div className="icon-3d wind-icon">
                <div className="icon-3d-inner">
                  <div className="icon-3d-front">💨</div>
                  <div className="icon-3d-back">🌪️</div>
                </div>
              </div>
              <h3>Wind Speed</h3>
              <h2>{weatherData.wind}</h2>
            </div>

            <div className="stat-card humidity-stat">
              <div className="icon-3d humidity-icon">
                <div className="icon-3d-inner">
                  <div className="icon-3d-front">💧</div>
                  <div className="icon-3d-back">🌧️</div>
                </div>
              </div>
              <h3>Humidity</h3>
              <h2>{weatherData.humidity}</h2>
            </div>
          </div>

          {/* Hourly Forecast */}
          <div className="forecast-section">
            <h2>Upcoming Hours</h2>
            <div className="forecast-grid">
              {forecast.map((hour, index) => (
                <div key={index} className="forecast-card">
                  <h4>{hour.time}</h4>
                  <div className="icon-3d forecast-icon">
                    <div className="icon-3d-inner">
                      <div className="icon-3d-front">🌡️</div>
                      <div className="icon-3d-back">{getWeatherEmoji(weatherData.condition)}</div>
                    </div>
                  </div>
                  <h3>{hour.temp}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
        </div>
      )}
    </div>
  );
}

export default App