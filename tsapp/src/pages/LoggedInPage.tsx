import {createDrawerNavigator} from '@react-navigation/drawer';
import React from 'react';
import SideBar from '../components/SideBar';
import HomePage from './HomePage';
import SettingsPage from './SettingsPage';

interface Props {
  navigation: any;
}

const Drawer = createDrawerNavigator();

const LoggedInPage: React.FC<Props> = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <SideBar {...props} />}
      screenOptions={{
        gestureEnabled: true,
      }}>
      <Drawer.Screen name="Home" component={HomePage} />
      <Drawer.Screen name="Settings" component={SettingsPage} />
    </Drawer.Navigator>
  );
};

export default LoggedInPage;
