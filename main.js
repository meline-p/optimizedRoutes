function init(){

    function getRandomCoordinate(min, max){
        return Math.random() * (max - min) + min ;
    }

    // Générer des points aléatoires
    function generateRandomPoints(numPoints) {
        const points = [];
        for(let i = 0; i < numPoints; i++){
            points.push({
                name: `Point ${i + 1}`,
                lat : getRandomCoordinate(43.30, 43.60),
                lon: getRandomCoordinate(5.20,5.70)
            })
        }

        return points;
    }

    // Générer les points aléatoires
    const points = generateRandomPoints(8);
    

    // Initialisation de la carte
    const zoomLevel = 7;

    const map = L.map('map').setView([points[0].lat, points[0].lon], zoomLevel);

    const mainLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    mainLayer.addTo(map);


    // calculer la distance en ligne droite entre 2 points
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

        // Choisir un point de départ, par exemple le premier
        let currentPoint = points[0];
        route.push(currentPoint);
        visited.add(currentPoint.name);

        while(visited.size < points.length){
            let closestPoint = null;
            let shortestDistance = Infinity;

            // Chercher le point le plus proche qui n'a pas encore été visité
            points.forEach(point => {
                if(!visited.has(point.name)) {
                    // pour chaque point non visité

                    // on calcule la distance
                    const distance = calculateDistance(
                        currentPoint.lat, 
                        currentPoint.lon, 
                        point.lat, 
                        point.lon
                    );

                    // on garde la distance qui est la plus courte
                    if(distance < shortestDistance) {
                        shortestDistance = distance;
                        closestPoint = point;
                    }
                }
            })

            // Ajouter le point le plus proche à l'itinéraire et le marquer comme visité
            route.push(closestPoint);
            visited.add(closestPoint.name);
            currentPoint = closestPoint;
        }

        // Boucler le polygone en revenant au point de départ
        route.push(route[0]);

        return route;
    }

    // Calculer le trajet optimisé
    const optimizedRoute = findOptimizedRoute(points);
    console.log(optimizedRoute);

    // Tracer le polygone sur la carte
    const polygonCoords = optimizedRoute.map(point => [point.lat, point.lon]);

    L.polygon(polygonCoords).addTo(map);

    // Marqueurs pour chaque point
    optimizedRoute.forEach(point => {
        L.marker([point.lat, point.lon]).addTo(map)
            .bindPopup(point.name)
            .openPopup();
    });

}
