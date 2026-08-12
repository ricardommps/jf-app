import polyline from "@mapbox/polyline";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface ActivityDetailsMapProps {
  encodedPolyline?: string | null;
  height?: number;
  lineWeight?: number;
  fitPadding?: number;
}

export function ActivityDetailsMap({
  encodedPolyline,
  height = 430,
  lineWeight = 6,
  fitPadding = 28,
}: ActivityDetailsMapProps) {
  const coordinates = useMemo(() => {
    if (!encodedPolyline) {
      return [];
    }

    const decoded = polyline.decode(encodedPolyline);

    if (!decoded?.length) {
      return [];
    }

    return decoded.map(([lat, lng]) => [lat, lng]);
  }, [encodedPolyline]);

  if (coordinates.length < 2) {
    return <View style={[styles.placeholder, { height }]} />;
  }

  const coordsJSON = JSON.stringify(coordinates);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map { width: 100%; height: 100%; background: #191b20; overflow: hidden; }
          .leaflet-container {
            background: #191b20;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const coords = ${coordsJSON};
          const latlngs = coords.map(([lat, lng]) => [lat, lng]);
          const darkTilesUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
          const fallbackTilesUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            tap: false,
            touchZoom: false,
          });

          const primaryTiles = L.tileLayer(darkTilesUrl, {
            subdomains: 'abcd',
            maxZoom: 20,
          });

          let fallbackApplied = false;

          primaryTiles.on('tileerror', () => {
            if (fallbackApplied) {
              return;
            }

            fallbackApplied = true;

            try {
              map.removeLayer(primaryTiles);
            } catch (error) {
              // noop
            }

            document.body.style.background = '#d9dde5';
            document.getElementById('map').style.background = '#d9dde5';

            L.tileLayer(fallbackTilesUrl, {
              maxZoom: 20,
              attribution: '© OpenStreetMap contributors',
            }).addTo(map);
          });

          primaryTiles.addTo(map);

          const route = L.polyline(latlngs, {
            color: '#E7EBF6',
            weight: ${lineWeight},
            opacity: 0.98,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          map.fitBounds(route.getBounds(), {
            padding: [${fitPadding}, ${fitPadding}],
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height }]} pointerEvents="none">
      <WebView
        source={{ html }}
        style={styles.map}
        originWhitelist={["*"]}
        javaScriptEnabled
        scrollEnabled={false}
        nestedScrollEnabled={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#191b20",
  },
  map: {
    flex: 1,
    backgroundColor: "#191b20",
  },
  placeholder: {
    width: "100%",
    backgroundColor: "#191b20",
  },
});
