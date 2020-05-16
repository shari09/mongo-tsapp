import AsyncStorage from '@react-native-community/async-storage';
import {Container, Content, Icon, Picker, Spinner, Text} from 'native-base';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  RefreshControl,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import Button from '../components/Button';
import HeaderNav from '../components/HeaderNav';
import SplashScreen from '../components/SplashScreen';
import {
  IUserContext,
  Theme,
  ThemeColour,
  ThemeContext,
  UserContext,
} from '../utils/contexts';
import {getUser, updateUserSetting} from '../utils/functions';
import {createToast} from '../utils/toast';

interface EditProps {
  text: string;
  setText: (value: string) => void;
  input: React.RefObject<TextInput>;
}

const EditField = React.forwardRef<TextInput, EditProps>((props, ref) => {
  const {colour} = useContext<Theme>(ThemeContext);
  const editStyles = getEditStyles(colour);
  return (
    <View style={editStyles.wrapper}>
      <TextInput
        style={editStyles.text}
        underlineColorAndroid="#5f5d91"
        onChangeText={props.setText}
        selectTextOnFocus
        value={props.text}
        ref={ref}
      />
      <Icon
        type="SimpleLineIcons"
        name="pencil"
        style={editStyles.icon}
        onPress={() => props.input.current?.focus()}
      />
    </View>
  );
});

const getEditStyles = (colour: ThemeColour) => {
  const editStyles = StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      marginLeft: 'auto',
    },
    text: {
      fontSize: 20,
      fontFamily: 'sans-serif',
      marginRight: 2,
      color: colour.settings.text,
    },
    icon: {
      alignSelf: 'center',
      fontSize: 20,
      marginLeft: 4,
      color: 'gray',
    },
  });
  return editStyles;
};

/////////////////////////

interface Props {
  navigation: any;
}

