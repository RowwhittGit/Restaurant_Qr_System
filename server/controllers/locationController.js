import * as turf from '@turf/turf';

const restaurantArea = {
    type: "Feature",
    properites: {},
    geometry: {
            type: "Polygon",
            coordinates: [
          [
            [
              85.27449595046653,
              27.678563890752656
            ],
            [
              85.27445376629254,
              27.678430917784027
            ],
            [
              85.2745185491313,
              27.678405123677592
            ],
            [
              85.27459036266379,
              27.678537651952382
            ],
            [
              85.27449595046653,
              27.678563890752656
            ]
          ]
            ],
          },
}

const checkLocation = ((req, res) => {
    console.log("Received:", req.body);
    const { lat, lng } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({ message: "Missing coordinates" });
    }

    const point = turf.point([lng, lat]);
    const polygon = restaurantArea;

    const isInside = turf.booleanPointInPolygon(point, polygon);

    // Prepare response object
    let response = { 
        inside: isInside, 
        lat, 
        lng 
    };

    // If outside, calculate distance to polygon
    if (!isInside) {
        try {
            // Get the polygon boundary as a LineString
            const polygonBoundary = turf.polygonToLine(polygon);
            
            // Calculate distance from point to polygon boundary
            const distance = turf.pointToLineDistance(point, polygonBoundary, { units: 'kilometers' });
            
            // Find the nearest point on the polygon boundary
            const nearestPoint = turf.nearestPointOnLine(polygonBoundary, point);
            
            // Add distance information to response
            response.distance = {
                kilometers: Math.round(distance * 1000) / 1000, // Round to 3 decimal places
                meters: Math.round(distance * 1000),
                nearestPoint: {
                    lat: nearestPoint.geometry.coordinates[1],
                    lng: nearestPoint.geometry.coordinates[0]
                }
            };
            
            console.log(`User is outside delivery area. Distance: ${response.distance.kilometers} km`);
        } catch (error) {
            console.error('Error calculating distance:', error);
            // If distance calculation fails, still return the inside/outside status
            response.distanceError = 'Could not calculate distance';
        }
    } else {
        console.log('User is inside delivery area');
    }

    res.json(response);
});

export { checkLocation };