import React, {useState, useEffect, useContext} from 'react';
import {Container, Content, Icon} from 'native-base';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';

import HomePage from './HomePage';
import TaCredentialsPage from './TaCredentialsPage';
import SideBar from '../components/SideBar';
import Logout from '../components/Logout';
import { UserContext } from '../utils/contexts';


interface Props {
  navigation: any;
  
};

const Drawer = createDrawerNavigator();

const LoggedInPage: React.FC<Props> = ({navigation}) => {

  const {loggedInFromTa} = useContext(UserContext);

  return (
    <Drawer.Navigator 
      initialRouteName='Home' 
      drawerContent={props => <SideBar {...props}/>}
    >
      <Drawer.Screen 
        name='Home' 
        component={HomePage}
      />
      {!loggedInFromTa ?
        <Drawer.Screen 
        name='UpdateTa' 
        component={TaCredentialsPage}
      /> : null
      }
      <Drawer.Screen
        name="Logout"
        component={Logout}
      />
    </Drawer.Navigator>
  );
};

export default LoggedInPage;