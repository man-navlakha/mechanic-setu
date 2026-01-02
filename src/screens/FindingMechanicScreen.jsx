import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageAdCard } from '../components/ImageAdCard';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { getMapAds } from '../utils/adsCache';
import { navigate, resetRoot } from '../utils/navigationRef';

const { width, height } = Dimensions.get('window');

const SNAP_POINTS = {
    COLLAPSED: height * 0.65,
    EXPANDED: height * 0.35,
};

const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }] }
];

const FORM_STORAGE_KEY = 'punctureRequestFormData';


const FindingMechanicScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { profile: authUser } = useAuth();
    const route = useRoute();
    const mapRef = useRef(null);
    const { requestId, latitude, longitude, vehicleType: paramVehicle, problem: paramProblem } = route.params || {};

    const [jobDetails, setJobDetails] = useState(null);
    const userData = authUser || {};

    const [adsData, setAdsData] = useState([]);
    const [selectedAd, setSelectedAd] = useState(null);

    // FIX: Mounted Ref to prevent memory leaks/crashes
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        const loadAds = async () => {
            const ads = await getMapAds();
            setAdsData(ads);
        };
        loadAds();
    }, []);



    // FIXED: Use a memoized coordinate to prevent the icon from "moving" during state re-renders
    const staticLocation = useMemo(() => ({
        latitude: latitude || 23.0225,
        longitude: longitude || 72.5714
    }), [latitude, longitude]);

    useEffect(() => {
        const loadJobDetails = async () => {
            try {
                const savedForm = await SecureStore.getItemAsync(FORM_STORAGE_KEY);
                if (savedForm) {
                    const formData = JSON.parse(savedForm);
                    // Initialize with requestId if available
                    setJobDetails({
                        ...formData,
                        id: requestId || formData.id
                    });
                } else if (requestId) {
                    // If no saved form, at least set the ID from params
                    setJobDetails({
                        vehicleType: paramVehicle,
                        problem: paramProblem,
                        id: requestId
                    });
                }
            } catch (e) {
                console.error("Failed to load form data", e);
            }
        };
        loadJobDetails();
    }, [requestId]);
    // console.log(jobDetails)
    const { socket, lastMessage } = useWebSocket();

    useEffect(() => {
        // SAFETY CHECK: Stop if component is unmounted OR screen is not focused
        if (!isMounted.current || !lastMessage || !isFocused) return;

        console.log("[FindingMechanic] New Message:", lastMessage);
        const { type, service_request, message, job_id } = lastMessage;

        // 1. Handle Job Confirmation
        if (type === 'new_job' && service_request) {
            if (service_request.id === parseInt(requestId)) {
                console.log("[FindingMechanic] Server confirmed job is live.");

                // Safety check before setting state
                if (isMounted.current) {
                    setJobDetails({
                        vehicleType: service_request.vehical_type,
                        problem: service_request.problem,
                        location: service_request.location,
                        id: service_request.id
                    });
                }

                if (typeof startFakeMechanicSimulation === 'function') {
                    startFakeMechanicSimulation();
                }
            }
        }

        // 2. Mechanic Found
        else if (lastMessage.type === 'mechanic_accepted') {
            navigate("MechanicFound", {
                data: lastMessage,
                userLocation: { latitude, longitude },
                vehicleType: jobDetails?.vehicleType || paramVehicle,
                problem: jobDetails?.problem || paramProblem
            });
        }

        // 3. Error Cases
        else if (type === 'no_mechanic_found') {
            const msgJobId = job_id || (service_request?.id);
            if (msgJobId && String(msgJobId) !== String(requestId)) {
                return;
            }
            navigate("NearbyMechanics", {
                jobDetails: jobDetails || { vehicleType: paramVehicle, problem: paramProblem },
                userLocation: { latitude, longitude }
            });
        }
        else if (type === 'job_expired') {
            const alertTitle = "Request Expired";
            const alertMessage = message || "Please try again later.";

            // Use global navigation safely
            Alert.alert(
                alertTitle,
                alertMessage,
                [
                    {
                        text: "Try Again",
                        onPress: () => resetRoot('Main')
                    }
                ],
                { cancelable: false }
            );
        }
    }, [lastMessage, isFocused]);

    // ⚡ Performance: Use shared value for timer instead of state to avoid re-renders
    const searchTimeSeconds = useSharedValue(0);
    const [displayTime, setDisplayTime] = useState('0:00');

    useEffect(() => {
        // Update display time with minimal re-renders (only once per second)
        const interval = setInterval(() => {
            searchTimeSeconds.value += 1;
            const mins = Math.floor(searchTimeSeconds.value / 60);
            const secs = searchTimeSeconds.value % 60;
            setDisplayTime(`${mins}:${secs.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const translateY = useSharedValue(SNAP_POINTS.COLLAPSED);
    const context = useSharedValue({ y: 0 });
    const scanX = useSharedValue(-width);

    useEffect(() => {
        scanX.value = withRepeat(withTiming(width, { duration: 2000 }), -1, false);
    }, []);

    // ⚡ Memoized ads data to prevent recreation on every render
    const RECOMMENDED_ADS = useMemo(() => [
        {
            id: '1',
            type: 'image',
            title: 'Flat 20% OFF',
            subtitle: 'on Premium Car Servicing',
            description: 'Book comprehensive car service at your doorstep',
            bgColor: '#EEF2FF',
            accentColor: '#4F46E5',
            image: 'https://cdn-icons-png.flaticon.com/512/3097/3097136.png',
            ctaText: 'Book Service',
            badge: 'LIMITED OFFER'
        },
        {
            id: '2',
            type: 'image',
            title: 'Roadside Assistance',
            subtitle: '24/7 Emergency Support',
            description: 'Get instant help anywhere, anytime',
            bgColor: '#FEF3C7',
            accentColor: '#F59E0B',
            image: 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png',
            ctaText: 'Subscribe Now',
            badge: '₹99/Year'
        },
        {
            id: '3',
            type: 'image',
            title: 'Castrol Engine Oil',
            subtitle: 'Magnatec Protection',
            description: 'Premium engine oil with 75% less engine wear',
            bgColor: '#D1FAE5',
            accentColor: '#059669',
            image: 'https://cdn-icons-png.flaticon.com/512/2917/2917242.png',
            ctaText: 'Shop Now',
            badge: 'From ₹499'
        },
        {
            id: '4',
            type: 'image',
            title: 'Tyre Replacement',
            subtitle: 'Top Brands Available',
            description: 'Get the best deals on premium tyres',
            bgColor: '#FEE2E2',
            accentColor: '#DC2626',
            image: 'https://cdn-icons-png.flaticon.com/512/3097/3097039.png',
            ctaText: 'View Offers',
            badge: 'Save Big'
        },
        {
            id: '5',
            type: 'image',
            title: 'Battery Check',
            subtitle: 'Free Inspection',
            description: 'Avoid unexpected breakdowns with battery testing',
            bgColor: '#DBEAFE',
            accentColor: '#2563EB',
            image: 'https://cdn-icons-png.flaticon.com/512/2917/2917439.png',
            ctaText: 'Book Now',
            badge: 'FREE'
        },
    ], []);

    const renderAdItem = ({ item }) => (
        <TouchableOpacity
            className="bg-white rounded-2xl shadow-md border-2 border-gray-300/30 overflow-hidden mr-4 relative"
            style={{ width: width * 0.8 }}
        >
            {/* Ads Tab */}
            <View className="absolute top-0 left-0 bg-gray-400/30 px-3 py-1 rounded-br-lg">
                <Text className="text-gray-400 font-bold text-xs">Ads</Text>
            </View>

            {/* Top Icon Section */}
            <View className="flex-row items-center p-4 mt-4">
                <View
                    className="p-3 rounded-xl mr-3"
                    style={{ backgroundColor: item.color + '20' }}
                >
                    <Ionicons name={item.icon} size={28} color={item.color} />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text className="text-gray-500 text-sm" numberOfLines={1}>
                        {item.subtitle}
                    </Text>
                </View>
            </View>

            {/* Divider */}
            <View className="border-t border-gray-100" />

            {/* Bottom Price + Action */}
            <View className="flex-row items-center justify-between p-4">
                <Text className="text-blue-600 font-bold text-sm">{item.price}</Text>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </View>
        </TouchableOpacity>
    );


    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            translateY.value = event.translationY + context.value.y;
            // Limit range: EXPANDED (top) to COLLAPSED (bottom)
            translateY.value = Math.max(SNAP_POINTS.EXPANDED, Math.min(translateY.value, SNAP_POINTS.COLLAPSED + 50));
        })
        .onEnd(() => {
            if (translateY.value < (SNAP_POINTS.COLLAPSED + SNAP_POINTS.EXPANDED) / 2) {
                translateY.value = withTiming(SNAP_POINTS.EXPANDED, { duration: 300 });
            } else {
                translateY.value = withTiming(SNAP_POINTS.COLLAPSED, { duration: 300 });
            }
        });

    const rBottomSheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            height: height,
            top: 0,
            marginBottom: 16
        };
    });

    const rScanStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: scanX.value }],
    }));

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View className="flex-1 bg-white">
                {/* ⚡ Optimized MapView with performance props */}
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={{ flex: 1 }}
                    customMapStyle={mapStyle}
                    initialRegion={{
                        ...staticLocation,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}
                    moveOnMarkerPress={false}
                    toolbarEnabled={false}
                    loadingEnabled={false}
                >
                    {/* User Location Marker */}
                    <Marker
                        coordinate={staticLocation}
                        flat
                        anchor={{ x: 0.5, y: 0.5 }}
                        tracksViewChanges={false}
                        onPress={() => {
                            if (mapRef.current) {
                                mapRef.current.animateToRegion({
                                    ...staticLocation,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }, 2000);
                            }
                        }}
                    >
                        <View className="items-center justify-center">
                            <View className="w-10 h-10 bg-black rounded-full border-[3px] border-white shadow-2xl items-center justify-center">
                                <Ionicons name="location" size={18} color="white" />
                            </View>
                            <Text>{userData.first_name} 🙋‍♂️</Text>
                        </View>
                    </Marker>

                    {/* ⚡ Memoized Ad Markers - only re-render when adsData changes */}
                    {useMemo(() => adsData.map((ad) => (
                        <Marker
                            key={`ad-${ad.id}`}
                            coordinate={{ latitude: ad.latitude, longitude: ad.longitude }}
                            onPress={() => setSelectedAd(ad)}
                            tracksViewChanges={false}
                        >
                            <View className="bg-white p-0.5 rounded-full border-2 border-amber-400 shadow-lg overflow-hidden" style={{ width: 36, height: 36 }}>
                                <Image
                                    source={{ uri: ad.logo }}
                                    className="w-full h-full rounded-full"
                                    resizeMode="cover"
                                />
                            </View>
                        </Marker>
                    )), [adsData])}
                </MapView>

                {/* Floating Navigation */}
                <SafeAreaView className="absolute top-4 left-4 z-20">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="bg-white w-10 h-10 rounded-full shadow-lg items-center justify-center border border-gray-100"
                    >
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                </SafeAreaView>

                {/* BOTTOM SHEET */}
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[{ position: 'absolute', left: 0, right: 0, backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 10, paddingTop: 10, marginBottom: 3 }, rBottomSheetStyle]}>
                        {/* Drag Handle */}
                        <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-2" />

                        {/* Scanning Progress Bar */}
                        <View className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                            <Animated.View style={[styles.scanLine, rScanStyle]} />
                        </View>
                        <ScrollView>


                            <View className="pt-6 px-6 pb-10 mb-52">
                                <View className="flex gap-4 mb-6">
                                    <View>
                                        <Text className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                            {jobDetails?.id ? "Job is Live!" : "Broadcasting..."}
                                        </Text>
                                        <Text className="text-gray-500 text-sm mt-1">
                                            {jobDetails?.id
                                                ? `Your request (ID: ${jobDetails.id}) is now visible to nearby mechanics.`
                                                : "Sending your request to the server..."}
                                        </Text>

                                        {/* Display the server-confirmed location */}
                                        {jobDetails?.location && (
                                            <View className="flex-row items-center bg-gray-50 p-3 rounded-xl mt-4">
                                                <Ionicons name="location" size={16} color="#3b82f6" />
                                                <Text className="ml-2 text-gray-600 text-xs flex-1" numberOfLines={1}>
                                                    {jobDetails.location}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <View className="flex-row items-center bg-blue-50 self-start px-3 py-1.5 rounded-full border border-blue-100">
                                        <Ionicons name="time" size={14} color="#2563eb" />
                                        <Text className="ml-2 text-blue-600 font-semibold text-xs">
                                            Elapsed: {displayTime}
                                        </Text>
                                    </View>

                                </View>



                                {/* ADS CAROUSEL (Uber-style) */}
                                <View className="mb-8">
                                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recommended for you</Text>
                                    <FlatList
                                        data={RECOMMENDED_ADS}
                                        renderItem={({ item }) => <ImageAdCard item={item} />}
                                        scrollEnabled={false}
                                        keyExtractor={(item) => item.id}
                                    />

                                </View>

                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Cancellation', { requestId })}
                                    className="w-full bg-red-600 py-4 rounded-2xl items-center flex-row justify-center shadow-md active:opacity-80 mb-36"
                                >
                                    <Ionicons name="close-circle" size={20} color="white" />
                                    <Text className="ml-2 text-white font-black text-base uppercase tracking-widest">
                                        Cancel Request
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        </ScrollView>
                    </Animated.View>
                </GestureDetector>


            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    pulseRing: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#3b82f6',
        borderWidth: 1,
        borderColor: '#3b82f6'
    },
    bottomSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: height,
        top: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 25,
    },
    scanLine: {
        height: '100%',
        width: '40%',
        backgroundColor: '#3b82f6',
    }
});

export default FindingMechanicScreen;