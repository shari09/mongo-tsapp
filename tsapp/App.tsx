import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import notifee, {Notification, AndroidStyle} from '@notifee/react-native';
import messaging, {FirebaseMessagingTypes} from '@react-native-firebase/messaging';

import {Stitch, StitchAppClient, StitchUser, StitchAuth} from 'mongodb-stitch-react-native-sdk';

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


const App: React.FC = () => {
  const [userId, setUserId] = useState<ObjectId|undefined>();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [animationEnabled, setAnimationEnabled] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [precision, setPrecision] = useState<number>(2);
  const [stitchInitialized, setStitchInitialized] = useState<boolean>(false);


  //checks if the Stitch app is initialized, if not, initialize the app
  useEffect(() => {
    if (Stitch.hasAppClient('tsapp-idjxn')) return;
    Stitch.initializeDefaultAppClient('tsapp-idjxn').then(() => {
      setStitchInitialized(true);
    }).catch(console.log);
  }, []);

  /**
   * Initialize user settings.
   * Set app initalization to false.
   */
  const initUser = async(): Promise<void> => {
    if (!userId) return;
    const updatedToken: boolean = await getToken();
    if (!updatedToken) updateToken();
    
    setDBLoggedIn({
      userId: userId, 
      loggedIn: true,
    });
    const user = await getUser(userId);
    setAnimationEnabled(user.animationEnabled);
    setPrecision(user.precision);
    setName(user.displayName);
    setLoggedIn(true);
    setInitializing(false);
  };

  /**
   * Loads the user ID.
   * @param stitchUser the current user.
   */
  const loadUserId = (stitchUser: StitchUser): void => {
    const userId: ObjectId = new ObjectId(stitchUser.identities[0].id);
    setUserId(userId);
  }

  /*
   * Set default auth listeners to handle user logic 
   * after the Stitch app has been initialized.
   */
  useEffect(() => {
    if (!stitchInitialized) return;
    const auth: StitchAuth = Stitch.defaultAppClient.auth;

    //add a auth state listener
    auth.addAuthListener({
      onUserLoggedIn: (auth, loggedInUser) => {
        loadUserId(loggedInUser);
      },
      onUserLoggedOut: (auth, loggedOutUser) => {
        const userId: ObjectId = new ObjectId(loggedOutUser.identities[0].id);
        setLoggedIn(false);
        setDBLoggedIn({
          userId: userId, 
          loggedIn: false,
        });
      },
    });
    setInitializing(false);

    //if the user is already logged in
    if (auth.isLoggedIn && auth.user) {
      setInitializing(true);
      loadUserId(auth.user);
    }
  }, [stitchInitialized]);

  //Initializes the user upon userId refresh.
  useEffect(() => {
    initUser();
  }, [userId]);


  /**
   * Updates the FCM token to database.
   */
  const updateToken = async(): Promise<void> => {
    if (!userId) return;
    try {
      const fcmToken: string|null = await AsyncStorage.getItem('fcmToken');
      console.log('updated token to mongo');
      if (!fcmToken) throw new Error('fcmToken missing from async storage');
      const res = await updateFcmToken({
        userId: userId,
        fcmToken: fcmToken,
      });
      console.log(res);
    } catch (err) {
      console.log(err);
    }    
  };

  /**
   * Gets a new FCM token if none exists.
   * @returns whether or not a new token has been generated 
   *          and has been updated to database.
   */
  const getToken = async (): Promise<boolean> => {
    const hasPerm: FirebaseMessagingTypes.AuthorizationStatus = await messaging().hasPermission();
    if (!hasPerm) throw new Error('no permission');

    console.log('get token');
    let fcmToken: string|null = await AsyncStorage.getItem('fcmToken');

    if (!fcmToken) {
      console.log('got new token');
      fcmToken = await messaging().getToken();
      await AsyncStorage.setItem('fcmToken', fcmToken);
      await updateToken();
      return true;
    }
    return false;
  };

  //Gets the user set theme.
  useEffect(() => {
    (async() => {
      const theme: string|null = await AsyncStorage.getItem('theme');
      if (!theme) await AsyncStorage.setItem('theme', 'light');
      setDarkMode(theme === 'dark' ? true : false);
    })();
    
  }, []);


  /**
   * Displays a notification.
   * @param data the notification data
   * @todo write an interface for notification data
   */
  const displayNotification = async(data: any): Promise<void> => {
    const channelId: string = await notifee.createChannel({
      id: 'markUpdates',
      name: 'Mark Updates',
    });
    const name: string = data.name;
    const long: boolean = name.length > 30;

    const notification: Notification = {
      title: data.courseCode,
      body: `${long ? name.slice(0, 30)+'... ' : name}: ${data.average}%`,
      android: {
        channelId,
        pressAction: {
          id: 'default',
          launchActivity: 'default'
        },
        style: long ? {
          type: AndroidStyle.BIGTEXT, 
          text: `${name}: ${data.average}%`
        }: undefined
      }
    };
    notifee.displayNotification(notification);
  };


  //Set up a onTokenRefresh listener
  //Set up FCM listeners
  useEffect(() => {
    if (!loggedIn) return;

    messaging().onTokenRefresh(async (fcmToken: string) => {
      console.log('got refreshed token');
      await AsyncStorage.setItem('fcmToken', fcmToken);
      updateToken();
    });
    messaging().setBackgroundMessageHandler(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('background message: ');
      console.log(remoteMessage.data);
      displayNotification(remoteMessage.data);
    });
    messaging().onMessage((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('foreground message: ');
      console.log(remoteMessage);
    });
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
    setPrecision: setPrecision,
  };

  const theme: Theme = {
    mode: darkMode ? 'dark' : 'light',
    colour: darkMode ? darkTheme : lightTheme,
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
