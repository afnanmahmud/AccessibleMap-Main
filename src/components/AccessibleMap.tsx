import React, { useEffect, useRef, useState, useCallback } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { fromLonLat } from 'ol/proj';
import { Icon, Style, Stroke } from 'ol/style';
import { defaults as defaultControls } from 'ol/control';
import Openrouteservice from 'openrouteservice-js';
import MapSearch from './MapSearch/MapSearch';
import './AccessibleMap.css';
import 'ol/ol.css';

// Constants
const orsDirections = new Openrouteservice.Directions({
  api_key: '5b3ce3597851110001cf6248a1d686e75cef4e86a9782464ccdb71cf',
});

const INITIAL_CENTER = fromLonLat([-84.5831, 34.0390]);

const ACCESSIBLE_LOCATIONS: Location[] = [
    { name: 'Carmichael Student Center', coordinates: [-84.5831447839737, 34.038533480073355] },
    { name: 'Carmichael Student Center ', coordinates: [-84.58283364772798, 34.038660170620055] },
    { name: 'Academic Learning Center', coordinates: [-84.58317697048189, 34.03931806936354] },
    { name: 'Academic Learning Center ', coordinates: [-84.58298921585084, 34.03978259614599] },
    { name: 'English', coordinates: [-84.58414524793626, 34.03942475516541] },
    { name: 'English ', coordinates: [-84.5841532945633, 34.03910025210137] },
    { name: 'English ', coordinates: [-84.58402454853059, 34.03979815441523] },
    { name: 'University Hall', coordinates: [-84.58437055349351, 34.038938000103784] },
    { name: 'Willingham Hall', coordinates: [-84.58483189344408, 34.038973562212] },
    { name: 'Social Sciences', coordinates: [-84.58521813154222, 34.03870240076022] },
    { name: "Technology Services", "coordinates": [-84.58511178527453, 34.04324444304241] },
    { name: "Jolley Lodge", "coordinates": [-84.58503997779815, 34.041975382594565] },
    { name: "Bailey Performance Center", "coordinates": [-84.58388467029071, 34.04104538235975] },
    { name: "Zuckerman Museum", "coordinates": [-84.58332319433181, 34.041127569948884] },
    { name: "Prillaman Health Sciences", "coordinates": [-84.5823230947359, 34.04126007515278] },
    { name: "Prillaman Health Sciences 2", "coordinates": [-84.58227837728104, 34.04040804794117] },
    { name: "Prillaman Health Sciences 3", "coordinates": [-84.58162052602621, 34.04049249904415] },
    { name: "Central Parking Deck", "coordinates": [-84.58155510939581, 34.04091628989932] },
    { name: "Visual Arts", "coordinates": [-84.58495900426912, 34.04014013820758] },
    { name: "Wilson Annex", "coordinates": [-84.58407716154898, 34.040382041842314] },
    { name: "Wilson Building", "coordinates": [-84.5831444233547, 34.04021534710124] },
    { name: "Music Building", "coordinates": [-84.58287930990906, 34.040181974276315] },
    { name: "The Commons", "coordinates": [-84.5822049725835, 34.040112254887596] },
    { name: "Burruss Building", "coordinates": [-84.58182548615811, 34.03916307618097] },
    { name: "Burruss Building 2", "coordinates": [-84.58151844214942, 34.039334634541554] },
    { name: "Bagwell Education Building", "coordinates": [-84.58087532494412, 34.0396379119677] },
    { name: "Bagwell Education Building 2", "coordinates": [-84.5809418434928, 34.039037425081695] },
    { name: "Kennesaw Hall", "coordinates": [-84.580944525696, 34.03889684364226] },
    { name: "Kennesaw Hall 2", "coordinates": [-84.5807963755791, 34.037958423913985] },
    { name: "Kennesaw Hall 3", "coordinates": [-84.58038669152127, 34.03813234820042] },
    { name: "Convocation Center", "coordinates": [-84.5804216302843, 34.03739857647659] },
    { name: "Siegel Student Recreation & Activities Center", "coordinates": [-84.58134592872163, 34.03685306796862] },
    { name: "Siegel Student Recreation & Activities Center 2", "coordinates": [-84.58239021303122, 34.03685051220012] },
    { name: "Siegel Student Recreation & Activities Center 3", "coordinates": [-84.58220111729591, 34.03752287232788] },
    { name: 'East Parking Deck', coordinates: [-84.58115296368257, 34.0366216129326] },
    { name: 'University Bookstore', coordinates: [-84.5831169079928, 34.03785497707045] },
    { name: 'Sturgis Library', coordinates: [-84.58373969823, 34.03817439372666] },
    { name: 'Pilcher Building', coordinates: [-84.58447613924874, 34.038288000488095] },
    { name: 'Pilcher Building 2', coordinates: [-84.58431721837084, 34.03806406828368] },
    { name: 'Technology Annex', coordinates: [-84.58464920626845, 34.03786021162154] },
    { name: 'Math & Statistics', coordinates: [-84.58383582638564, 34.03772185089651] },
    { name: 'Public Safety', coordinates: [-84.58507185459054, 34.03779644824888] },
    { name: 'Office of Institutional Research', coordinates: [-84.58675097542397, 34.03693417640655] },
    { name: 'Institute for Cybersecurity Workforce Development', coordinates: [-84.58695333977656, 34.0366027572148] },
    { name: 'Catholic Center at KSU', coordinates: [-84.5868852037043, 34.03634308250317] },
    { name: 'Science Building', coordinates: [-84.5838534655383, 34.036176140973545] },
    { name: 'Clendenin Building', coordinates: [-84.5832859278377, 34.035990222567854] },
    { name: 'Science Laboratory', coordinates: [-84.58378799464447, 34.0358330372012] },
    { name: 'Town Point Office of Undergraduate Admissions', coordinates: [-84.5812208966054, 34.030192038882014] },
    { name: 'Town Point Office of Undergraduate Admissions 2', coordinates: [-84.581545605683, 34.02995662532501] },
    { name: 'Student Athlete Success Services', coordinates: [-84.58461356049521, 34.02971179412259] },
    { name: 'Owl\'s Nest', coordinates: [-84.57001181566912, 34.029991983405665] },
    { name: 'KSU Center', coordinates: [-84.57355444798323, 34.03153703386949] },
    { name: 'KSU Center 2', coordinates: [-84.57475627461659, 34.031628424526644] },
    { name: 'KSU Center 3', coordinates: [-84.5748219887467, 34.030627036521274] },
    { name: 'KSU Center 4', coordinates: [-84.57358939259085, 34.03052548858506] },
    { name: 'Public Safety & University Police', coordinates: [-84.56971263811648, 34.027141980291134] }
  ];

