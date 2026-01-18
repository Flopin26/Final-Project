// Map setup - centers on Graz city center
const map = L.map("map", { zoomControl: false }).setView([47.0707, 15.4395], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Theme settings - colors, sizes, labels for different place types
const themeColors = { safe: "green", stressful: "red", heated: "orange", cool: "blue" };
const themeRadius = { safe: 7, stressful: 9, heated: 10, cool: 8 };
const themeLabel = {
  safe: "🟢 SAFE PLACE",
  stressful: "🔴 STRESSFUL PLACE",
  heated: "🟠 HEATED / VERY HOT",
  cool: "🔵 COOLING PLACE"
};
let pointsArray = [];  // Stores all placed points

// Handle map clicks - add marker if theme selected
map.on("click", function (clickEvent) {
  const selectedTheme = document.getElementById("theme").value;
  if (!selectedTheme) {
    alert("Please select a theme before clicking on the map.");
    return;
  }

  // Get form data
  const userComment = document.getElementById("comment").value;
  const residencyTime = document.getElementById("residency").value;
  const ageGroup = document.getElementById("age").value;
  const userGender = document.getElementById("gender").value;
  const transportMode = document.getElementById("transport").value;

  // Create colored circle marker at click location
  const newMarker = L.circleMarker(clickEvent.latlng, {
    color: themeColors[selectedTheme],
    fillColor: themeColors[selectedTheme],
    radius: themeRadius[selectedTheme] || 6,
    weight: 2,
    fillOpacity: 0.75
  }).addTo(map);

  // Store point data including marker reference
  const newPointData = {
    theme: selectedTheme,
    comment: userComment,
    residency: residencyTime,
    age: ageGroup,
    gender: userGender,
    transport: transportMode,
    lat: clickEvent.latlng.lat,
    lng: clickEvent.latlng.lng,
    marker: newMarker
  };
  pointsArray.push(newPointData);
  const pointIndex = pointsArray.length - 1;

  // Show popup with theme, comment, delete button
  newMarker.bindPopup(`
    <div class="popup-content">
      <div class="popup-theme">${themeLabel[selectedTheme]}</div>
      ${userComment ? `<div class="popup-comment">"${userComment}"</div>` : ""}
      <button class="popup-delete" onclick="deletePoint(${pointIndex})">
        Delete point
      </button>
    </div>
  `);
  newMarker.openPopup();

  // Clear comment field only (keep demographics for next point)
  document.getElementById("comment").value = "";
});

// Remove single point by index
function deletePoint(pointIndex) {
  const pointToDelete = pointsArray[pointIndex];
  if (!pointToDelete) return;
  map.removeLayer(pointToDelete.marker);
  pointsArray[pointIndex] = null;
}

// Create and download GeoJSON file
function downloadData() {
  const validFeatures = [];
  for (let i = 0; i < pointsArray.length; i++) {
    const point = pointsArray[i];
    if (point === null) continue;
    validFeatures.push({
      type: "Feature",
      properties: {
        theme: point.theme,
        comment: point.comment,
        residency: point.residency,
        age: point.age,
        gender: point.gender,
        transport: point.transport
      },
      geometry: { type: "Point", coordinates: [point.lng, point.lat] }
    });
  }

  const geojsonData = {
    type: "FeatureCollection",
    features: validFeatures
  };

  if (geojsonData.features.length === 0) {
    alert("No points to download!");
    return;
  }

  // Generate filename with timestamp
  const fileName = "ppgis_urban_experience_" + Date.now() + ".geojson";
  saveToFile(geojsonData, fileName);

  // Auto-reset after download
  setTimeout(resetSurvey, 100);
}

// Helper: save JSON as downloadable file
function saveToFile(fileContent, fileName) {
  const dataBlob = new Blob([JSON.stringify(fileContent, null, 2)], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(dataBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadUrl);
}

// Reset form and clear map
function resetSurvey() {
  for (let i = 0; i < pointsArray.length; i++) {
    if (pointsArray[i] !== null) {
      map.removeLayer(pointsArray[i].marker);
    }
  }
  pointsArray = [];
  document.getElementById("theme").value = "";
  document.getElementById("comment").value = "";
  document.getElementById("residency").value = "";
  document.getElementById("age").value = "";
  document.getElementById("gender").value = "";
  document.getElementById("transport").value = "";
}
