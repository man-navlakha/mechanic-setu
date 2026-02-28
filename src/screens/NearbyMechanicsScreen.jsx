import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from '../components/PlatformMap';
import api from '../utils/api';

const RADIUS_OPTIONS = [3, 5, 10, 20];

const getMechanicCoords = (mech) => {
    const latitude = Number(mech.shop_latitude || mech.current_latitude || mech.location?.shop?.latitude);
    const longitude = Number(mech.shop_longitude || mech.current_longitude || mech.location?.shop?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude };
};

const getPhone = (mech) => {
    return mech.phone || mech.mechanic?.phone || mech.user?.phone || mech.mobile || mech.mechanic?.mobile || mech.contact_number || null;
};

const getName = (mech) => {
    return mech.full_name || mech.mechanic?.full_name || mech.user?.full_name || mech.shop_name || 'Mechanic Setu Partner';
};

export default function NearbyMechanicsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const initialLocation = route.params?.userLocation;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mechanics, setMechanics] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [radiusKm, setRadiusKm] = useState(5);
    const [selectedMechanicId, setSelectedMechanicId] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    const resolveUserLocation = useCallback(async () => {
        if (initialLocation?.latitude && initialLocation?.longitude) {
            setUserLocation({
                latitude: Number(initialLocation.latitude),
                longitude: Number(initialLocation.longitude),
            });
            return;
        }
        if (initialLocation?.lat && initialLocation?.lng) {
            setUserLocation({
                latitude: Number(initialLocation.lat),
                longitude: Number(initialLocation.lng),
            });
            return;
        }

        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
            setError('Location permission is required to find nearby mechanics.');
            setLoading(false);
            return;
        }
        const current = await Location.getCurrentPositionAsync({});
        setUserLocation({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
        });
    }, [initialLocation]);

    const fetchNearbyMechanics = useCallback(async () => {
        if (!userLocation?.latitude || !userLocation?.longitude) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/ms-mechanics/nearby', {
                params: {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    radius: radiusKm,
                },
            });
            const payload = res.data || {};
            const items = payload.mechanics || payload.data || [];
            setMechanics(Array.isArray(items) ? items : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load nearby mechanics.');
            setMechanics([]);
        } finally {
            setLoading(false);
        }
    }, [radiusKm, userLocation]);

    useEffect(() => {
        resolveUserLocation();
    }, [resolveUserLocation]);

    useEffect(() => {
        fetchNearbyMechanics();
    }, [fetchNearbyMechanics]);

    const filteredMechanics = useMemo(() => {
        return mechanics
            .filter((m) => {
                if (activeTab === 'online') return m.status === 'ONLINE';
                if (activeTab === 'offline') return m.status !== 'ONLINE';
                return true;
            })
            .sort((a, b) => {
                const aDist = Number(a.distance_km || 999);
                const bDist = Number(b.distance_km || 999);
                return aDist - bDist;
            });
    }, [activeTab, mechanics]);

    const onlineCount = mechanics.filter((m) => m.status === 'ONLINE').length;
    const offlineCount = mechanics.length - onlineCount;

    const handleCall = (mech) => {
        const phone = getPhone(mech);
        if (!phone) return;
        Linking.openURL(`tel:${phone}`);
    };

    const handleDirections = (mech) => {
        const coords = getMechanicCoords(mech);
        if (!coords) return;
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`);
    };

    const mapRegion = {
        latitude: userLocation?.latitude || 23.0225,
        longitude: userLocation?.longitude || 72.5714,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-3 bg-white border-b border-gray-200">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                            <Ionicons name="arrow-back" size={24} color="#111827" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-xl font-bold text-gray-900">Nearby Mechanics</Text>
                            <Text className="text-xs text-gray-500">{mechanics.length} found</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={fetchNearbyMechanics} className="bg-blue-50 rounded-full p-2">
                        <Ionicons name="refresh" size={20} color="#2563eb" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ height: 240 }} className="mx-4 mt-3 rounded-2xl overflow-hidden border border-gray-200 bg-white">
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={{ flex: 1 }}
                    region={mapRegion}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                >
                    {filteredMechanics.map((mech) => {
                        const coords = getMechanicCoords(mech);
                        if (!coords) return null;
                        const isOnline = mech.status === 'ONLINE';
                        return (
                            <Marker
                                key={`mechanic-${mech.id || mech.user_id || `${coords.latitude}-${coords.longitude}`}`}
                                coordinate={coords}
                                title={getName(mech)}
                                description={mech.shop_name || mech.shop_address || ''}
                                pinColor={isOnline ? '#10b981' : '#9ca3af'}
                                onPress={() => setSelectedMechanicId(mech.id)}
                            />
                        );
                    })}
                </MapView>
            </View>

            <View className="px-4 mt-3">
                <View className="flex-row mb-2">
                    {RADIUS_OPTIONS.map((radius) => (
                        <TouchableOpacity
                            key={radius}
                            onPress={() => setRadiusKm(radius)}
                            className={`mr-2 px-3 py-1.5 rounded-full border ${radiusKm === radius ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`text-xs font-bold ${radiusKm === radius ? 'text-white' : 'text-gray-600'}`}>{radius} km</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="flex-row mb-2">
                    {[
                        { key: 'all', label: `All (${mechanics.length})` },
                        { key: 'online', label: `Online (${onlineCount})` },
                        { key: 'offline', label: `Offline (${offlineCount})` },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            className={`mr-2 px-3 py-1.5 rounded-full border ${activeTab === tab.key ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`text-xs font-bold ${activeTab === tab.key ? 'text-white' : 'text-gray-600'}`}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="text-gray-500 mt-2">Loading mechanics...</Text>
                </View>
            ) : error ? (
                <View className="m-4 p-4 rounded-xl bg-red-50 border border-red-200">
                    <Text className="text-red-700 font-semibold">{error}</Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ paddingBottom: 24 }}>
                    {filteredMechanics.length === 0 ? (
                        <View className="bg-white rounded-xl p-4 border border-gray-200">
                            <Text className="text-gray-600">No mechanics found for this filter.</Text>
                        </View>
                    ) : (
                        filteredMechanics.map((mech) => {
                            const isOnline = mech.status === 'ONLINE';
                            const phone = getPhone(mech);
                            const selected = selectedMechanicId === mech.id;
                            return (
                                <TouchableOpacity
                                    key={`card-${mech.id || mech.user_id || getName(mech)}`}
                                    onPress={() => setSelectedMechanicId(mech.id)}
                                    className={`bg-white rounded-xl p-4 border mb-3 ${selected ? 'border-blue-400' : 'border-gray-200'}`}
                                >
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Text className="text-base font-bold text-gray-900 flex-1 mr-2">{getName(mech)}</Text>
                                        <Text className={`text-xs font-bold ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
                                    </View>
                                    <Text className="text-sm text-gray-600 mb-2">{mech.shop_name || 'Mechanic Shop'}</Text>
                                    <Text className="text-xs text-gray-500 mb-3">{mech.shop_address || 'Address unavailable'}</Text>
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-xs text-blue-600 font-semibold">
                                            {Number.isFinite(Number(mech.distance_km)) ? `${Number(mech.distance_km).toFixed(2)} km` : 'Distance N/A'}
                                        </Text>
                                        <View className="flex-row">
                                            <TouchableOpacity
                                                disabled={!phone}
                                                onPress={() => handleCall(mech)}
                                                className={`mr-2 px-3 py-2 rounded-lg ${phone ? 'bg-green-600' : 'bg-gray-300'}`}
                                            >
                                                <Text className="text-white text-xs font-bold">Call</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDirections(mech)} className="px-3 py-2 rounded-lg bg-blue-600">
                                                <Text className="text-white text-xs font-bold">Directions</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
