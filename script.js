/* =========================
   Map initialization
   ========================= */

const map = L.map("map").setView([47.0707, 15.4395], 13);

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

  if (!theme) {
    alert("Please select a theme before clicking on the map.");
    return;
  }

  const marker = L.circleMarker(e.latlng, {
    color: themeColors[theme],
    radius: 6,
    weight: 2,
    fillOpacity: 0.7
  }).addTo(map);

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

  marker.bindPopup(`
  <div class="popup-content">
    <div class="popup-theme">${theme.toUpperCase()}</div>
    ${comment ? `<div class="popup-comment">${comment}</div>` : ""}
    <button class="popup-delete" onclick="deletePoint(${index})">
      Delete point
    </button>
  </div>
`);

  document.getElementById("comment").value = "";
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

  const blob = new Blob(
    [JSON.stringify(geojson, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ppgis_urban_experience.geojson";
  a.click();
}
