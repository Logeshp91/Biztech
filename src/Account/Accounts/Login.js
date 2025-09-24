import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  NativeModules,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { postauthendication } from '../../redux/action';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import auth from '@react-native-firebase/auth';

const Login = ({ navigation }) => {
  const dispatch = useDispatch();
  const { postauthendicationLoading, postauthendicationData, postauthendicationError, postauthendicationErrorInvalid } = useSelector(
    state => state.postauthendicationReducer
  );

  const [phone, setPhone] = useState(postauthendicationData?.username || '');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [location, setLocation] = useState(null);
  const [gpsEnabled, setGpsEnabled] = useState(false);

  const pinInputs = useRef([]);

  // ✅ Handle login response
  useEffect(() => {
    if (postauthendicationLoading) return;

    const uid = postauthendicationData?.uid;
    const errorMsg = postauthendicationError || postauthendicationErrorInvalid;

    if (uid) {
      Alert.alert('Login successful!');
      navigation.navigate('TabNavigation');
    } else if (errorMsg) {
      Alert.alert('Login Failed', errorMsg);
      setPassword('');
    }
  }, [postauthendicationLoading, postauthendicationData, postauthendicationError, postauthendicationErrorInvalid]);

  // ✅ If SIM number available, auto-fill phone field
  useEffect(() => {
    if (mobileNumber && !phone) {
      setPhone(mobileNumber);
    }
  }, [mobileNumber]);

  // ✅ Clear password when auth state resets
  useEffect(() => {
    if (!postauthendicationData) {
      setPassword('');
    }
  }, [postauthendicationData]);

  // ✅ Ask both Location + SIM permissions on first launch
  useEffect(() => {
    const requestAllPermissions = async () => {
      try {
        // 1️⃣ Location permission
        const locationResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (locationResult !== RESULTS.GRANTED) {
          Alert.alert("Permission Required", "Please allow location access.");
        }

        // 2️⃣ SIM permissions
        const simGranted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        ]);

        const hasSimPermission =
          simGranted['android.permission.READ_PHONE_NUMBERS'] === PermissionsAndroid.RESULTS.GRANTED &&
          simGranted['android.permission.READ_PHONE_STATE'] === PermissionsAndroid.RESULTS.GRANTED;

        // 3️⃣ Fetch SIM number immediately
        if (hasSimPermission) {
          const simInfoList = await getSimNumbers();
          if (Array.isArray(simInfoList) && simInfoList.length > 0) {
            const firstSim = simInfoList.find(sim => sim.number && sim.number.length >= 10);
            if (firstSim) {
              let number = firstSim.number
                .replace(/^(\+91|91)/, '')
                .replace(/\s/g, '');
              setMobileNumber(number);
              setPhone(number);
              console.log("📱 SIM Number fetched:", number);
            } else {
              console.log("⚠️ SIM has no valid number");
            }
          } else {
            console.log("⚠️ SIM list empty");
          }
        } else {
          console.warn("❌ SIM permission denied");
        }
      } catch (err) {
        console.error("Permission flow error:", err);
      }
    };

    requestAllPermissions();
  }, []);

  // ✅ Get SIM numbers from native module
  // const getSimNumbers = async () => {
  //   const { SimInfo } = NativeModules;
  //   try {
  //     const numbers = await SimInfo.getSimNumbers();
  //     return JSON.parse(numbers);
  //   } catch (error) {
  //     console.error('Error fetching SIM numbers:', error);
  //     return [];
  //   }
  // };
