import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Added

const LegalScreen = ({ navigation, route }) => {
    const { type, title } = route.params || {};

    const getContent = (type) => {
        switch (type) {
            case 'terms':
                return (
                    <View>
                        <Text className="text-gray-600 mb-4 leading-6">Welcome to Mechanic Setu. By using our app, you agree to the following terms and conditions...</Text>
                        <Text className="font-bold text-gray-800 mb-2">1. Service Usage</Text>
                        <Text className="text-gray-600 mb-4 leading-6">You agree to use the service for lawful purposes only...</Text>
                    </View>
                );
            case 'privacy':
                return (
                    <View>
                        <Text className="text-gray-600 mb-4 leading-6">Your privacy is important to us...</Text>
                        <Text className="font-bold text-gray-800 mb-2">Data Collection</Text>
                        <Text className="text-gray-600 mb-4 leading-6">We collect location data to connect you with nearby mechanics...</Text>
                    </View>
                );
            case 'about':
                return (
                    <View>
                        <Text className="text-gray-600 mb-4 leading-6">Mechanic Setu is dedicated to helping vehicle owners find reliable mechanics quickly...</Text>
                    </View>
                );
            default:
                return <Text className="text-gray-500">Content not available.</Text>;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            
            {/* Standard Header Pattern */}
            <View className="bg-white px-4 pb-4 border-b border-gray-200 pt-2">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="p-2 bg-gray-100 rounded-full mr-4"
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900 flex-1" numberOfLines={1}>
                        {title || 'Legal Information'}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
                {getContent(type)}
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default LegalScreen;