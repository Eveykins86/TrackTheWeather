//Form inputs for City and State
document.addEventListener('DOMContentLoaded', function() {
    var searchButton = document.getElementById('search-button');
    var historyContainer = document.getElementById('history-container');
    var locationInput = document.getElementById('location-input');
  
    var awesomplete = new Awesomplete(locationInput);
  
    locationInput.addEventListener('input', function() {
      var inputValue = locationInput.value.trim();
      if (inputValue !== '') {
        var apiUrl = `https://api.teleport.org/api/cities/?search=${encodeURIComponent(inputValue)}`;
        fetch(apiUrl)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            var suggestions = data._embedded['city:search-results'].map(function(result) {
              return result.matching_full_name;
            });
            awesomplete.list = suggestions;
          })
          .catch(function(error) {
            console.log('Error', error);
          });
      } else {
        awesomplete.list = [];
      }
    });

    function displayErrorMessage(message) {
        var errorMessage = document.getElementById('error-message');
        errorMessage.textContent = message;
      
        var modal = document.getElementById('error-modal');
        modal.style.display = 'block';
      
        var closeButton = document.getElementsByClassName('close')[0];
        closeButton.onclick = function() {
          modal.style.display = 'none';
        };
      
        window.onclick = function(event) {
          if (event.target == modal) {
            modal.style.display = 'none';
          }
        };
      }
  
    locationInput.addEventListener('awesomplete-selectcomplete', function() {
        performSearch();
      });
    
      searchButton.addEventListener('click', performSearch);
      locationInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
          performSearch();
        }
      });
  
    function performSearch() {
      var inputValue = locationInput.value.trim();
  
      if (inputValue !== '') {
            var apiKey = '781ce9035df6e9347a59fe385dbef781'
            var apiUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + encodeURIComponent(inputValue) + '&appid=' + apiKey + '&units=imperial';

            fetch(apiUrl)
            .then(function(response) {
              if (response.ok) {
                return response.json();
              } else {
                throw new Error('City not found');
              }
            })
            .then(function(data) {
                    displayWeather(data);
                    saveSearch(inputValue);
                    displayForecast(data);
                    displaySearchHistory();
                    console.log(data);
                })
                .catch(function(error) {
                  displayErrorMessage('City not found');
                });

                locationInput.value = '';
            }
//Function to display weather details
    function displayWeather(data) {
        console.log(data)

//Display current weather for selected city 
        var cityNameElement = document.getElementById('city-name');
        cityNameElement.textContent = data.city.name;

        var dateElement = document.getElementById('date');
        var currentDate = new Date();
        dateElement.textContent = currentDate.toLocaleDateString();

        var weatherInfo = document.getElementById('weather-info');

        weatherInfo.innerHTML = '';

        var weatherDescription = document.createElement('p');
        weatherDescription.textContent = 'Description: ' + data.list[0].weather[0].description;
        weatherInfo.appendChild(weatherDescription);

        var iconUrl = 'https://openweathermap.org/img/wn/' + data.list[0].weather[0].icon + '@2x.png';
        var weatherIcon = document.createElement('img');
        weatherIcon.src = iconUrl;
        weatherInfo.appendChild(weatherIcon);

        var temperature = document.createElement('p');
        temperature.textContent = 'Temperature: ' + data.list[0].main.temp + '°F';
        weatherInfo.appendChild(temperature);

        var humidity = document.createElement('p');
        humidity.textContent = 'Humidity: ' + data.list[0].main.humidity + '%';
        weatherInfo.appendChild(humidity);

        var windSpeed = document.createElement('p');
        windSpeed.textContent = 'Wind Speed: ' + data.list[0].wind.speed + 'mph';
        weatherInfo.appendChild(windSpeed);

        weatherInfo.style.display = 'block'

    }
};
//Display Forcast for next 5 days

function displayForecast(data) {
    var forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';

    var forcastData = data.list.slice(1, 6);

    forcastData.forEach(function(forecast) {
        var forecastBox = document.createElement('div');
        forecastBox.classList.add('forecast-box');

        var forecastDate = new Date(forecast.dt_txt);
        var dateElement = document.createElement('p');
        dateElement.textContent = forecastDate.toLocaleDateString();
        forecastBox.appendChild(dateElement);

        var weatherDescription = document.createElement('p');
        weatherDescription.textContent ='Description: ' + forecast.weather[0].description;
        forecastBox.appendChild(weatherDescription);

        var iconUrl = 'https://openweathermap.org/img/wn/' + forecast.weather[0].icon + '@2x.png';
        var weatherIcon = document.createElement('img');
        weatherIcon.src = iconUrl;
        forecastBox.appendChild(weatherIcon);

        var temperature = document.createElement('p');
        temperature.textContent = 'Temperature: ' +forecast.main.temp + '°F';
        forecastBox.appendChild(temperature);

        var humidity = document.createElement('p');
        humidity.textContent = 'Humidity: ' + forecast.main.humidity + '%';
        forecastBox.appendChild(humidity);

        var windSpeed = document.createElement('p');
        windSpeed.textContent = 'Wind Speed: ' + forecast.wind.speed + 'mph';
        forecastBox.appendChild(windSpeed);

        forecastContainer.appendChild(forecastBox);
    });
}

