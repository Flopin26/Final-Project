/* =========================
   Map initialization
   ========================= */

const map = L.map("map", { zoomControl: false }).setView([47.0707, 15.4395], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);



/* =========================
   Configuration
   ========================= */

const themeColors = {
  safe: "green",
  stressful: "red",
  heated: "orange",
  cool: "blue"
};

// Optional: different marker sizes per theme
const themeRadius = {
  safe: 7,
  stressful: 9,
  heated: 10,
  cool: 8
};

// Optional: emoji title per theme
const themeLabel = {
  safe: "🟢 SAFE PLACE",
  stressful: "🔴 STRESSFUL PLACE",
  heated: "🟠 HEATED / VERY HOT",
  cool: "🔵 COOLING PLACE"
};

let points = [];



/* =========================
   Map click interaction
   ========================= */

map.on("click", function (e) {

  const theme = document.getElementById("theme").value;
  const comment = document.getElementById("comment").value;
  const residency = document.getElementById("residency").value;
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;
  const transport = document.getElementById("transport").value;

  // Check: Theme selected?
  if (!theme) {
    alert("Please select a theme before clicking on the map.");
    return;
  }

  // Create marker
  const marker = L.circleMarker(e.latlng, {
    color: themeColors[theme],
    fillColor: themeColors[theme],
    radius: themeRadius[theme] || 6,
    weight: 2,
    fillOpacity: 0.75
  }).addTo(map);

  // Save point info
  const pointData = {
    theme,
    comment,
    residency,
    age,
    gender,
    transport,
    lat: e.latlng.lat,
    lng: e.latlng.lng,
    marker
  };

  points.push(pointData);
  const index = points.length - 1;

  // Popup content (more informative)
  marker.bindPopup(`
  <div class="popup-content">
    <div class="popup-theme">${themeLabel[theme] || theme.toUpperCase()}</div>

    ${comment ? `<div class="popup-comment">"${comment}"</div>` : ""}

    <button class="popup-delete" onclick="deletePoint(${index})" style="margin-top: 10px;">
      Delete point
    </button>
  </div>
`);

  
  

  // ✅ open popup instantly (so user sees feedback)
  marker.openPopup();

  // Reset comment field after placing a point
  document.getElementById("comment").value = "";

  // Optional message
});


/* =========================
   Delete point
   ========================= */

function deletePoint(index) {
  const point = points[index];
  if (!point) return;

  map.removeLayer(point.marker);
  points[index] = null;

  
}


/* =========================
   Save file helper function
   ========================= */

function saveToFile(content, fileName) {
  const blob = new Blob([JSON.stringify(content, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


/* =========================
   Export to GeoJSON
   ========================= */

function downloadData() {

  const geojson = {
    type: "FeatureCollection",
    features: points
      .filter(p => p !== null)
      .map(p => ({
        type: "Feature",
        properties: {
          theme: p.theme,
          comment: p.comment,
          residency: p.residency,
          age: p.age,
          gender: p.gender,
          transport: p.transport
        },
        geometry: {
          type: "Point",
          coordinates: [p.lng, p.lat]
        }
      }))
  };

  if (geojson.features.length === 0) {
    alert("No points to download!");
    return;
  }

  const fileName = "ppgis_urban_experience_" + Date.now() + ".geojson";
  saveToFile(geojson, fileName);

  alert("GeoJSON downloaded successfully!");

  setTimeout(() => {

    // remove markers
    points.forEach(p => {
      if (p !== null) map.removeLayer(p.marker);
    });
    points = [];

    // reset survey form
    document.getElementById("theme").value = "";
    document.getElementById("comment").value = "";
    document.getElementById("residency").value = "";
    document.getElementById("age").value = "";
    document.getElementById("gender").value = "";
    document.getElementById("transport").value = "";


  }, 100);
}
