let map; // Declare map globally

function findShops() {
    let city = document.getElementById("city").value;
    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    fetch(`https://nominatim.openstreetmap.org/search?city=${city}&format=json`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert("City not found.");
                return;
            }

            let lat = data[0].lat;
            let lon = data[0].lon;

            // Initialize map only once
            if (!map) {
                map = displayMap(lat, lon);
            } else {
                map.setView([lat, lon], 14); // If the map is already initialized, just update the view
            }
            findPastryShops(lat, lon);
        })
        .catch(error => console.error("Error fetching city coordinates:", error));
}

function displayMap(lat, lon) {
    let map = L.map("map").setView([lat, lon], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    return map;
}

function findPastryShops(lat, lon) {
    let overpassQuery = `[out:json];node["shop"="bakery"](around:5000, ${lat}, ${lon});out;`;

    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`)
        .then(response => response.json())
        .then(data => {
            if (data.elements.length === 0) {
                alert("No pastry shops found nearby.");
                return;
            }

            // Add markers to the map
            data.elements.forEach(shop => {
                L.marker([shop.lat, shop.lon])
                    .addTo(map)
                    .bindPopup(shop.tags.name || "Unnamed Pastry Shop");
            });
        })
        .catch(error => console.error("Error fetching pastry shops:", error));
}
