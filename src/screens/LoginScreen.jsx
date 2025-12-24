import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Added
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);  

    // Check session on mount
    useEffect(() => {
        const checkSession = async () => {
            console.log("LoginScreen: Mounting...");

            // Log Cookies
            try {
                const cookies = await SecureStore.getItemAsync('UserCookies');
                console.log("LoginScreen: Current Cookies in Store:", cookies);
            } catch (e) { console.log("LoginScreen: No cookies or Store error"); }

            console.log("LoginScreen: Current Auth State (isAuthenticated):", isAuthenticated);

            // Double check session (optional, as AuthProvider already does this on mount)
            // await checkAuth(); 
        };
        checkSession();
    }, [isAuthenticated]);

    // Redirect if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            console.log("LoginScreen: User is authenticated. Redirecting to Home...");
            // Force navigation if the App wrapper doesn't do it automatically
            // navigation.reset... or just rely on parent. 
            // If user manually navigated BACK to login, they might be stuck unless we pop.
            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                // If this is the root, we might need to replace.
                // Assuming 'Main' or 'Home' is the logged-in route name? 
                // Since I don't know the exact route name for Home, I'll rely on the App logic 
                // OR just console log for now as requested.
            }
        }
    }, [isAuthenticated]);

    console.log("LoginScreen: Rendering");
    const version = Constants.expoConfig?.version || '1.0.0';

    const handleEmailLogin = async () => {
        console.log("LoginScreen: handleEmailLogin pressed with", email);
        if (!email) {
            Alert.alert("Error", "Please enter your email.");
            return;
        }
        try {
            setLoading(true);
            console.log("LoginScreen: Calling login function...");
            const data = await login(email);
            console.log("LoginScreen: Login function returned", data);
            // Navigate to Verify/OTP screen passing params
            navigation.navigate('Verify', {
                key: data.key,
                id: data.id,
                status: data.status,
                email: email
            });
        } catch (err) {
            console.error("LoginScreen: Error caught", err);
            const msg = err.response?.data?.error || 'Login failed. Please try again.';
            Alert.alert("Login Failed", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Placeholder: Google Login in Expo requires specific setup (expo-auth-session)
        Alert.alert("Info", "Google Login requires Google Cloud Console setup for Mobile.");
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                    {/* Hero Section */}
                    <View className="h-[35%] bg-blue-50 w-full items-center justify-center rounded-b-[40px] mb-8 overflow-hidden relative">
                        <View className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full opacity-50" />
                        <View className="w-40 h-40 items-center justify-center p-2">
                            <Image className="w-full h-full rounded-xl" source={require('../../assets/logo.png')} />
                        </View>
                        <Text className="text-3xl font-extrabold text-gray-900 text-center">Mechanic Setu</Text>
                    </View>

                    <View className="px-6 flex-1">
                        <View className="items-center mb-8">
                            <Text className="text-xl text-gray-600 font-medium">Log in or Sign up</Text>
                        </View>

                        <View className="w-full space-y-6">
                            <TextInput
                                placeholder="Enter your email"
                                className="w-full px-5 py-4 bg-white rounded-xl text-gray-900 border border-gray-300 mb-4 text-lg"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            
                            <TouchableOpacity
                                onPress={handleEmailLogin}
                                disabled={loading}
                                className={`w-full py-4 rounded-xl items-center justify-center ${loading ? 'bg-gray-400' : 'bg-gray-900'}`}
                            >
                                <Text className="text-white font-bold text-lg">{loading ? 'Processing...' : 'Continue'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}