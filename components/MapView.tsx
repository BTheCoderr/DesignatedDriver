import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';

interface MapViewProps {
  latitude: number;
  longitude: number;
  destinationLat?: number;
  destinationLng?: number;
  showRoute?: boolean;
  height?: number;
  style?: any;
}

export default function MapView({
  latitude,
  longitude,
  destinationLat,
  destinationLng,
  showRoute = false,
  height = 300,
  style,
}: MapViewProps) {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  useEffect(() => {
    // Get Mapbox token from environment (will be set in Netlify)
    const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
    setMapboxToken(token);
  }, []);

  // If no token, show placeholder
  if (!mapboxToken) {
    return (
      <View style={[styles.placeholder, { height }, style]}>
        <View style={styles.placeholderContent}>
          <Text style={styles.placeholderEmoji}>🗺️</Text>
          <Text style={styles.placeholderText}>Map Loading...</Text>
          <Text style={styles.placeholderSubtext}>
            Add EXPO_PUBLIC_MAPBOX_TOKEN to see map
          </Text>
        </View>
      </View>
    );
  }

  // Build route if destination provided
  const routeQuery = showRoute && destinationLat && destinationLng
    ? `&destination=${destinationLng},${destinationLat}`
    : '';

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
      <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        .mapboxgl-ctrl-logo { display: none !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        mapboxgl.accessToken = '${mapboxToken}';
        const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [${longitude}, ${latitude}],
          zoom: 13
        });

        // Add pickup marker
        new mapboxgl.Marker({ color: '#007AFF' })
          .setLngLat([${longitude}, ${latitude}])
          .setPopup(new mapboxgl.Popup().setHTML('<b>Pickup Location</b>'))
          .addTo(map);

        ${showRoute && destinationLat && destinationLng ? `
        // Add destination marker
        new mapboxgl.Marker({ color: '#4CAF50' })
          .setLngLat([${destinationLng}, ${destinationLat}])
          .setPopup(new mapboxgl.Popup().setHTML('<b>Destination</b>'))
          .addTo(map);

        // Draw route line
        map.on('load', () => {
          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [${longitude}, ${latitude}],
                  [${destinationLng}, ${destinationLat}]
                ]
              }
            }
          });

          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#007AFF',
              'line-width': 4
            }
          });

          // Fit bounds to show both points
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([${longitude}, ${latitude}]);
          bounds.extend([${destinationLng}, ${destinationLat}]);
          map.fitBounds(bounds, { padding: 50 });
        });
        ` : ''}
      </script>
    </body>
    </html>
  `;

  // For web, use iframe; for native, use WebView
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height }, style]}>
        <iframe
          srcDoc={mapHtml}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
          title="Map"
        />
      </View>
    );
  }

  // For native, we'd use WebView but for now just show placeholder
  // (WebView requires native module setup)
  return (
    <View style={[styles.placeholder, { height }, style]}>
      <View style={styles.placeholderContent}>
        <Text style={styles.placeholderEmoji}>🗺️</Text>
        <Text style={styles.placeholderText}>Map View</Text>
        <Text style={styles.placeholderSubtext}>
          Map integration available on web
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  placeholder: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  placeholderContent: {
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeholderSubtext: {
    color: '#888',
    fontSize: 12,
  },
});

// Fix for missing Text import
import { Text } from 'react-native';
