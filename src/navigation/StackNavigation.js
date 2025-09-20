import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../Account/Accounts/Login';
import Loading from '../Account/Accounts/Loading';
import TabNavigation from './TabNavigation';
import DrawerNavigation from './DrawerNavigation';
import CreateCustomer from '../Account/Accounts/dashboard/CreateCustomer';
import CreateVisit from '../Account/Accounts/dashboard/CreateVisit';
import Stage1 from '../Account/Accounts/dashboard/Stage1';
import Stage2 from '../Account/Accounts/dashboard/Stage2';
import CompletedOrder from '../Account/Accounts/dashboard/CompletedOrder';
import CompletedOrderStage2 from '../Account/Accounts/dashboard/CompletedOrderStage2';
import OpenEnquiry from '../Account/Accounts/dashboard/OpenEnquiry';
import ApprovalPending from '../Account/Accounts/dashboard/ApprovalPending';
import ApprovedList from '../Account/Accounts/dashboard/ApprovedList';
import LostList from '../Account/Accounts/dashboard/LostList';
import SonumberList from '../Account/Accounts/dashboard/salesOrder/SonumberList';
import SonumberSaleOrder from '../Account/Accounts/dashboard/salesOrder/SonumberSaleOrder';
import BillSummary from '../Account/Accounts/dashboard/salesOrder/BillSummary';
import ProductList from '../Account/Accounts/dashboard/salesOrder/ProductList';

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading">
        <Stack.Screen options={{ headerShown: false }} name="Login" component={Login} />
        <Stack.Screen options={{ headerShown: false }} name="Loading" component={Loading} />
        <Stack.Screen name="DrawerNavigation" component={DrawerNavigation} options={{ headerShown: false }} />
        <Stack.Screen name="TabNavigation" component={TabNavigation} options={{ headerShown: false }} />
        <Stack.Screen options={{ headerShown: false }} name="CreateCustomer" component={CreateCustomer} />
        <Stack.Screen options={{ headerShown: false }} name="CreateVisit" component={CreateVisit} />
        <Stack.Screen options={{ headerShown: false }} name="Stage1" component={Stage1} />
        <Stack.Screen options={{ headerShown: false }} name="Stage2" component={Stage2} />
        <Stack.Screen options={{ headerShown: false }} name="OpenEnquiry" component={OpenEnquiry} />
        <Stack.Screen options={{ headerShown: false }} name="CompletedOrder" component={CompletedOrder} />
        <Stack.Screen options={{ headerShown: false }} name="CompletedOrderStage2" component={CompletedOrderStage2} />
        <Stack.Screen options={{ headerShown: false }} name="ApprovalPending" component={ApprovalPending} />
        <Stack.Screen options={{ headerShown: false }} name="ApprovedList" component={ApprovedList} />
        <Stack.Screen options={{ headerShown: false }} name="LostList" component={LostList} />
        <Stack.Screen options={{ headerShown: false }} name="SonumberList" component={SonumberList} />
        <Stack.Screen options={{ headerShown: false }} name="SonumberSaleOrder" component={SonumberSaleOrder} />
        <Stack.Screen options={{ headerShown: false }} name="BillSummary" component={BillSummary} />
        <Stack.Screen options={{ headerShown: false }} name="ProductList" component={ProductList} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigation;