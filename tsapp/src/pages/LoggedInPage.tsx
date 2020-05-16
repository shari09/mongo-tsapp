import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import HomePage from './HomePage';
import SettingsPage from './SettingsPage';
import SideBar from '../components/SideBar';
import Logout from '../components/Logout';


interface Props {
  navigation: any;
  
};

const Drawer = createDrawerNavigator();

const LoggedInPage: React.FC<Props> = ({navigation}) => {

  return (
    <Drawer.Navigator 
      initialRouteName='Home' 
      drawerContent={props => <SideBar {...props}/>}
      screenOptions={{
        gestureEnabled: true
      }}
    >
      <Drawer.Screen 
        name='Home' 
        component={HomePage}
      />
      <Drawer.Screen
        name='Settings'
        component={SettingsPage}
      />
    </Drawer.Navigator>
  );
};

export default LoggedInPage;