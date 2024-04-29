import  { useState, useEffect } from "react";
import "./App.css";
import Select from "react-select";
import cityList from "../assets/current.city.list.json";

const API_KEY = "3edd04b4790e8483645f24667cd79d87";

function getWeatherDataForId(id, unitScale) {
  return fetch(
    `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${API_KEY}&units=${unitScale}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      return response.json();
    })
    .then((data) => {
      return {
        id: data.id,
        name: data.name,
        temperature: data.main.temp,
      };
    });
}

function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [userCityList, setUserCityList] = useState([]);
  const [unitScale, setUnitScale] = useState("K");

  useEffect(() => {
    // Update temperatures in user city list when unitScale changes
    if (userCityList.length > 0) {
      updateUserCityListTemperatures();
    }
  }, [unitScale]);

  const updateUserCityListTemperatures = () => {
    const updatedCityList = userCityList.map((city) => {
      return {
        ...city,
        temperature: convertTemperature(city.temperature, unitScale),
      };
    });
    setUserCityList(updatedCityList);
  };

  const convertTemperature = (temperature, targetUnit) => {
    if (targetUnit === "C") {
      return temperature - 273.15; // Kelvin to Celsius
    } else if (targetUnit === "F") {
      return (temperature * 1.8) + 32; // Celsius to Fahrenheit
    } else if (targetUnit === "K") {
      return (temperature - 32) * (5 / 9) + 273.15; // Fahrenheit to Kelvin
    } else {
      return "Invalid target unit";
    }
  };
  
  

  const citySelectChangeHandler = (selectedOption) => {
    setSelectedCity(selectedOption);
  };

  const toggleUnitScale = () => {
    // Toggle unit scale between C, F, and K
    if (unitScale === "C") {
      setUnitScale("F");
    } else if (unitScale === "F") {
      setUnitScale("K");
    } else {
      setUnitScale("C");
    }
  };

  const getTemperature = () => {
    if (selectedCity) {
      getWeatherDataForId(selectedCity.value, unitScale)
        .then((cityData) => {
          setUserCityList([...userCityList, cityData]);
        })
        .catch((error) => {
          console.error("Error fetching weather data:", error.message);
        });
    }
  };

  // const renderUserCityList = () => {
  //   return userCityList.map((city) => (
  //     <div key={city.id}>
  //       <p>{city.name}</p>
  //       <p>
  //         Temperature: {city.temperature} {unitScale}
  //       </p>
  //       <button>Update</button>
  //       <button>Delete</button>
  //     </div>
  //   ));
  // };
  const updateTemperature = async (cityId) => {
    const updatedCityList = userCityList.map(async (city) => {
      if (city.id === cityId) {
        const data = await getWeatherDataForId(city.id, unitScale);
        return {
          ...city,
          temperature: data.temperature,
        };
      }
      return city;
    });
    
    const resolvedCityList = await Promise.all(updatedCityList);
    setUserCityList(resolvedCityList);
  };
  
  
  const deleteCity = (cityId) => {
    const updatedCityList = userCityList.filter((city) => city.id !== cityId);
    setUserCityList(updatedCityList);
  };
  
  const renderUserCityList = () => {
    return userCityList.map((city) => (
      <div key={city.id}>
        <p>{city.name}</p>
        <p>
          Temperature: {city.temperature} {unitScale}
        </p>
        <button onClick={() => updateTemperature(city.id)}>Update</button>
        <button onClick={() => deleteCity(city.id)}>Delete</button>
      </div>
    ));
  };
  
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <div style={{ width: "90%" }}>
          <Select
            options={cityList.map((city) => ({
              value: city.id,
              label: city.name,
            }))}
            placeholder="Select a city..."
            onChange={citySelectChangeHandler}
          />
        </div>
        <button onClick={getTemperature}>Get Temperature</button>
        <button onClick={toggleUnitScale}>{unitScale}</button>
      </div>
      <div>{renderUserCityList()}</div>
    </>
  );
}

export default App;
