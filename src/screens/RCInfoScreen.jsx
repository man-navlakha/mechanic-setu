import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/; // e.g., GJ27AA3978

const FieldRow = ({ label, value }) => (
    <View className="mb-3">
        <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</Text>
        <Text className="text-base font-bold text-gray-900">{value || 'N/A'}</Text>
    </View>
);

const RCInfoScreen = () => {
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [rcData, setRcData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        const cleaned = vehicleNumber.toUpperCase().replace(/\s/g, '');
        if (!cleaned) {
            Alert.alert('Missing', 'Please enter a vehicle number.');
            return;
        }
        if (!vehicleRegex.test(cleaned)) {
            Alert.alert('Invalid format', 'Use XX00XX0000 (e.g., GJ27AA3978).');
            return;
        }

        setLoading(true);
        setRcData(null);
        try {
            const res = await api.post('/vehicle/rc-info', { vehicle_number: cleaned });
            if (res.data?.success) {
                const combined = { ...(res.data.data || {}), ...res.data };
                setRcData(combined);
            } else {
                Alert.alert('Not found', res.data?.message || 'Failed to fetch RC info.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View className="flex-row items-center mb-6">
                    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                        <Ionicons name="car" size={22} color="#2563eb" />
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-gray-900">RC Information</Text>
                        <Text className="text-sm text-gray-500">Check vehicle registration details</Text>
                    </View>
                </View>

                <View className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                    <Text className="text-xs uppercase font-semibold text-gray-500 mb-2">Vehicle Number</Text>
                    <TextInput
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-lg tracking-widest font-semibold uppercase"
                        placeholder="GJ27AA3978"
                        autoCapitalize="characters"
                        value={vehicleNumber}
                        onChangeText={setVehicleNumber}
                    />
                    <TouchableOpacity
                        onPress={handleSearch}
                        disabled={loading}
                        className={`mt-4 py-3 rounded-lg items-center ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}
                    >
                        <Text className="text-white font-bold text-base">{loading ? 'Searching...' : 'Search'}</Text>
                    </TouchableOpacity>
                </View>

                {rcData && (
                    <View className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Summary</Text>
                        <FieldRow label="Status" value={rcData.rc_status || 'ACTIVE'} />
                        <FieldRow label="Plate" value={rcData.license_plate} />
                        <FieldRow label="Model" value={rcData.brand_model} />
                        <FieldRow label="Brand" value={rcData.brand_name} />
                        <FieldRow label="Fuel" value={rcData.fuel_type} />
                        <FieldRow label="Owner Name" value={rcData.owner_name} />
                        <FieldRow label="Father's Name" value={rcData.father_name} />
                        <FieldRow label="Insurance Status" value={rcData.is_insurance_expired ? 'EXPIRED' : 'ACTIVE'} />
                        <FieldRow label="Insurance Company" value={rcData.insurance_company} />
                        <FieldRow label="Insurance Expiry" value={rcData.insurance_expiry} />
                        <FieldRow label="PUCC Valid Upto" value={rcData.pucc_upto} />
                        <FieldRow label="Tax Valid Upto" value={rcData.tax_upto} />
                        <FieldRow label="Engine Number" value={rcData.engine_number} />
                        <FieldRow label="Chassis Number" value={rcData.chassis_number} />
                        <FieldRow label="Seating Capacity" value={rcData.seating_capacity} />
                        <FieldRow label="Vehicle Age" value={rcData.vehicle_age} />
                        <FieldRow label="Present Address" value={rcData.present_address} />
                        <FieldRow label="Permanent Address" value={rcData.permanent_address} />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default RCInfoScreen;
