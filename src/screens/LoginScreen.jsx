import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '628591285290-agf9c8nrjbcfa9onq3tr7d6dubjjo0g9.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '628591285290-g5sv4vic3pjqbg174go04dc2cultrpcl.apps.googleusercontent.com';

GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    scopes: ['profile', 'email'],
    offlineAccess: false,
    hostedDomain: '',
    forceCodeForRefreshToken: false,
    accountName: '',
    profileImageSize: 120,
});

export default function LoginScreen({ navigation }) {
    const { login, googleLogin, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('GoogleSignin config:', {
            webClientId: GOOGLE_WEB_CLIENT_ID,
            iosClientId: GOOGLE_IOS_CLIENT_ID,
        });
        console.log('App identifiers:', {
            androidPackage: Constants.expoConfig?.android?.package,
            iosBundleId: Constants.expoConfig?.ios?.bundleIdentifier,
            scheme: Constants.expoConfig?.scheme,
        });
    }, []);

    // Check session on mount
    useEffect(() => {
        const checkSession = async () => {
            console.log('LoginScreen: Mounting...');

            try {
                const cookies = await SecureStore.getItemAsync('UserCookies');
                console.log('LoginScreen: Current Cookies in Store:', cookies);
            } catch (e) {
                console.log('LoginScreen: No cookies or Store error');
            }

            console.log('LoginScreen: Current Auth State (isAuthenticated):', isAuthenticated);
        };
        checkSession();
    }, [isAuthenticated]);

    // Redirect if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            console.log('LoginScreen: User is authenticated. Redirecting to Home...');
            if (navigation.canGoBack()) {
                navigation.goBack();
            }
        }
    }, [isAuthenticated, navigation]);

    console.log('LoginScreen: Rendering');
    const version = Constants.expoConfig?.version || '1.0.0';

    const handleEmailLogin = async () => {
        console.log('LoginScreen: handleEmailLogin pressed with', email);
        if (!email) {
            Alert.alert('Error', 'Please enter your email.');
            return;
        }
        try {
            setLoading(true);
            console.log('LoginScreen: Calling login function...');
            const data = await login(email);
            console.log('LoginScreen: Login function returned', data);
            navigation.navigate('Verify', {
                key: data.key,
                id: data.id,
                status: data.status,
                email,
            });
        } catch (err) {
            console.error('LoginScreen: Error caught', err);
            const msg = err.response?.data?.error || 'Login failed. Please try again.';
            Alert.alert('Login Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            console.log('GoogleSignin: starting sign-in');
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            try {
                console.log('GoogleSignin: revoking access + signing out to force account chooser');
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
            } catch (err) {
                console.log('GoogleSignin: signOut skipped', err?.message || err);
            }
            const signInResponse = await GoogleSignin.signIn();
            console.log('GoogleSignin: response keys', Object.keys(signInResponse || {}));
            if (signInResponse?.type === 'cancelled') {
                return;
            }
            const userInfo = signInResponse?.type === 'success' ? signInResponse.data : signInResponse;
            console.log('GoogleSignin: userInfo keys', Object.keys(userInfo || {}));
            const idToken = userInfo?.idToken;
            console.log('GoogleSignin: response', {
                type: signInResponse?.type,
                hasIdToken: Boolean(idToken),
                email: userInfo?.user?.email,
                hasServerAuthCode: Boolean(userInfo?.serverAuthCode),
            });
            if (!idToken) {
                throw new Error('Google did not return an ID token.');
            }
            const result = await googleLogin(idToken);
            if (result?.status === 'New User') {
                navigation.navigate('ProcessForm');
            }
        } catch (err) {
            if (statusCodes.SIGN_IN_CANCELLED === err?.code) {
                return;
            }
            console.error('GoogleSignin error:', {
                code: err?.code,
                message: err?.message,
                nativeStackAndroid: err?.nativeStackAndroid,
            });
            const msg = err?.response?.data?.detail || err?.message || 'Google login failed. Please try again.';
            Alert.alert('Google Login Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
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

                          
                            <GoogleSigninButton  className={`w-full py-4 rounded-xl my-4 items-center justify-center border ${loading ? 'border-gray-300 bg-gray-100' : 'border-gray-300 bg-white'}`}
                             onPress={handleGoogleLogin} disabled={loading} />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
