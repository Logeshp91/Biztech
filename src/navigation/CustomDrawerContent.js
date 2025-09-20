import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { postauthendication } from '../redux/action';
import { clearLoginFields } from '../redux/action'; 

const CustomDrawerContent = () => {
  const navigation = useNavigation();
  const profilePicSource = require('../assets/check.png');
  const dispatch = useDispatch();

  const { postauthendicationData} = useSelector(state => state.postauthendicationReducer);
  const user = postauthendicationData || {};
  return (
    <View style={styles.container}>
      <View style={styles.upperHalf}>
        <Image source={profilePicSource} style={styles.image} />
        <View style={styles.userDataContainer}>
          <Text style={styles.userData}>{user.partner_display_name || 'No Name'}</Text>
          <Text style={styles.userData}>{user.username || 'No Username'}</Text>
          <Text style={styles.userData}>{user.partner_write_date || 'No Date'}</Text>
        </View>
      </View>

      <DrawerContentScrollView style={styles.lowerHalf}>
        <TouchableOpacity onPress={() => navigation.navigate('TabNavigation')}>
          <Text style={styles.drawerItem}>Dashboard</Text>
        </TouchableOpacity>
          <TouchableOpacity
        onPress={() => {
  dispatch(clearLoginFields());
  navigation.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  });
}}
        >
          <Text style={styles.drawerItem}>Logout</Text>
        </TouchableOpacity>
      </DrawerContentScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  upperHalf: {
    height: 250,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lowerHalf: {
    backgroundColor: '#ccc',
  },
  drawerItem: {
    fontSize: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    fontFamily: 'Inter-Bold'
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 80,
    marginTop: 20,
  },
  userDataContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  userData: {
    fontSize: 16,
    color: 'white',
  },
});

export default CustomDrawerContent;