const SettingsPage: React.FC<Props> = ({navigation}) => {
  const {
    userId,
    name,
    setName,
    animationEnabled,
    setAnimationEnabled,
    darkMode,
    setDarkMode,
    precision,
    setPrecision,
  } = useContext<IUserContext>(UserContext);
  if (!userId || !setName || !setAnimationEnabled || !setPrecision)
    return <SplashScreen />;

  const {colour} = useContext<Theme>(ThemeContext);
  const styles = getStyles(colour);

  const [notificationEnabled, setNotificationEnabled] = useState<
    boolean | null
  >(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const input = useRef<TextInput>(null);

  /**
   * Gets the user settings.
   */
  const getData = async (): Promise<void> => {
    const user = await getUser(userId);
    setNotificationEnabled(user.notificationEnabled);
    setPrecision(user.precision);
    setName(user.displayName);
  };

  //initial call to get user settings
  useEffect(() => {
    getData();
  }, []);

  /**
   * Refreshes user data by fetching the data from database.
   */
  const refresh = async (): Promise<void> => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  };

  /**
   * Updates the data to both the database and locally
   * for the session of the app.
   */
  const updateSettings = async (): Promise<void> => {
    if (!input.current || !name) return;

    setIsUpdating(true);
    input.current.blur();

    if (!name.trim()) {
      createToast({
        text: 'Please fill out a name',
        type: 'warning',
      });
      setIsUpdating(false);
      return;
    }

    if (precision === null)
      throw new Error('missing precision, developer side problem');
    await updateUserSetting({
      userId: userId,
      notificationEnabled: notificationEnabled || false,
      precision: precision,
      animationEnabled: animationEnabled || false,
      displayName: name,
    });
    console.log('update user settings');

    await AsyncStorage.setItem('theme', darkMode ? 'dark' : 'light');

    setIsUpdating(false);
  };

  if (
    notificationEnabled === null ||
    precision === null ||
    name === null ||
    animationEnabled === null
  ) {
    return <SplashScreen />;
  }

  return (
    <Container>
      <HeaderNav toggleDrawer={navigation.toggleDrawer} heading="Settings" />
      <Content
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colour.refresh]}
          />
        }
        refreshing={refreshing}>
        <View style={styles.row}>
          <Icon
            style={styles.icon}
            type="MaterialIcons"
            name="person-outline"
          />
          <Text style={styles.text}>Display name</Text>
        </View>
        <EditField
          input={input}
          ref={input}
          text={name || ''}
          setText={setName}
        />
        <View style={styles.row}>
          <Icon style={styles.icon} type="SimpleLineIcons" name="bell" />
          <Text style={styles.text}>Notification</Text>
          <Switch
            style={styles.switch}
            value={notificationEnabled}
            onValueChange={setNotificationEnabled}
            trackColor={{
              false: colour.settings.track.off,
              true: colour.settings.track.on,
            }}
            thumbColor={
              notificationEnabled
                ? colour.settings.thumb.on
                : colour.settings.thumb.off
            }
          />
        </View>
        <View style={styles.row}>
          <Icon style={styles.icon} type="MaterialIcons" name="touch-app" />
          <Text style={styles.text}>Flip animation</Text>
          <Switch
            style={styles.switch}
            value={animationEnabled}
            onValueChange={setAnimationEnabled}
            trackColor={{
              false: colour.settings.track.off,
              true: colour.settings.track.on,
            }}
            thumbColor={
              animationEnabled
                ? colour.settings.thumb.on
                : colour.settings.thumb.off
            }
          />
        </View>
        <View style={styles.row}>
          <Icon
            style={styles.icon}
            type="MaterialCommunityIcons"
            name="theme-light-dark"
          />
          <Text style={styles.text}>Dark mode</Text>
          <Switch
            style={styles.switch}
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{
              false: colour.settings.track.off,
              true: colour.settings.track.on,
            }}
            thumbColor={
              darkMode ? colour.settings.thumb.on : colour.settings.thumb.off
            }
          />
        </View>
        <View style={styles.row}>
          <Icon style={styles.icon} type="Octicons" name="settings" />
          <Text style={styles.text}>Displayed decimals</Text>
          {/* custom dropdown icon for custom colour for different colour themes */}
          <Icon style={styles.dropdown} name="caretdown" type="AntDesign" />
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={precision}
              onValueChange={setPrecision}
              style={styles.picker}
              mode="dropdown">
              <Picker.Item label="0" value={0} />

              <Picker.Item label="1" value={1} />
              <Picker.Item label="2" value={2} />
              <Picker.Item label="3" value={3} />
              <Picker.Item label="4" value={4} />
            </Picker>
          </View>
        </View>
        {isUpdating ? <Spinner color="blue" /> : null}
        <Button
          style={styles.button}
          buttonOnPress={updateSettings}
          buttonText="Save"
        />
      </Content>
    </Container>
  );
};

const getStyles = (colour: ThemeColour) => {
  const styles = StyleSheet.create({
    content: {
      padding: 20,
      backgroundColor: colour.background,
    },
    row: {
      flexDirection: 'row',
      marginTop: 20,
    },
    pickerWrapper: {
      borderWidth: 1,
      borderColor: 'gray',
      marginLeft: 'auto',
      borderRadius: 5,
    },
    picker: {
      marginLeft: 'auto',
      height: 40,
      width: 100,
      color: colour.settings.text,
    },
    text: {
      fontFamily: 'sans-serif',
      fontSize: 18,
      alignSelf: 'center',
      color: colour.settings.text,
    },
    switch: {
      marginLeft: 'auto',
      alignSelf: 'center',
    },
    button: {
      marginTop: 20,
    },
    dropdown: {
      flex: 2,
      color: colour.settings.text,
      fontSize: 10,
      position: 'absolute',
      marginLeft: '92%',
      alignSelf: 'center',
      zIndex: 2,
    },
    icon: {
      marginRight: 15,
      fontSize: 23,
      alignSelf: 'center',
      color: colour.settings.icon,
      textAlign: 'center',
    },
  });
  return styles;
};

export default SettingsPage;
