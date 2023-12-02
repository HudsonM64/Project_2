// app.js

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const fs = require('fs');

const mongoString = process.env.DATABASE_URL;
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

// Use EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));

// Your existing code for getting parking data
async function getParkingData() {
  // ... (unchanged)
}

// Render the "Availability" page
app.get('/availability', async (req, res) => {
  try {
    const parkingData = await getParkingData();
    res.render('availability', { parkingData });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Render the "Admin" page
app.get('/admin', (req, res) => {
  res.render('admin');
});

// Handle form submission for adding parking entries
app.post('/add-entry', (req, res) => {
  // Replace this with your logic to add the entry to the parking database
  const { lotName, lotNumber, totalSpaces, availability } = req.body;
  // Example: Save the data to a file
  fs.appendFileSync('parkingData.json', `\n${lotName}, ${lotNumber}, ${totalSpaces}, ${availability}`);
  res.redirect('/admin'); // Redirect back to the Admin page
});

// Handle form submission for deleting parking entries
app.post('/delete-entry', (req, res) => {
  // Replace this with your logic to delete the entry from the parking database
  const { lotNumberDelete } = req.body;
  // Example: Delete the data from a file
  // Note: This is a simplistic example, and you should implement a proper way to update your database
  res.redirect('/admin'); // Redirect back to the Admin page
});

// Start the server
const port = process.env.PORT || 3000;
// Add a simple route to print a message when the server starts
app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`);
    
  });