/**
 * @format
 */
import notifee from '@notifee/react-native';
import {AppRegistry} from 'react-native';
import 'react-native-gesture-handler';
import App from './App';
import {name as appName} from './app.json';

console.disableYellowBox = true;

const NotifeeHeadlessTask = notifee.onBackgroundEvent(
  async ({type, detail}) => {
    const {notification, pressAction} = detail;
    console.log(notification);
  },
);

AppRegistry.registerComponent('NotifeeHeadlessTask', () => NotifeeHeadlessTask);
AppRegistry.registerComponent(appName, () => App);
