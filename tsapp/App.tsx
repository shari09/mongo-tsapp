import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import notifee from '@notifee/react-native';
import messaging, {FirebaseMessagingTypes} from '@react-native-firebase/messaging';

import {Stitch, StitchAppClient, StitchUser} from 'mongodb-stitch-react-native-sdk';

import {Root} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import LoginPage from './src/pages/LoginPage';
import LoggedInPage from './src/pages/LoggedInPage';
import SplashScreen from './src/components/SplashScreen';
import {UserContext, IUserContext} from './src/utils/contexts';
import {ThemeContext, lightTheme, darkTheme, Theme} from './src/utils/contexts';
import {
  updateFcmToken,
  getUser,
  setDBLoggedIn
} from './src/utils/functions';
import {ObjectId} from 'bson';

const Stack = createStackNavigator();


const App = () => {
  const [userId, setUserId] = useState<ObjectId|undefined>();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [animationEnabled, setAnimationEnabled] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [precision, setPrecision] = useState<number>(2);
  const [stitchInitialized, setStitchInitialized] = useState<boolean>(false);

  useEffect(() => {
    Stitch.initializeDefaultAppClient('tsapp-idjxn').then(() => {
      setStitchInitialized(true);
    }).catch(console.log);
  }, []);

  const initUser = async() => {
    if (!userId) return;
    const updatedToken = await getToken();
    if (!updatedToken) updateToken();
    
    setDBLoggedIn({userId: userId, loggedIn: true});
    const user = await getUser(userId);
    setAnimationEnabled(user.animationEnabled);
    setPrecision(user.precision);
    setName(user.displayName);
    setLoggedIn(true);
    setInitializing(false);
  };

  const loadUserId = (stitchUser: StitchUser) => {
    const userId = new ObjectId(stitchUser.identities[0].id);
    setUserId(userId);
  }

  //checks if the user is signed in
  useEffect(() => {
    if (!stitchInitialized) return;
    const auth = Stitch.defaultAppClient.auth;
    //add a auth state listener
    auth.addAuthListener({
      onUserLoggedIn: (auth, loggedInUser) => {
        loadUserId(loggedInUser);
      },
      onUserLoggedOut: (auth, loggedOutUser) => {
        const userId = new ObjectId(loggedOutUser.identities[0].id);
        if (!userId) throw new Error('userid not found when logging out');
        setLoggedIn(false);
        setDBLoggedIn({userId: userId, loggedIn: false});
      }
    });
    setInitializing(false);
    //if the user is already logged in
    if (auth.isLoggedIn && auth.user) {
      setInitializing(true);
      loadUserId(auth.user);
    }
  }, [stitchInitialized]);

  useEffect(() => {
    initUser();
  }, [userId]);


  //update fcm token to the cloud
  const updateToken = async () => {
    try {
      if (userId) {
        const fcmToken = await AsyncStorage.getItem('fcmToken');
        console.log('updated token to mongo');
        if (!fcmToken) throw new Error('fcmToken missing from async storage');
        const res = await updateFcmToken({
          userId: userId,
          fcmToken: fcmToken
        });
        console.log(res);
      }
    } catch (err) {
      console.log(err);
    }    
  };

  //get token upon mounting the app, if update the token if it doesn't exist
  //@return true upon creating new token, false otherwise
  const getToken = async () => {
    const hasPerm: FirebaseMessagingTypes.AuthorizationStatus = await messaging().hasPermission();
    if (hasPerm) {
      console.log('get token');
      // setNotificationSetting();
      let fcmToken: string|null = await AsyncStorage.getItem('fcmToken');
      if (!fcmToken) {
        console.log('got new token');
        fcmToken = await messaging().getToken();
        await AsyncStorage.setItem('fcmToken', fcmToken);
        await updateToken();
        return true;
      }
      return false;
    } else {
      throw new Error('no permission');
    }
  };



  useEffect(() => {
    (async() => {
      const theme = await AsyncStorage.getItem('theme');
      if (!theme) await AsyncStorage.setItem('theme', 'light');
      setDarkMode(theme === 'dark' ? true : false);
    })();
    
  }, []);


  


  //add token listeners
  useEffect(() => {
    
    //get tokens if logged in
    if (loggedIn) {
      getToken();
      messaging().onTokenRefresh(async (fcmToken: string) => {
        console.log('got refreshed token');
        await AsyncStorage.setItem('fcmToken', fcmToken);
        updateToken();
      });
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('background message: ');
        console.log(remoteMessage);
      });
      messaging().onMessage(async remoteMessage => {
        console.log('foreground message: ');
        console.log(remoteMessage);
      });
    }
  }, [loggedIn]);

  if (initializing) {
    return <SplashScreen/>
  }

  const userContext: IUserContext = {
    userId: userId,
    name: name,
    setName: setName,
    isLoggedIn: loggedIn,
    animationEnabled: animationEnabled,
    setAnimationEnabled: setAnimationEnabled,
    darkMode: darkMode,
    setDarkMode: setDarkMode,
    precision: precision,
    setPrecision: setPrecision
  };

  const theme: Theme = {
    mode: darkMode ? 'dark' : 'light',
    colour: darkMode ? darkTheme : lightTheme
  };

  return ( //don't question the amount of wraps
    <Root>
      <UserContext.Provider value={userContext}>
        <ThemeContext.Provider value={theme}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{
              headerShown: false
            }}>
              {loggedIn ? (
                <Stack.Screen
                  name='LoggedInPage'
                  component={LoggedInPage}
                />
              ) : (
                <Stack.Screen 
                  name='LoginPage' 
                  component={LoginPage}
                  options={{
                    animationTypeForReplace: loggedIn ? 'push' : 'pop',
                  }}
                />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeContext.Provider>
      </UserContext.Provider>
    </Root>
  );

}

export default App;
