const puppeteer = require('puppeteer');
const fs = require('fs').promises; // Import promises-based fs module for writeFile

async function getParkingData(url, outputFilename) {
  const browser = await puppeteer.launch({
    headless: false, // Set to true if you don't need a browser UI
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  // Scrape the data
  const data = await page.evaluate(() => {
    let allData = [];
    const accordionSections = document.querySelectorAll(".accordion-section-2");

    accordionSections.forEach((section) => {
      // Find the h2 element that precedes the accordion-section-2
      let headerElement = section.previousElementSibling;
      while (headerElement && headerElement.tagName.toLowerCase() !== "h2") {
        headerElement = headerElement.previousElementSibling;
      }
      const permitType = headerElement
        ? headerElement.textContent.trim()
        : "Unknown Permit Type";

      // Now find all the .card elements within the section to get the day and lot details
      const cards = section.querySelectorAll(".card");
      cards.forEach((card) => {
        const dayOfWeek = card
          .querySelector(".card-header h2")
          .textContent.trim();
        const rows = card.querySelectorAll(".table tbody tr:not(:first-child)");

        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          const lotData = {
            permitType,
            dayOfWeek,
            lotName: cells[0].textContent.trim(),
            lotNumber: cells[1].textContent.trim(),
            totalSpaces: cells[2].textContent.trim(),
            occupancy: {
              "7am": cells[3].textContent.trim(),
              "11am": cells[4].textContent.trim(),
              "2pm": cells[5].textContent.trim(),
              "4pm": cells[6].textContent.trim(),
            },
          };
          allData.push(lotData);
        });
      });
    });

    return allData;
  });

  // Use promises-based fs.writeFile
  await fs.writeFile(outputFilename, JSON.stringify(data, null, 2));
  console.log(`Data saved to ${outputFilename}`);

  await browser.close();
}

// Example usage
getParkingData(
  "https://www.lsu.edu/parking/availability.php",
  "parkingData.json"
).catch((error) => {
  console.error("Error occurred:", error);
});
