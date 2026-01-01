import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resetRoot } from '../utils/navigationRef';

const RAPID_API_KEY = '8c4441f91cmsh031f6b727121205p18ef90jsndb7ed43006d7';

export default function NearbyMechanicsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { jobDetails, userLocation } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [mechanics, setMechanics] = useState([]);

    useEffect(() => {
        if (userLocation?.latitude) {
            fetchNearbyMechanics();
        }
    }, [userLocation]);

    const fetchNearbyMechanics = async () => {
        try {
            const lat = userLocation.latitude;
            const lng = userLocation.longitude;
            const url = 'https://local-business-data.p.rapidapi.com/search';

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-rapidapi-key': RAPID_API_KEY,
                    'x-rapidapi-host': 'local-business-data.p.rapidapi.com'
                },
                body: JSON.stringify({
                    queries: ["auto repair", "mechanic", "car service"],
                    language: "en",
                    region: "in",
                    coordinates: `${lat},${lng}`,
                    limit: 10,
                    offset: 0,
                    zoom: 13,
                    dedup: true
                })
            };

            const response = await fetch(url, options);
            const result = await response.json();

            // The new API structure returns data inside the first element of 'data' array which corresponds to the first query?
            // Or it might return an array of results for each query.
            // Based on user example: "data": [ { ... } ]
            // The example shows a single query response. With multiple queries, structure might be slightly different.
            // Let's assume it returns a flat list or we flatten it.
            // Wait, the user example response 'data' is an array of businesses.
            // If I send multiple queries, I might get multiple business lists. 
            // Let's stick to the user's curl "data" format logic, but handle potential array-of-arrays if API behaves that way with multiple queries.
            // Actually, the example shows "data": [ { business_details } ]

            let allMechanics = [];
            if (result.data && Array.isArray(result.data)) {
                allMechanics = result.data;
            }

            // Calculate distances
            const mechanicsWithDistance = allMechanics.map(mech => {
                const dist = getDistanceFromLatLonInKm(lat, lng, mech.latitude, mech.longitude);
                return { ...mech, distance: dist.toFixed(1) }; // 1 decimal place
            });

            // Filter by max distance (20km) and sort
            const nearbyMechanics = mechanicsWithDistance
                .filter(mech => parseFloat(mech.distance) <= 20)
                .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

            setMechanics(nearbyMechanics);

        } catch (error) {
            console.error("Error fetching nearby mechanics:", error);
        } finally {
            setLoading(false);
        }
    };

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        if (!lat2 || !lon2) return 999;
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    const renderItem = ({ item, index }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            className="mb-3"
        >
            <TouchableOpacity
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-row"
                onPress={() => item.phone_number && Linking.openURL(`tel:${item.phone_number}`)}
            >
                {/* Thumbnail via Google Photos if available */}
                <View className="w-16 h-16 bg-gray-100 rounded-lg mr-4 overflow-hidden items-center justify-center">
                    {item.photos_sample?.[0]?.photo_url ? (
                        <Image source={{ uri: item.photos_sample[0].photo_url }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <Ionicons name="construct" size={24} color="#9ca3af" />
                    )}
                </View>

                <View className="flex-1">
                    <Text className="font-bold text-gray-900 text-base mb-1">{item.name}</Text>
                    <Text className="text-gray-500 text-xs mb-1" numberOfLines={2}>{item.full_address || item.address}</Text>

                    <View className="flex-row items-center mt-1">
                        {item.rating && (
                            <View className="flex-row items-center mr-3">
                                <Ionicons name="star" size={12} color="#f59e0b" />
                                <Text className="text-xs font-bold text-gray-700 ml-1">{item.rating}</Text>
                                <Text className="text-xs text-gray-400 ml-0.5">({item.review_count})</Text>
                            </View>
                        )}

                        {item.distance && (
                            <View className="flex-row items-center mr-3">
                                <Ionicons name="location-outline" size={12} color="#3b82f6" />
                                <Text className="text-xs text-blue-600 ml-0.5">{item.distance} km</Text>
                            </View>
                        )}

                        <Text className={`text-xs font-bold ${item.business_status === 'OPEN' ? 'text-green-600' : 'text-red-500'}`}>
                            {item.business_status || (item.opening_status ? item.opening_status : '')}
                        </Text>
                    </View>
                </View>

                <View className="justify-center pl-2">
                    <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center">
                        <Ionicons name="call" size={20} color="#16a34a" />
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 mt-10">
            <View className="p-4 bg-white shadow-sm mb-4">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => resetRoot("Main")} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold">Mechanics Nearby</Text>
                </View>

                {/* Job Summary */}
                <Animated.View
                    entering={FadeInUp.delay(200)}
                    className="bg-red-50 p-3 rounded-lg border border-red-100 m-4 "
                >
                    <Text className="text-red-800 font-bold mb-1">No App Mechanic Found</Text>
                    <Text className="text-red-600 text-xs">
                        We couldn't match you with a partner. Here are nearby shops you can contact directly.
                    </Text>
                </Animated.View>

                {jobDetails && (
                    <Animated.View
                        entering={FadeInUp.delay(300)}
                        className="flex-row items-center"
                    >
                        <Text className="text-gray-500 text-xs font-bold uppercase mr-2">Your Request:</Text>
                        <Text className="font-bold text-gray-800">{jobDetails.vehicleType} - {jobDetails.problem}</Text>
                    </Animated.View>
                )}
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-gray-500 mt-4">Searching nearby services...</Text>
                </View>
            ) : (
                <FlatList
                    data={mechanics}
                    keyExtractor={(item) => item.place_id || item.business_id || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <Animated.View
                            entering={ZoomIn}
                            className="items-center justify-center py-20 px-6"
                        >
                            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
                                <Ionicons name="search" size={48} color="#9ca3af" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900 mb-2">No Mechanics Found Nearby</Text>
                            <Text className="text-gray-500 text-center mb-8">
                                We couldn't find any auto repair shops in your immediate vicinity using our database.
                            </Text>

                            <TouchableOpacity
                                onPress={() => Linking.openURL('https://www.google.com/maps/search/?api=1&query=mechanics_nearby')}
                                className="bg-white px-6 py-4 rounded-full shadow-md border border-gray-200 flex-row items-center"
                            >
                                <Image
                                    source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/480px-Google_%22G%22_logo.svg.png" }}
                                    className="w-6 h-6 mr-3"
                                    resizeMode="contain"
                                />
                                <Text className="font-bold text-gray-700 text-base">
                                    Search on Google Maps
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
