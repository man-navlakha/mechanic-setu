import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import { API_URL } from '../utils/api';
import storage from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const refreshInterval = useRef(null);
    const refreshInFlight = useRef(false);

    const storeAuthTokens = useCallback(async (data) => {
        if (!data || typeof data !== 'object') return;
        const access = data.access || data.access_token;
        const refresh = data.refresh || data.refresh_token;

        if (access) await storage.setItem('access', access);
        if (refresh) await storage.setItem('refresh', refresh);
    }, []);

    const clearRefreshInterval = useCallback(() => {
        if (refreshInterval.current) {
            clearInterval(refreshInterval.current);
            refreshInterval.current = null;
        }
    }, []);

    const refreshTokens = useCallback(async () => {
        if (refreshInFlight.current) return null;
        refreshInFlight.current = true;
        try {
            const refresh = await storage.getItem('refresh');
            const payload = refresh ? { refresh } : {};
            const res = await axios.post(`${API_URL}/core/token/refresh/`, payload, { withCredentials: true });
            await storeAuthTokens(res.data);
            await storage.setItem('Logged', 'true');
            console.log('[AuthContext] Token refresh success.');
            return res.data;
        } catch (err) {
            console.error('[AuthContext] Token refresh failed:', err?.message || err);
            return null;
        } finally {
            refreshInFlight.current = false;
        }
    }, [storeAuthTokens]);

    const startRefreshInterval = useCallback(() => {
        clearRefreshInterval();
        // 5 minutes; adjust if you want 10 minutes instead.
        refreshInterval.current = setInterval(() => {
            refreshTokens();
        }, 300000);
    }, [clearRefreshInterval, refreshTokens]);

    // Debugging hook to check router availability
    // Check Login Status & Fetch Profile
    const checkAuth = useCallback(async () => {
        console.log("[AuthContext] checkAuth: Checking login status...");
        try {
            const loggedFlag = await storage.getItem("Logged");
            if (loggedFlag === "false") {
                console.log("[AuthContext] checkAuth: Skipping (explicitly logged out).");
                setUser(null);
                return;
            }
            // Try fetching the full profile directly which serves as auth check + data
            const res = await api.get("/Profile/UserProfile/");
            console.log("[AuthContext] checkAuth: User profile fetched:", res.data);

            setUser(res.data);
            await storage.setItem("Logged", "true");
            startRefreshInterval();
        } catch (err) {
            console.log("[AuthContext] checkAuth: Not logged in or session expired:", err.message);
            setUser(null);
            await storage.setItem("Logged", "false");
            clearRefreshInterval();
        } finally {
            setLoading(false);
        }
    }, [clearRefreshInterval, startRefreshInterval]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        return () => {
            clearRefreshInterval();
        };
    }, [clearRefreshInterval]);


    // Rename loginWithEmail -> login to align with LoginScreen.jsx
    const login = async (email) => {
        setError('');
        console.log(`[AuthContext] login called with: ${email}`);
        try {
            console.log(`[AuthContext] Sending POST to /users/Login_SignUp/`);
            const res = await api.post('/users/Login_SignUp/', { email });
            console.log("[AuthContext] Login API response:", res.data);
            await storeAuthTokens(res.data);
            await storage.setItem("Logged", "true");
            startRefreshInterval();

            // Navigate to Verify
            const ctx = {
                key: res.data.key,
                id: res.data.id?.toString(),
                status: res.data.status,
                email: email
            };

            // Store context if needed for persistence across hard reloads
            // await storage.setItem('otp_ctx', JSON.stringify(ctx));

            // Note: Components like LoginScreen might handle navigation themselves using the return value.
            // But we can also push here if we are using expo-router exclusively.
            // Since LoginScreen uses navigation.navigate('Verify'), we can return data and let it handle UI.
            // IF we want to use router.push, do it here. 
            // Current LoginScreen uses: navigation.navigate('Verify', { ...data })

            return res.data;
        } catch (err) {
            console.error("[AuthContext] Login failed:", err);
            const msg = err.response?.data?.error || 'Login failed. Please check your email or try again.';
            setError(msg);
            throw err;
        }
    };

    const googleLogin = async (token) => {
        setError('');
        console.log("[AuthContext] googleLogin with token");
        try {
            const res = await api.post("/users/google/", { token });
            console.log("[AuthContext] Google login success:", res.data);
            const hasAccess = Boolean(res.data?.access || res.data?.access_token);
            const hasRefresh = Boolean(res.data?.refresh || res.data?.refresh_token);
            if (hasAccess || hasRefresh) {
                await storeAuthTokens(res.data);
            } else {
                console.warn('[AuthContext] Google login response missing tokens; WS will not connect.');
            }
            await storage.setItem("Logged", "true");
            if (res.data?.user) {
                setUser(res.data.user);
            }
            startRefreshInterval();
            await refreshTokens();

            if (res.data.status === 'New User') {
                // Use router if available, or return logic
                // router.push({ pathname: '/form', ... });
                return { status: 'New User' };
            } else {
                if (hasAccess || hasRefresh) {
                    await checkAuth();
                } else {
                    console.log('[AuthContext] Skipping checkAuth (no tokens).');
                }
                // router.replace('/');
            }
        } catch (err) {
            console.error("Google login error:", err);
            setError(err.response?.data?.detail || "Google login failed on our server.");
            throw err;
        }
    };

    const verifyOtp = async (key, id, otp, status) => {
        setError('');
        console.log(`[AuthContext] verifyOtp: ${otp}`);
        try {
            const payload = { key, id, otp };
            const res = await api.post('/users/otp-verify/', payload);
            await storeAuthTokens(res.data);
            await storage.setItem("Logged", "true");
            startRefreshInterval();
            await refreshTokens();

            await checkAuth();

            if (status === 'New User') {
                // Return status so component can navigate to ProcessForm
                // router.replace({ pathname: '/form', ... });
                return { status: 'New User' };
            } else {
                // State update handles redirect to Home
                // router.replace('/');
            }
        } catch (err) {
            console.error('[AuthContext] OTP verify failed:', err);
            const msg = err?.response?.data?.error || 'Verification failed. Try again.';
            setError(msg);
            throw err;
        }
    };

    const resendOtp = async (key, id) => {
        console.log("[AuthContext] Resending OTP...");
        try {
            const res = await api.post('/users/resend-otp/', { key, id });
            console.log("[AuthContext] Resend success:", res.data);
            return res.data;
        } catch (err) {
            console.error('[AuthContext] Resend failed:', err);
            throw err;
        }
    };

    const logout = async () => {
        console.log("[AuthContext] Logging out...");
        try {
            await api.post('/users/logout/');
            try {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
            } catch (err) {
                console.warn('[AuthContext] Google sign-out failed:', err?.message || err);
            }
        } catch (err) {
            console.error('[AuthContext] Logout failed on server:', err);
        } finally {
            setUser(null);
            await storage.setItem("Logged", "false");
            await storage.removeItem("otp_ctx");
            await storage.removeItem("access");
            await storage.removeItem("refresh");
            clearRefreshInterval();
            // router.replace('/login'); // Removed: State change handles navigation
        }
    };
    const isAuthenticated = loading ? null : !!user;

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            isAuthenticated,
            checkAuth,
            profile: user, // Alias user as profile for Dashboard usage
            login,
            googleLogin,
            verifyOtp,
            resendOtp,
            logout,
            setError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