const getSimNumbers = async () => {
  try {
    const { SimInfo } = NativeModules;
    const numbers = await SimInfo.getSimNumbers();
    const sims = JSON.parse(numbers);
    const firstSim = sims.find(sim => sim.number && sim.number.length >= 10);
    if (firstSim) {
      let number = firstSim.number.replace(/^(\+91|91)/, '').replace(/\s/g, '');
      setMobileNumber(number);
      setPhone(number);
      console.log("📱 SIM Number fetched:", number);
    } else {
      console.warn("No valid SIM number found");
    }
  } catch (e) {
    console.error("SIM fetch error:", e);
  }
};

  // ✅ Location watcher
  useEffect(() => {
    let watchId;

   const startWatching = async () => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    Alert.alert('Permission Required', 'Please allow location permission.');
    return;
  }

  watchId = Geolocation.watchPosition(
    pos => {
      setGpsEnabled(true);
      setLocation(pos.coords);
    },
    err => {
      if (err.code === 2) {
        setGpsEnabled(false);
        (async () => {
          try {
            await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
              interval: 10000,
              fastInterval: 5000,
            });
            setGpsEnabled(true);
            fetchLocation();
          } catch (e) {
            console.log('⚠️ User cancelled GPS enable', e);
            Alert.alert('GPS Disabled', 'You need to enable GPS to continue.');
          }
        })();
      }
    },
    { enableHighAccuracy: true, distanceFilter: 0, interval: 2000 }
  );
};

    startWatching();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const fetchLocation = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setGpsEnabled(false);
      return;
    }

    Geolocation.getCurrentPosition(
      pos => {
        setLocation(pos.coords);
        setGpsEnabled(true);
      },
      err => {
        console.warn('❌ Location error:', err.message);
        setGpsEnabled(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  } catch (err) {
    console.log('❌ GPS fetch error', err);
    setGpsEnabled(false);
  }
};

 const requestLocationPermission = async () => {
  const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
  if (result === RESULTS.GRANTED) return true;

  const ask = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
  return ask === RESULTS.GRANTED;
};

  const handleLogin = () => {
    if (!phone || !password) {
      Alert.alert('Validation', 'Username and password are required');
      return;
    }

    if (!location) {
      Alert.alert('Location Missing', 'Please enable GPS and wait for location before logging in.');
      return;
    }

    console.log("📍 Latitude:", location.latitude);
    console.log("📍 Longitude:", location.longitude);

    const loginPayload = {
      jsonrpc: '2.0',
      params: {
        db: 'siddhi_live_24092025',
        login: phone.trim(),
        password: password.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
      },
    };
    dispatch(postauthendication(loginPayload));
  };

  const isLoginEnabled = phone && password && gpsEnabled && location;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#fff' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.loginText}>Login Account</Text>
                <Text style={styles.welcomeText}>Hello, Welcome</Text>
              </View>
              <View style={styles.avatarContainer}>
                <Image source={require('../../assets/user.png')} style={styles.avatar} />
              </View>
            </View>

            <Image source={require('../../assets/girlimages.png')} style={styles.centerImage} />

            <Text style={styles.label}>Phone no..</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.flagContainer}>
                <Image source={require('../../assets/india.png')} style={styles.flag} />
              </View>
              <View style={styles.separator} />
              <TextInput
                style={styles.phoneInput}
                keyboardType="default"
                placeholder="Enter username"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <Text style={styles.pinlabel}>Password</Text>
            <View style={[styles.phoneInputContainer, { height: 45, marginBottom: 20 }]}>
              <TextInput
                style={{ flex: 1, fontSize: 15, color: '#000' }}
                secureTextEntry={!showPassword}
                placeholder="Enter password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {(!gpsEnabled || !location) && (
              <Text style={{ color: 'red', fontSize: 12, marginBottom: 10, paddingHorizontal: 10 }}>
                Please enable GPS and wait while we get your location.
              </Text>
            )}

            <TouchableOpacity
              onPress={handleLogin}
              style={[
                styles.loginButton,
                { backgroundColor: isLoginEnabled ? '#e22727ff' : '#ccc' },
              ]}
              disabled={!isLoginEnabled}
            >
              <Text style={styles.loginButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#FFFFFF', justifyContent: 'flex-start' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10%', marginTop: '8%' },
  loginText: { fontSize: 22, fontWeight: 'bold' },
  welcomeText: { fontSize: 16, color: '#666', marginTop: 4 },
  avatarContainer: { backgroundColor: '#eee', borderRadius: 30, overflow: 'hidden' },
  avatar: { width: 40, height: 40 },
  centerImage: { width: 250, height: 250, alignSelf: 'center', marginVertical: 30, marginTop: '20%' },
  label: { fontSize: 14, marginTop: '5%', marginBottom: '2%', paddingHorizontal: 10 },
  phoneInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 50, paddingHorizontal: 15, height: 45, backgroundColor: '#fff' },
  flagContainer: { width: 30, height: 30, borderRadius: 15, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  flag: { width: 30, height: 30, resizeMode: 'cover' },
  separator: { width: 1, height: '80%', backgroundColor: '#ccc', marginHorizontal: 10 },
  phoneInput: { flex: 1, fontSize: 15, color: '#000' },
  pinlabel: { fontSize: 14, marginTop: '5%', paddingHorizontal: 10 },
  loginButton: { paddingVertical: 14, borderRadius: 50, marginBottom: 10 },
  loginButtonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
});
