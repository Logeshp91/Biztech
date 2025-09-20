import React from 'react';
import Navigation from './src/navigation/StackNavigation';
import { Provider } from 'react-redux';
import store from './src/redux/store';

const App = () => {
  return (
    <Provider store={store}>
      <Navigation />
      </Provider>
  );
}
export default App;






// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, PermissionsAndroid, Platform, StyleSheet } from 'react-native';
// import Geolocation from 'react-native-geolocation-service';

// const App = () => {
//   const [coords, setCoords] = useState(null);
//   const [errorMsg, setErrorMsg] = useState('');

//   // Request location permission
//   const requestPermission = async () => {
//     if (Platform.OS === 'android') {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     }
//     return true;
//   };

//   // Safe location fetch
//   const getLocationSafe = async () => {
//     try {
//       const hasPermission = await requestPermission();
//       if (!hasPermission) {
//         setErrorMsg('Location permission denied');
//         return;
//       }

//       // Try high accuracy first
//       Geolocation.getCurrentPosition(
//         position => {
//           setCoords(position.coords);
//           setErrorMsg('');
//         },
//         error => {
//           console.warn('High accuracy failed:', error.message);

//           // Fallback to low accuracy
//           Geolocation.getCurrentPosition(
//             fallbackPos => setCoords(fallbackPos.coords),
//             fallbackErr => setErrorMsg(fallbackErr.message),
//             { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
//           );
//         },
//         { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
//       );
//     } catch (e) {
//       console.error('Exception:', e);
//       setErrorMsg(e.message);
//     }
//   };

//   useEffect(() => {
//     getLocationSafe();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Location App</Text>

//       {coords ? (
//         <>
//           <Text>Latitude: {coords.latitude}</Text>
//           <Text>Longitude: {coords.longitude}</Text>
//         </>
//       ) : (
//         <Text>Fetching location...</Text>
//       )}

//       {errorMsg ? <Text style={{ color: 'red' }}>{errorMsg}</Text> : null}

//       <Button title="Refresh Location" onPress={getLocationSafe} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
// });

// export default App;
