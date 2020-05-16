import React, {useState, useContext} from 'react';
import {Image, StyleSheet} from 'react-native';
import {
  DrawerContentScrollView, 
  DrawerItem,
  DrawerContentComponentProps,
  DrawerContentOptions
} from '@react-navigation/drawer';
import {Icon, Text} from 'native-base';
import {Stitch} from 'mongodb-stitch-react-native-sdk';
import {ThemeColour} from '../utils/contexts';
import {ThemeContext} from '../utils/contexts';
import Logout from './Logout';


//this was one long component
const SideBar: React.FC<DrawerContentComponentProps<DrawerContentOptions>> = (props) => {

  

  const {colour} = useContext(ThemeContext);
  const styles = getStyles(colour);

  //signing out
  const signOut = async() => {
    try {
      await Stitch.defaultAppClient.auth.logout();
    } catch (err) {
      console.log(err);
    }
  };

  const [loggingOut, setLoggingOut] = useState<boolean>(false);


  const curRoute = props.state.routes[props.state.index].name;


  const colourProps = {
    activeTintColor: colour.sidebar.activeText,
    inactiveTintColor: colour.sidebar.inactiveText,
    activeBackgroundColor: colour.sidebar.activeBackground,
    inactiveBackgroundColor: colour.sidebar.inactiveBackground
  };

  return (
    <DrawerContentScrollView style={styles.content} {...props}>
      <Image 
        source={require('../assets/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.line}>_______________</Text>
      <DrawerItem 
        {...colourProps}
        label='Home' 
        icon={() => <Icon style={styles.icon} type='AntDesign' name='home'/>}
        focused={curRoute === 'Home'}
        onPress={() => props.navigation.navigate('Home')}
      />
      <DrawerItem 
        {...colourProps}
        label='Settings' 
        icon={() => <Icon style={styles.icon} type='Feather' name='settings'/>}
        focused={curRoute === 'Settings'}
        onPress={() => props.navigation.navigate('Settings')}
      />
      <DrawerItem
        {...colourProps}
        label='Logout'
        icon={() => <Icon style={styles.icon} name='log-out'/>}
        focused={curRoute === 'Logout'}
        onPress={() => {
          setLoggingOut(true);
          signOut();
        }}
      />
      <Logout loggingOut={loggingOut}/>
    </DrawerContentScrollView>
    
  );

};

const getStyles = (colour: ThemeColour) => {
  const styles = StyleSheet.create({
    content: {
      backgroundColor: colour.background
    },
    logo: {
      width: 100,
      height: 100,
      alignSelf: 'center',
      marginTop: 40,
      marginBottom: 30,
    },
    line: {
      height: 2,
      alignSelf: 'center',
      borderBottomColor: 'gray',
      borderBottomWidth: 2,
      borderRadius: 20,
      marginBottom: 5,
      marginTop: 3
    },
    icon: {
      textAlign: 'center',
      alignSelf: 'center',
      fontSize: 23,
      marginLeft: 5,
      flex: 0.2,
      color: colour.sidebar.icon
    }
  });
  return styles;
};


export default SideBar;