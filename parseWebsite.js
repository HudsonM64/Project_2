// npm install puppeteer fs
const puppeteer = require('puppeteer');
const fs = require('fs');

async function getParkingData() {
  try {
    // Launch a headless browser with the new headless mode
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // URL of the website with parking information
    const url = 'https://www.lsu.edu/parking/availability.php';

    // Navigate to the website
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for a specific selector to appear (adjust as needed)
    await page.waitForSelector('.accordion-section-2', { timeout: 5000 });

    // Extract parking information using Puppeteer
    const parkingData = await page.evaluate(() => {
      const data = [];

      // Iterate over each accordion section
      document.querySelectorAll('.accordion-section-2').forEach((accordionSection) => {
        // Extract parking lot data from the table
        const tableRows = accordionSection.querySelectorAll('table.ou_6col tbody tr');
        tableRows.forEach((row, rowIndex) => {
          try {
            const lotName = row.querySelector('td:nth-child(1)').innerText.trim();
            const lotNumber = row.querySelector('td:nth-child(2)').innerText.trim();
            const totalSpaces = row.querySelector('td:nth-child(3)').innerText.trim();
            const times = Array.from(row.querySelectorAll('td:nth-child(n+4)')).map((cell) =>
              cell.innerText.trim()
            );

            // Create a parking lot object
            const parkingLot = {
              lotName,
              lotNumber,
              totalSpaces,
              times,
            };

            // Add the parking lot object to the array
            data.push(parkingLot);
          } catch (error) {
            console.error(`Error processing row ${rowIndex + 1}:`, error.message);
          }
        });
      });

      return data;
    });

    // Close the browser
    await browser.close();

    // Write the parking data to a JSON file
    const jsonData = JSON.stringify(parkingData, null, 2); // 2 spaces for indentation
    fs.writeFileSync('parkingData.json', jsonData);
    console.log('JSON data has been written to parkingData.json');

    // Output the parking data as a JSON object
    console.log(JSON.stringify(parkingData, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Call the function to get parking data
getParkingData();