//Function to save searches and display them

function saveSearch(city) {
    var searches = getSearches();
    searches.push(city);
    localStorage.setItem('searches', JSON.stringify(searches));
  }

  function getSearches() {
    var searches = localStorage.getItem('searches');
    return searches ? JSON.parse(searches) : [];
  }

  function removeSearch(city) {
    var searches = getSearches();
    var index = searches.indexOf(city);
    if (index > -1) {
      searches.splice(index, 1);
      localStorage.setItem('searches', JSON.stringify(searches));
    }
  }

  function displaySearchHistory() {
    var searches = getSearches();
    historyContainer.innerHTML = '';
  
    var historyList = document.createElement('ul');
    historyList.classList.add('history-list');
    historyContainer.appendChild(historyList);
  
    searches.forEach(function(search) {
      var historyItem = document.createElement('li');
      historyItem.classList.add('history-item');
  
      var historyButton = document.createElement('button');
      historyButton.textContent = search;
      historyButton.style.backgroundColor = 'blue';
      historyButton.style.color ='white';
      historyButton.style.borderRadius = '4px';

      historyButton.addEventListener('click', function() {
        fetchWeatherAndForecast(search);
      });
      
      var trashButton = document.createElement('button');
      trashButton.innerHTML = '<i class="fas fa-trash"></i>';
      trashButton.classList.add('trash-button')
      trashButton.style.backgroundColor = 'red';
      trashButton.style.color = 'white';
      trashButton.style.borderRadius = '4px'
      trashButton.addEventListener('click', function() {
        removeSearch(search);
        displaySearchHistory();
      });

      var buttonContainer = document.createElement('div');
      buttonContainer.classList.add('button-container');
      buttonContainer.appendChild(historyButton);
      buttonContainer.appendChild(trashButton);

      historyItem.appendChild(buttonContainer);
      historyList.appendChild(historyItem);
    });
  }

  var clearButton = document.getElementById('clear-button');
  clearButton.addEventListener('click', function() {
    clearSearchHistory();
  })

  function clearSearchHistory() {
    localStorage.removeItem('searches');
    displaySearchHistory();
  }

  var clearButton = document.getElementById('clear-button');
  clearButton.style.backgroundColor = 'red';
  clearButton.style.color = 'white';
  clearButton.style.borderRadius = '4px';

  //Function to display weather details
  function displayWeather(data) {
    console.log(data)

//Display current weather for selected city 
    var cityNameElement = document.getElementById('city-name');
    cityNameElement.textContent = data.city.name;

    var dateElement = document.getElementById('date');
    var currentDate = new Date();
    dateElement.textContent = currentDate.toLocaleDateString();

    var weatherInfo = document.getElementById('weather-info');

    weatherInfo.innerHTML = '';

    var weatherDescription = document.createElement('p');
    weatherDescription.textContent = 'Description: ' + data.list[0].weather[0].description;
    weatherInfo.appendChild(weatherDescription);

    var iconUrl = 'https://openweathermap.org/img/wn/' + data.list[0].weather[0].icon + '@2x.png';
    var weatherIcon = document.createElement('img');
    weatherIcon.src = iconUrl;
    weatherInfo.appendChild(weatherIcon);

    var temperature = document.createElement('p');
    temperature.textContent = 'Temperature: ' + data.list[0].main.temp + '°F';
    weatherInfo.appendChild(temperature);

    var humidity = document.createElement('p');
    humidity.textContent = 'Humidity: ' + data.list[0].main.humidity + '%';
    weatherInfo.appendChild(humidity);

    var windSpeed = document.createElement('p');
    windSpeed.textContent = 'Wind Speed: ' + data.list[0].wind.speed + 'mph';
    weatherInfo.appendChild(windSpeed);

    weatherInfo.style.display = 'block'

}

  function fetchWeatherAndForecast(city) {
    var apiKey = '781ce9035df6e9347a59fe385dbef781';
    var apiUrl =
      'https://api.openweathermap.org/data/2.5/forecast?q=' +
      encodeURIComponent(city) +
      '&appid=' +
      apiKey +
      '&units=imperial';

    fetch(apiUrl)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        displayWeather(data);
        displayForecast(data);
        console.log(data);
      })
      .catch(function(error) {
        console.log('Error', error);
      });
  }
  displaySearchHistory();
});