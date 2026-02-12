// Inicializa o mapa (Fortaleza como padrão)
const map = L.map('map').setView([-3.7319, -38.5267], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Correção para carregamento inicial e redimensionamento
function fixMap() {
    setTimeout(() => {
        map.invalidateSize();
    }, 400);
}

window.addEventListener('load', fixMap);
window.addEventListener('resize', fixMap);

let markerA, markerB, polyline;

document.getElementById('buscar-rota').addEventListener('click', async () => {
    const orig = document.getElementById('origem').value;
    const dest = document.getElementById('destino').value;

    if (!orig || !dest) return;

    try {
        const urlA = `https://nominatim.openstreetmap.org/search?format=json&q=${orig}, Brasil`;
        const urlB = `https://nominatim.openstreetmap.org/search?format=json&q=${dest}, Brasil`;

        const [resA, resB] = await Promise.all([fetch(urlA), fetch(urlB)]);
        const dataA = await resA.json();
        const dataB = await resB.json();

        if (dataA.length > 0 && dataB.length > 0) {
            const locA = [dataA[0].lat, dataA[0].lon];
            const locB = [dataB[0].lat, dataB[0].lon];

            // Limpa o que já existe
            if (markerA) map.removeLayer(markerA);
            if (markerB) map.removeLayer(markerB);
            if (polyline) map.removeLayer(polyline);

            // Adiciona novos elementos
            markerA = L.marker(locA).addTo(map);
            markerB = L.marker(locB).addTo(map);
            polyline = L.polyline([locA, locB], {color: '#d4a373', weight: 4, dashArray: '8, 8'}).addTo(map);

            map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

            // Cálculo Matemático
            const dist = (map.distance(locA, locB) / 1000).toFixed(2);
            document.getElementById('distancia-val').innerText = dist;

            document.getElementById('matrix-status').innerHTML = `
                SISTEMA RESOLVIDO:<br>
                Vetor d: ${dist} km<br>
                Status: Matriz Identidade alcançada.
            `;
        }
    } catch (e) {
        console.error("Erro na busca", e);
    }
});