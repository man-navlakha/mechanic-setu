import { useNavigation, useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../utils/api';
import { resetRoot } from '../utils/navigationRef';

const ACTIVE_JOB_STORAGE_KEY = 'mechanicAcceptedData';
const FORM_STORAGE_KEY = 'punctureRequestFormData';

const CancellationScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { requestId } = route.params || {};
    const [selectedReason, setSelectedReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirmCancel = async () => {
        if (!selectedReason) {
            Alert.alert("Selection Required", "Please select a reason.");
            return;
        }

        setLoading(true);

        try {
            // 1. Call API
            await api.post(`jobs/CancelServiceRequest/${requestId}/`, {
                cancellation_reason: selectedReason
            });

            // 2. Clear Local Storage
            await SecureStore.deleteItemAsync(ACTIVE_JOB_STORAGE_KEY);
            await SecureStore.deleteItemAsync(FORM_STORAGE_KEY);

            // 3. Navigate Home Safely
            Alert.alert("Request Cancelled", "Your service request has been cancelled.", [
                { text: "OK", onPress: () => resetRoot('Main') }
            ]);

        } catch (error) {
            console.error("Cancellation failed", error);
            const errorMessage = error.response?.data?.error || "Failed to cancel. Try again.";
            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const reasons = ['Mechanic delayed', 'Found help elsewhere', 'Incorrect details', 'Other'];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 pt-6">
                <Text className="text-2xl font-black text-gray-900 mb-2">Cancel Service?</Text>
                <Text className="text-gray-500 mb-8">Please tell us why you want to cancel the request.</Text>

                {reasons.map((reason) => (
                    <TouchableOpacity
                        key={reason}
                        onPress={() => setSelectedReason(reason)}
                        className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border ${selectedReason === reason ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'
                            }`}
                    >
                        <Text className={`font-bold ${selectedReason === reason ? 'text-blue-600' : 'text-gray-700'}`}>
                            {reason}
                        </Text>
                        <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selectedReason === reason ? 'border-blue-500' : 'border-gray-300'
                            }`}>
                            {selectedReason === reason && <View className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                        </View>
                    </TouchableOpacity>
                ))}

                <View className="flex-row space-x-3 mt-8">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="flex-1 py-4 bg-gray-100 rounded-2xl items-center"
                        disabled={loading}
                    >
                        <Text className="font-bold text-gray-700">Go Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleConfirmCancel}
                        disabled={!selectedReason || loading}
                        className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center ${selectedReason ? 'bg-red-500' : 'bg-gray-200'
                            }`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="font-bold text-white">Confirm</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default CancellationScreen;
