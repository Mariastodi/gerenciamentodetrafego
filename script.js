const map = L.map('map').setView([-3.7319, -38.5267], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

setTimeout(() => {
    map.invalidateSize();
}, 200);

let markerA, markerB, polyline;

document.getElementById('buscar-rota').addEventListener('click', async () => {
    const orig = document.getElementById('origem').value;
    const dest = document.getElementById('destino').value;

    if (!orig || !dest) return alert("Por favor, digite a origem e o destino.");

    try {
        const urlA = `https://nominatim.openstreetmap.org/search?format=json&q=${orig}, Brasil`;
        const urlB = `https://nominatim.openstreetmap.org/search?format=json&q=${dest}, Brasil`;

        const [resA, resB] = await Promise.all([fetch(urlA), fetch(urlB)]);
        const dataA = await resA.json();
        const dataB = await resB.json();

        if (dataA.length > 0 && dataB.length > 0) {
            const locA = [dataA[0].lat, dataA[0].lon];
            const locB = [dataB[0].lat, dataB[0].lon];

            desenharRota(locA, locB);
        } else {
            alert("Local não encontrado. Tente ser mais específico (Bairro, Cidade).");
        }
    } catch (error) {
        console.error("Erro na API:", error);
    }
});

function desenharRota(coordA, coordB) {
    if (markerA) map.removeLayer(markerA);
    if (markerB) map.removeLayer(markerB);
    if (polyline) map.removeLayer(polyline);

    markerA = L.marker(coordA).addTo(map).bindPopup("Entrada (A)");
    markerB = L.marker(coordB).addTo(map).bindPopup("Saída (B)");

    polyline = L.polyline([coordA, coordB], {
        color: '#d4a373', 
        weight: 4,
        dashArray: '10, 10'
    }).addTo(map);

    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    const dist = (map.distance(coordA, coordB) / 1000).toFixed(2);
    document.getElementById('distancia-val').innerText = dist;

    document.getElementById('matrix-status').innerHTML = `
        SISTEMA GERADO:<br>
        [ 1  0 | ${coordA[1].toString().slice(0,5)} ]<br>
        [ 0  1 | ${coordB[1].toString().slice(0,5)} ]<br><br>
        SOLUÇÃO: Fluxo Estável<br>
        Custo Linear: ${dist} units
    `;
}