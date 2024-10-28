const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv')

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
        'User-Agent': 'MyApp/1.0 (nervoushofstadter0@fearlessmails.com)' // Use a real email to avoid blocks
      }
    });

    const address = response.data.address;

    const obj = {
        country_code: address.country_code || "unknown country_code",
        country: address.country || "unknown",
        state: address.state || "unknown state",
        state_district: address.state_district || "unknown state_district",
        village: address.village || "unknown village"
    }

    return obj;
  } catch (error) {
    console.error('Error fetching address:', error.response?.data || error.message);
    return 'Error fetching location';
  }
}

app.post('/location', async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    const address = await getCityCountry(latitude, longitude);
    const location = {
      ...address,
      timestamp: new Date(),
    };

    locations.push(location);
    res.json({ message: 'Coords received', location });
  } catch (error) {
    res.status(500).json({ message: 'Error processing location', error: error.message });
  }
});

app.get('/locations', (req, res) => {
  res.json(locations);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
