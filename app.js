// app.js
require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const fs = require('fs');

const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString, { useNewUrlParser: true, useUnifiedTopology: true });
const database = mongoose.connection;

database.on('error', (error) => {
  console.log(error);
});

database.once('connected', () => {
  console.log('Database Connected');
});


// Use EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));

// Your existing code for getting parking data
async function getParkingData() {

}

// Render the "Availability" page
app.get('/availability', async (req, res) => {

  try {
    // Read the JSON file synchronously (you might want to use asynchronous methods in production)
    const rawdata = fs.readFileSync('./parkingData.json', 'utf-8');
    const parkingData = JSON.parse(rawdata);
    // Render the template with the fetched data
    console.log('Fetched parking data:', parkingData);
    res.render('availability', { parkingData });
  } catch (error) {
    console.error('Error reading JSON file:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Render the "Admin" page
app.get('/admin', (req, res) => {
  res.render('admin');
});
app.get('/', (req, res) => {
    res.send('Welcome to the Parking App!'); // You can also redirect to another page if needed
  });
// Handle form submission for adding parking entries
app.post('/add-entry', async (req, res) => {
  // Replace this with your logic to add the entry to the parking database
  const { lotName, lotNumber, totalSpaces, availability } = req.body;
  // Save the data to MongoDB
  const ParkingLot = mongoose.model('ParkingLot', {
    lotName,
    lotNumber,
    totalSpaces,
    availability,
  });

  try {
    const parkingLot = new ParkingLot({
      lotName,
      lotNumber,
      totalSpaces,
      availability,
    });
    await parkingLot.save();
    console.log('Parking entry added to MongoDB');
  } catch (error) {
    console.error('Error saving parking entry to MongoDB:', error.message);
  }
  res.redirect('/admin'); // Redirect back to the Admin page
});

app.post('/delete-entry', async (req, res) => {
    try {
      const { lotNumberDelete } = req.body;
  
      if (!lotNumberDelete) {
        throw new Error('Lot Number to Delete is missing in the request');
      }
  
      // Delete the data from MongoDB
      const ParkingLot = mongoose.model('ParkingLot', {
        lotName: String,
        lotNumber: String,
        totalSpaces: String,
        availability: String,
      });
  
      await ParkingLot.deleteOne({ lotNumber: lotNumberDelete });
      console.log('Parking entry deleted from MongoDB');
      res.redirect('/admin'); // Redirect back to the Admin page
    } catch (error) {
      console.error('Error deleting parking entry from MongoDB:', error.message);
      res.status(400).send('Bad Request');
    }
  
    res.redirect('/admin'); // Redirect back to the Admin page
  });
// Start the server
const port = process.env.PORT || 3000;
// Add a simple route to print a message when the server starts
app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`);
  });