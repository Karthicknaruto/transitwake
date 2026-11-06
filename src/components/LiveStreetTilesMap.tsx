import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { Coordinates } from '../types';
import { SWIGGY_THEME } from '../theme/swiggyTheme';

interface LiveStreetTilesMapProps {
  currentLocation: Coordinates | null;
  destination: Coordinates | null;
  destinationName: string;
  radiusKm: number;
  onSelectCoordinate: (coord: Coordinates) => void;
}

export const LiveStreetTilesMap: React.FC<LiveStreetTilesMapProps> = ({
  currentLocation,
  destination,
  destinationName,
  radiusKm,
  onSelectCoordinate,
}) => {
  const iframeRef = useRef<any>(null);

  // Default coordinate if null (e.g. New York / Central Station)
  const defaultLat = destination ? destination.latitude : 40.7527;
  const defaultLon = destination ? destination.longitude : -73.9772;

  const userLat = currentLocation ? currentLocation.latitude : defaultLat - 0.05;
  const userLon = currentLocation ? currentLocation.longitude : defaultLon;

  const destLat = destination ? destination.latitude : defaultLat;
  const destLon = destination ? destination.longitude : defaultLon;

  // Listen to clicks on the real street map with strict source origin validation
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleMessage = (event: MessageEvent) => {
        // Security check: Only accept messages originating from our trusted map iframe
        if (iframeRef.current && event.source !== iframeRef.current.contentWindow) {
          return;
        }

        if (event.data && event.data.type === 'MAP_CLICK') {
          const lat = Number(event.data.lat);
          const lon = Number(event.data.lon);
          if (!isNaN(lat) && !isNaN(lon)) {
            onSelectCoordinate({
              latitude: lat,
              longitude: lon,
            });
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [onSelectCoordinate]);

  // Send real-time coordinate updates into the Leaflet map without full re-render
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'UPDATE_LOCATIONS',
          userLat,
          userLon,
          destLat,
          destLon,
          radiusMeters: radiusKm * 1000,
          destName: destinationName || 'Destination Stop',
        },
        '*'
      );
    }
  }, [userLat, userLon, destLat, destLon, radiusKm, destinationName]);

  // Self-contained Leaflet street map template with Swiggy style live delivery tracking
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map {
      margin: 0; padding: 0; width: 100%; height: 100%;
      background: #F4F5F7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .user-pulse-marker {
      position: relative;
    }
    .user-scooter-bubble {
      width: 24px; height: 24px; background: #FC8019; border-radius: 50%;
      border: 3px solid #FFFFFF; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2);
      display: flex; align-items: center; justify-content: center;
    }
    .user-inner {
      width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%;
    }
    .pulse-ring {
      position: absolute; top: -6px; left: -6px; width: 36px; height: 36px;
      border-radius: 50%; background: rgba(252, 128, 25, 0.25);
      animation: pulse 2s infinite ease-out;
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .dest-pin {
      width: 24px; height: 24px; background: #0F172A; border-radius: 50%;
      border: 3px solid #FFFFFF; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.25);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
    }
    .dest-inner {
      width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%;
    }
    .leaflet-popup-content-wrapper {
      background: #FFFFFF; color: #0F172A; border-radius: 8px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12px;
      padding: 4px;
    }
    .leaflet-popup-tip { background: #FFFFFF; }
    .map-tag {
      position: absolute; top: 12px; right: 12px; z-index: 1000;
      background: #FFFFFF; color: #0F172A; padding: 5px 10px;
      border-radius: 6px; font-size: 11px; font-weight: 500; border: 1px solid #E2E8F0;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06); pointer-events: none;
      display: flex; align-items: center; gap: 4px;
    }
  </style>
</head>
<body>
  <div class="map-tag">Live tracking • Tap map to change stop</div>
  <div id="map"></div>

  <script>
    var curUserLat = ${userLat};
    var curUserLon = ${userLon};
    var curDestLat = ${destLat};
    var curDestLon = ${destLon};
    var curRadius = ${radiusKm * 1000};

    // Initialize Map with Google Maps / CartoDB style street tiles
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([curDestLat, curDestLon], 12);

    // OpenStreetMap modern street tile layer (100% free, zero API key required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Destination Pin Marker
    var destIcon = L.divIcon({
      className: 'dest-pin-container',
      html: '<div class="dest-pin"><div class="dest-inner"></div></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    var destMarker = L.marker([curDestLat, curDestLon], { icon: destIcon }).addTo(map);
    destMarker.bindPopup("<b>Destination stop</b><br/>Alarm triggers at " + (curRadius/1000).toFixed(1) + " km");

    // 4 km Trigger Geofence Circle
    var geofenceCircle = L.circle([curDestLat, curDestLon], {
      color: '#FC8019',
      fillColor: '#FC8019',
      fillOpacity: 0.14,
      weight: 2,
      dashArray: '5, 5',
      radius: curRadius
    }).addTo(map);

    // User Commuter Live Position Marker
    var userIcon = L.divIcon({
      className: 'user-pulse-marker',
      html: '<div class="pulse-ring"></div><div class="user-scooter-bubble"><div class="user-inner"></div></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    var userMarker = L.marker([curUserLat, curUserLon], { icon: userIcon }).addTo(map);
    userMarker.bindPopup("<b>Current location</b>");

    // Polyline connecting User to Stop
    var routeLine = L.polyline([
      [curUserLat, curUserLon],
      [curDestLat, curDestLon]
    ], {
      color: '#FC8019',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8'
    }).addTo(map);

    // Fit map bounds to view both user and destination
    function fitMap() {
      var bounds = L.latLngBounds([
        [curUserLat, curUserLon],
        [curDestLat, curDestLon]
      ]);
      map.fitBounds(bounds.pad(0.35));
    }
    fitMap();

    // Map Tap / Click Listener: Send coordinates back to React Native
    map.on('click', function(e) {
      window.parent.postMessage({
        type: 'MAP_CLICK',
        lat: e.latlng.lat,
        lon: e.latlng.lng
      }, '*');
    });

    // Real-time message listener for live location updates from GPS or Commute Simulator
    window.addEventListener('message', function(e) {
      if (!e.data || e.data.type !== 'UPDATE_LOCATIONS') return;

      var d = e.data;
      curUserLat = d.userLat;
      curUserLon = d.userLon;
      curDestLat = d.destLat;
      curDestLon = d.destLon;
      curRadius = d.radiusMeters;

      // Update User marker
      userMarker.setLatLng([curUserLat, curUserLon]);

      // Update Destination marker & Geofence circle
      destMarker.setLatLng([curDestLat, curDestLon]);
      geofenceCircle.setLatLng([curDestLat, curDestLon]);
      geofenceCircle.setRadius(curRadius);

      // Update Route line
      routeLine.setLatLngs([
        [curUserLat, curUserLon],
        [curDestLat, curDestLon]
      ]);

      // Visual color change when inside 4km zone
      var dist = map.distance([curUserLat, curUserLon], [curDestLat, curDestLon]);
      if (dist <= curRadius) {
        geofenceCircle.setStyle({ color: '#E53E3E', fillColor: '#E53E3E', fillOpacity: 0.28 });
      } else {
        geofenceCircle.setStyle({ color: '#FC8019', fillColor: '#FC8019', fillOpacity: 0.14 });
      }
    });
  </script>
</body>
</html>
  `;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webMapContainer}>
        <iframe
          ref={iframeRef}
          title="Live Street Map"
          srcDoc={htmlContent}
          sandbox="allow-scripts allow-same-origin"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          } as any}
        />
      </View>
    );
  }

  // Fallback placeholder for native simulator if iframe is not supported
  return (
    <View style={styles.nativeFallback}>
      <Text style={styles.fallbackText}>Live tracking active ({userLat.toFixed(3)}, {userLon.toFixed(3)})</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  webMapContainer: {
    width: '100%',
    height: 380,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: SWIGGY_THEME.colors.border,
    overflow: 'hidden',
  },
  nativeFallback: {
    height: 300,
    backgroundColor: SWIGGY_THEME.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: SWIGGY_THEME.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
