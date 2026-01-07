import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Web-compatible MapView component
 * Uses Google Maps Embed API for web
 */
const WebMapView = ({
    children,
    style,
    initialRegion,
    region,
    onRegionChange,
    onRegionChangeComplete,
    provider,
    showsUserLocation,
    followsUserLocation,
    ...props
}) => {
    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = React.useState(false);

    // Use region or initialRegion
    const currentRegion = region || initialRegion || {
        latitude: 28.6139,
        longitude: 77.2090,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    useEffect(() => {
        // Load Google Maps script
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKW4nM5UPKsNHEMhhPcSilNv3I`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setMapLoaded(true);
                initializeMap();
            };
            document.head.appendChild(script);
        } else {
            setMapLoaded(true);
            initializeMap();
        }
    }, []);

    const initializeMap = () => {
        if (mapRef.current && window.google) {
            const map = new window.google.maps.Map(mapRef.current, {
                center: {
                    lat: currentRegion.latitude,
                    lng: currentRegion.longitude
                },
                zoom: 13,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });

            // Store map instance for children to access
            mapRef.current.googleMap = map;

            // Render markers
            if (children) {
                React.Children.forEach(children, (child) => {
                    if (child && child.type === Marker) {
                        renderMarker(map, child.props);
                    } else if (child && child.type === Polyline) {
                        renderPolyline(map, child.props);
                    }
                });
            }
        }
    };

    const renderMarker = (map, props) => {
        if (props.coordinate && window.google) {
            new window.google.maps.Marker({
                position: {
                    lat: props.coordinate.latitude,
                    lng: props.coordinate.longitude
                },
                map: map,
                title: props.title || '',
            });
        }
    };

    const renderPolyline = (map, props) => {
        if (props.coordinates && window.google) {
            const path = props.coordinates.map(coord => ({
                lat: coord.latitude,
                lng: coord.longitude,
            }));

            new window.google.maps.Polyline({
                path: path,
                map: map,
                strokeColor: props.strokeColor || '#000',
                strokeWeight: props.strokeWidth || 2,
            });
        }
    };

    useEffect(() => {
        if (mapLoaded && mapRef.current?.googleMap) {
            initializeMap();
        }
    }, [children, mapLoaded]);

    return (
        <View style={[styles.container, style]}>
            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: 400,
                }}
            />
            {!mapLoaded && (
                <View style={styles.loading}>
                    <Text>Loading map...</Text>
                </View>
            )}
        </View>
    );
};

/**
 * Web-compatible Marker component
 */
const Marker = ({ coordinate, title, description, onPress, children, ...props }) => {
    // This is a placeholder - actual rendering happens in WebMapView
    return null;
};

/**
 * Web-compatible Polyline component
 */
const Polyline = ({ coordinates, strokeColor, strokeWidth, ...props }) => {
    // This is a placeholder - actual rendering happens in WebMapView
    return null;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    loading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
});

WebMapView.Marker = Marker;
WebMapView.Polyline = Polyline;

export default WebMapView;
export { Marker, Polyline };
