import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from './CustomDrawerContent'; // your custom drawer component
import TabNavigation from './TabNavigation';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
  return (
    <Drawer.Navigator 
    
    drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="TabNavigation" component={TabNavigation} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;
