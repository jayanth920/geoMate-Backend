const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");
const countryCodes = require('country-codes-list'); 

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

let locations = [];

// Function to get city and country with User-Agent header
async function getCityCountry(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "MyApp/1.0 (nervoushofstadter0@fearlessmails.com)", // Use a real email to avoid blocks
      },
    });

    // Check if the response data is valid
    if (!response.data || !response.data.address) {
      throw new Error("Invalid response data");
    }

    const address = response.data.address;
    let countryName = "";

    // Retrieve the country name based on the country code
    if (address.country_code) {
      const countryCode = address.country_code.toUpperCase();
      const countryInfo = countryCodes.customList('countryCode', '{countryCode} {countryNameEn}')[countryCode];

      if (countryInfo) {
        // Extract the country name from the countryInfo string
        countryName = countryInfo.split(" ").slice(1).join(" ");
      }
    }

    const obj = {
      country_code: address.country_code || "unknown country_code",
      country: countryName || address.country || "unknown", // Use the countryName if available
      state: address.state || "unknown state",
      state_district: address.state_district || "unknown state_district",
      village: address.village || "unknown village",
      latitude,
      longitude,
    };

    return obj;
  } catch (error) {
    return { error: "Error fetching location" }; // Return error object
  }
}

app.post("/location", async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    const address = await getCityCountry(latitude, longitude);

    // Check if there's an error in the address
    if (address.error) {
      return res.status(400).json({ message: "Error in latitude/longitude" });
    }

    const location = {
      ...address,
      timestamp: new Date(),
    };

    locations.push(location);
    res.json({ message: "Coords received", location });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing location", error: error.message });
  }
});

app.get("/locations", (req, res) => {
    const latestLocations = [...locations].reverse(); 
    res.json(latestLocations);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