// Types
export interface AccessibleMapProps {
  className?: string;
}

export interface Location {
  name: string;
  coordinates: [number, number];
}

interface RouteOption {
  id: number;
  summary: string;
  distance: number; // in meters
  duration: number; // in seconds
  coordinates: number[][];
}

const AccessibleMap: React.FC<AccessibleMapProps> = ({ className }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource>(new VectorSource());
  const userMarkerRef = useRef<Feature<Point>>(new Feature());

  const [viewMode, setViewMode] = useState<'standard' | 'satellite'>('standard');
  const [startLocation, setStartLocation] = useState<string>('');
  const [endLocation, setEndLocation] = useState<string>('');
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);

  const placeMarkers = useCallback(() => {
    ACCESSIBLE_LOCATIONS.forEach(({ coordinates }) => {
      const marker = new Feature({
        geometry: new Point(fromLonLat(coordinates)),
      });

      marker.setStyle(
        new Style({
          image: new Icon({
            src: 'https://cdn2.iconfinder.com/data/icons/wsd-map-markers-2/512/wsd_markers_97-512.png',
            scale: 0.04,
            anchor: [0.5, 1],
          }),
        })
      );

      vectorSourceRef.current.addFeature(marker);
    });
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const coordinates = fromLonLat([coords.longitude, coords.latitude]);
        userMarkerRef.current.setGeometry(new Point(coordinates));

        if (!vectorSourceRef.current.hasFeature(userMarkerRef.current)) {
          userMarkerRef.current.setStyle(
            new Style({
              image: new Icon({
                src: 'https://cdn-icons-png.flaticon.com/128/884/884094.png',
                scale: 0.2,
              }),
            })
          );
          vectorSourceRef.current.addFeature(userMarkerRef.current);
        }

        mapInstance.current?.getView().setCenter(coordinates);
      },
      (error) => console.error('Tracking error:', error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const vectorLayer = new VectorLayer({ source: vectorSourceRef.current });
    const standardLayer = new TileLayer({ source: new OSM(), visible: true });
    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 19,
      }),
      visible: false,
    });

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [standardLayer, satelliteLayer, vectorLayer],
      view: new View({
        center: INITIAL_CENTER,
        zoom: 17,
        maxZoom: 19,
      }),
      controls: defaultControls(),
    });

    placeMarkers();
    startTracking();

    return () => {
      mapInstance.current?.setTarget(undefined);
    };
  }, [placeMarkers, startTracking]);

  const toggleViewMode = useCallback(() => {
    if (!mapInstance.current) return;

    const layers = mapInstance.current.getLayers().getArray();
    layers[0].setVisible(viewMode === 'satellite');
    layers[1].setVisible(viewMode === 'standard');
    setViewMode((prev) => (prev === 'standard' ? 'satellite' : 'standard'));
  }, [viewMode]);

  const findLocationByName = useCallback((query: string): number[] | null => {
    if (!query) return null;

    const lowerQuery = query.toLowerCase();
    return (
      ACCESSIBLE_LOCATIONS.find(
        (loc) =>
          loc.name.toLowerCase() === lowerQuery ||
          loc.name.toLowerCase().includes(lowerQuery)
      )?.coordinates || null
    );
  }, []);

  const clearRoutes = useCallback(() => {
    vectorSourceRef.current
      .getFeatures()
      .filter(
        (feature: Feature) =>
          feature.getGeometry() instanceof LineString ||
          feature.get('type') === 'marker'
      )
      .forEach((feature: Feature) =>
        vectorSourceRef.current?.removeFeature(feature)
      );
  }, []);

  // Debounce effect to detect when user finishes typing in End input
  useEffect(() => {
    if (!startLocation || !endLocation) {
      setIsFlyoutOpen(false);
      setRouteOptions([]);
      return;
    }

    const timer = setTimeout(() => {
      const startCoords = findLocationByName(startLocation);
      const endCoords = findLocationByName(endLocation);

      if (!startCoords || !endCoords) {
        setIsFlyoutOpen(false);
        setRouteOptions([]);
        return;
      }

      // Calculate routes
      orsDirections
        .calculate({
          coordinates: [startCoords, endCoords],
          profile: 'foot-walking',
          format: 'geojson',
          alternative_routes: { target_count: 3, share_factor: 0.6 },
        })
        .then((response: any) => {
          const routes = response.features.map((feature: any, index: number) => ({
            id: index,
            summary: `Route ${index + 1}`,
            distance: feature.properties.summary.distance,
            duration: feature.properties.summary.duration,
            coordinates: feature.geometry.coordinates,
          }));
          setRouteOptions(routes);
          setIsFlyoutOpen(true);
        })
        .catch((err: Error) => {
          console.error('Route calculation error:', err);
          setIsFlyoutOpen(false);
          setRouteOptions([]);
        });
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [startLocation, endLocation, findLocationByName]);

  const calculateRoute = useCallback(() => {
    if (selectedRouteId === null || !routeOptions.length) {
      alert('Please select a route to start.');
      return;
    }

    clearRoutes();

    const startCoords = findLocationByName(startLocation);
    const endCoords = findLocationByName(endLocation);

    if (!startCoords || !endCoords) {
      alert('Please enter valid start and end locations');
      return;
    }

    const startPoint = fromLonLat(startCoords);
    const endPoint = fromLonLat(endCoords);

    const addMarker = (point: number[], src: string) => {
      const marker = new Feature({
        geometry: new Point(point),
        type: 'marker',
      });
      marker.setStyle(
        new Style({
          image: new Icon({
            src,
            scale: 0.2,
            anchor: [0.5, 1],
          }),
        })
      );
      vectorSourceRef.current.addFeature(marker);
    };

    addMarker(startPoint, 'https://cdn-icons-png.flaticon.com/128/7976/7976202.png');
    addMarker(endPoint, 'https://cdn-icons-png.flaticon.com/128/9131/9131546.png');

    mapInstance.current?.getView().fit(
      [
        Math.min(startPoint[0], endPoint[0]),
        Math.min(startPoint[1], endPoint[1]),
        Math.max(startPoint[0], endPoint[0]),
        Math.max(startPoint[1], endPoint[1]),
      ],
      { padding: [50, 50, 50, 50], duration: 1000, maxZoom: 18 }
    );

    // Display the selected route
    const selectedRoute = routeOptions.find((route) => route.id === selectedRouteId);
    if (selectedRoute) {
      const routeFeature = new Feature({
        geometry: new LineString(
          selectedRoute.coordinates.map((coord: number[]) => fromLonLat(coord))
        ),
      });

      routeFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: 'blue',
            width: 4,
          }),
        })
      );

      vectorSourceRef.current.addFeature(routeFeature);
    }

    // Close the flyout
    setIsFlyoutOpen(false);
  }, [startLocation, endLocation, selectedRouteId, routeOptions, clearRoutes]);

  return (
    <div className="map-wrapper">
      <div className="map-page">
        <div className="top-bar">
          <div className="search-container">
            <MapSearch
              onStartChange={setStartLocation}
              onEndChange={setEndLocation}
              onSubmit={calculateRoute}
              locations={ACCESSIBLE_LOCATIONS}
            />
          </div>
        </div>

        <div className="map-content">
          {isFlyoutOpen && (
            <div className="route-flyout">
              <h2>Route Options</h2>
              {routeOptions.map((route) => (
                <div
                  key={route.id}
                  className={`route-option ${
                    selectedRouteId === route.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedRouteId(route.id)}
                >
                  <h3>{route.summary}</h3>
                  <p>Distance: {(route.distance / 1000).toFixed(2)} km</p>
                  <p>Duration: {Math.round(route.duration / 60)} minutes</p>
                </div>
              ))}
            </div>
          )}
          <div
            className={`map-root ${className || ''} ${
              isFlyoutOpen ? 'shifted' : ''
            }`}
          >
            <div
              ref={mapRef}
              className="map-container"
              role="application"
              aria-label="Interactive accessibility map"
            />
            <div className="map-controls">
              <button onClick={toggleViewMode} className="map-toggle-button" 
                aria-label={'${viewMode} view. Switch map view'>
                {viewMode === 'standard' ? 'Satellite' : 'Standard'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibleMap;
