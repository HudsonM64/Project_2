// app.js
require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs').promises;


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
// Add body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/availability', async (req, res) => {
  try {
    // Read the JSON file asynchronously
    const rawdata = await fs.readFile('./parkingData.json', 'utf-8');
    const parkingData = JSON.parse(rawdata);

    // Define permitTypes array
    const permitTypes = ['Commuter', 'Residential', 'Greek', 'B '];

    console.log('Fetched parking data:', parkingData);

    // Render the template with the fetched data and permitTypes
    res.render('availability', { parkingData, permitTypes });
  } catch (error) {
    console.error('Error reading JSON file:', error.message);
    res.status(500).send('Internal Server Error');
  }
});
// Render the "Admin" page
app.get('/admin', async (req, res) => {
  try {
    // Read the JSON file asynchronously
    const rawdata = await fs.readFile('./parkingData.json', 'utf-8');
    const parkingData = JSON.parse(rawdata);

    // Render the template with the fetched data
    res.render('admin', { parkingData });
  } catch (error) {
    console.error('Error reading JSON file:', error.message);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/', (req, res) => {
   // Send HTML with a navbar linking to /admin and /availability
   const homepageHtml = `
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Parking App</title>
       <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
   </head>
   <body>
       <nav class="navbar navbar-expand-lg navbar-light bg-light" style="background color: #ADD8E6;">
           <a class="navbar-brand" href="/">Parking App</a>
           <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
               <span class="navbar-toggler-icon"></span>
           </button>
           <div class="collapse navbar-collapse" id="navbarNav">
               <ul class="navbar-nav">
                   <li class="nav-item active">
                       <a class="nav-link" href="/availability">Availability</a>
                   </li>
                   <li class="nav-item">
                       <a class="nav-link" href="/admin">Admin</a>
                   </li>
               </ul>
           </div>
       </nav>
       <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
       <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.1/dist/umd/popper.min.js"></script>
       <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
   </body>
   </html>
`;
res.send(homepageHtml);
});
// Handle form submission for adding parking entries
app.post('/add-entry', async (req, res) => {
 // Replace this with your logic to add the entry to the parking database
 const { lotName, lotNumber, totalSpaces, availability, times } = req.body;

 const ParkingLot = mongoose.model('ParkingLot', {
   lotName: String,
   lotNumber: String,
   totalSpaces: Number,
   availability: String,
   times: [String],
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

   // Send a success alert to the browser
   res.send('<script>alert("Parking lot successfully added!"); window.location.href = "/admin";</script>');
 } catch (error) {
   console.error('Error saving parking entry to MongoDB:', error.message);

   // Send an error alert to the browser
   res.send('<script>alert("Error adding parking lot. Please try again."); window.location.href = "/admin";</script>');
 }
});
app.post('/delete-entry', async (req, res) => {
  try {
      const { lotNumberDelete } = req.body;

      if (!lotNumberDelete) {
          throw new Error('Lot Number to Delete is missing in the request');
      }

      // Read the existing parking data from the JSON file
      const rawdata = await fs.readFile('./parkingData.json', 'utf-8');
      const parkingData = JSON.parse(rawdata);

      // Find the index of the lot to be deleted
      const lotIndex = parkingData.findIndex((lot) => lot.lotNumber === lotNumberDelete);

      if (lotIndex === -1) {
          throw new Error('Lot not found with the given lot number');
      }

      // Remove the lot from the array
      const deletedLot = parkingData.splice(lotIndex, 1)[0];

      // Save the updated data back to the JSON file
      await fs.writeFile('./parkingData.json', JSON.stringify(parkingData, null, 2), 'utf-8');

      console.log('Parking entry deleted from JSON file:', deletedLot);

        // Send an alert to the browser
        res.send('<script>alert("Parking lot successfully deleted!"); window.location.href = "/admin";</script>');
    } catch (error) {
        console.error('Error deleting parking entry from JSON file:', error.message);
        res.status(400).send('Bad Request');
    }
  });
  
// Start the server
const port = process.env.PORT || 3000;
// Add a simple route to print a message when the server starts
app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`);
  });