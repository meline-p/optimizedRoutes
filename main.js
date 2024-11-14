function init(){

    // initialisation de leaflet
    const map = L.map('map').setView([43.45, 5.45], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // générer des coordonnées aléatoires
    function getRandomCoordinate(min, max) {
        return Math.random() * (max - min) + min;
    }

    // générer des points aléatoires
    function generateRandomPoints(numPoints) {
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            points.push({
                name: `Point ${i + 1}`,
                lat: getRandomCoordinate(43.30, 43.60),
                lon: getRandomCoordinate(5.20, 5.70)
            });
        }
        return points;
    }

    const points = generateRandomPoints(8);

    // Icône personnalisé pour le premier point
    const startIcon = L.AwesomeMarkers.icon({
        icon: 'play', // Choix de l'icône
        markerColor: 'red', // Couleur du marqueur
        prefix: 'fa' // Utilisation de Font Awesome
      });

    // afficher un markeur pour chaque point
    points.forEach((point, index) => {
        const markerOptions = index === 0 ? { icon: startIcon } : {}; // Icône spéciale pour le premier point
        L.marker([point.lat, point.lon], markerOptions).addTo(map)
        .bindPopup(point.name)
        .openPopup();
    });

     // Fonction de calcul de distance en coordonnées géographiques
     function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Rayon de la Terre en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Algorithme pour trouver le parcours optimisé
    function findOptimizedRoute(points) {
        const visited = new Set();
        const route = [];
        let currentPoint = points[0];
        route.push(currentPoint);
        visited.add(currentPoint.name);

        while(visited.size < points.length){
            let closestPoint = null;
            let shortestDistance = Infinity;

            points.forEach(point => {
                if(!visited.has(point.name)) {
                    const distance = calculateDistance(
                        currentPoint.lat, 
                        currentPoint.lon, 
                        point.lat, 
                        point.lon
                    );
                    if(distance < shortestDistance) {
                        shortestDistance = distance;
                        closestPoint = point;
                    }
                }
            });

            route.push(closestPoint);
            visited.add(closestPoint.name);
            currentPoint = closestPoint;
        }

        // Boucler en revenant au point de départ
        route.push(route[0]);

        return route;
    }

    const optimizedRoute = findOptimizedRoute(points);

    // Fonction pour afficher l'itinéraire segment par segment
    async function displayRoute(route) {
        for (let i = 0; i < route.length - 1; i++) {
            const start = route[i];
            const end = route[i + 1];
            const url = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?geometries=geojson&overview=full`;

            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data && data.routes && data.routes.length > 0) {
                    const segment = data.routes[0].geometry.coordinates;
                    const latLngs = segment.map(coord => [coord[1], coord[0]]);

                    // Afficher le segment de route sur la carte
                    L.polyline(latLngs, { color: 'blue', weight: 4 }).addTo(map);
                } else {
                    console.log("Aucun segment d'itinéraire trouvé.");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de l'itinéraire:", error);
            }
        }
    }

    // Afficher l'itinéraire optimisé
    displayRoute(optimizedRoute);
}
