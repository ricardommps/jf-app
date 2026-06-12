import polyline from "@mapbox/polyline";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface ActivityMapProps {
  encodedPolyline: string;
}

export function ActivityMap({ encodedPolyline }: ActivityMapProps) {
  const coordinates = useMemo(() => {
    if (!encodedPolyline) return [];
    const decoded = polyline.decode(encodedPolyline);
    if (!decoded || decoded.length === 0) return [];
    return decoded.map(([lat, lng]) => [lat, lng]);
  }, [encodedPolyline]);

  if (coordinates.length < 2) return null;

  const start = coordinates[0];
  const end = coordinates[coordinates.length - 1];
  const coordsJSON = JSON.stringify(coordinates);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const coords = ${coordsJSON};

        const map = L.map('map', {
          zoomControl: false,
          attributionControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 20,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const latlngs = coords.map(([lat, lng]) => [lat, lng]);

        const route = L.polyline(latlngs, {
          color: '#FF4C00',
          weight: 4,
          opacity: 1,
        }).addTo(map);

        // Marcador de início (verde)
        const startIcon = L.divIcon({
          className: '',
          html: '<div style="width:12px;height:12px;background:#22c55e;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
          iconAnchor: [6, 6],
        });

        // Marcador de fim (vermelho)
        const endIcon = L.divIcon({
          className: '',
          html: '<div style="width:12px;height:12px;background:#ef4444;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
          iconAnchor: [6, 6],
        });

        L.marker([${start[0]}, ${start[1]}], { icon: startIcon }).addTo(map);
        L.marker([${end[0]}, ${end[1]}], { icon: endIcon }).addTo(map);

        map.fitBounds(route.getBounds(), { padding: [30, 30] });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        style={styles.map}
        scrollEnabled={false}
        originWhitelist={["*"]}
        javaScriptEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
});
