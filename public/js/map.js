const mapDiv = document.getElementById("map");

if (mapDiv) {
    const coordinates = JSON.parse(
        mapDiv.dataset.coordinates
    );

    const map = L.map("map").setView(
        [coordinates[1], coordinates[0]],
        13
    );

    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    ).addTo(map);

    L.marker([
        coordinates[1],
        coordinates[0]
    ]).addTo(map);
}