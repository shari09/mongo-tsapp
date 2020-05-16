import React, {useState, useContext} from 'react';
import {Image, StatusBar} from 'react-native';
import {Container, Content, Form, Spinner} from 'native-base';
import {StyleSheet, View} from 'react-native';
import {Stitch, FunctionCredential} from 'mongodb-stitch-react-native-sdk';

import InputBox from '../components/InputBox';
import LoginButton from '../components/LoginButton';
import {ThemeContext, ThemeColour} from '../utils/contexts';
import {createToast} from '../utils/toast'


interface Props {
  navigation: any;
};

const LoginHomePage: React.FC<Props> = ({navigation}) => {
  const [studentId, setStudentId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isInvalid, setIsInvalid] = useState<boolean>(false);

  const {mode, colour} = useContext(ThemeContext);
  const styles = getStyles(colour, mode);


  const taLogin = async () => {
    setIsSigningIn(true);
    if (studentId === '' || password === '') {
      createToast({
        text: 'Please fill out all fields',
        type: 'warning'
      });
      setPassword('');
      setIsSigningIn(false);
      return;
    }

    try {
      const user = await Stitch.defaultAppClient.auth
        .loginWithCredential(new FunctionCredential({
          username: studentId.trim(),
          password: password
        }));
    } catch (err) {

      console.log(err);
      setPassword('');
      setIsInvalid(true);
      createToast({
        text: 'Incorrect username or password',
        type: 'danger'
      });
    }
    setIsSigningIn(false);    
  };

  return (
    <Container>
      <StatusBar 
        backgroundColor={colour.statusBarBackground} 
        barStyle={mode === 'light' ? 'dark-content' : 'light-content'}/>
      <Content style={styles.content}>
        <Image source={require('../assets/logo.png')} style={styles.logo}/>
        <View style={styles.lineContainer}>
            <View style={styles.line} />
        </View>
        <Form>
          <InputBox 
            icon='person'
            placeholder='Student ID' 
            value={studentId}
            autoCompleteType='username'
            setValue={setStudentId}
            isInvalid={isInvalid}
            setIsInvalid={setIsInvalid}
            xIcon={true}
            disabled={isSigningIn}
          />
          <InputBox 
            icon='lock'
            placeholder='Password' 
            value={password}
            autoCompleteType='password'
            secureTextEntry={true}
            setValue={setPassword}
            isInvalid={isInvalid}
            setIsInvalid={setIsInvalid}
            disabled={isSigningIn}
          />
        </Form>
        {isSigningIn ? <Spinner color='blue'/> : null}
        <LoginButton
          buttonText='Login'
          buttonOnPress={taLogin}
        />
      </Content>
    </Container>
  );
};

const getStyles = (colour: ThemeColour, mode: 'light'|'dark' = 'dark') => {
  const styles = StyleSheet.create({
    content: {
      padding: '5%',
      backgroundColor: colour.background
    },
    line: {
      height: 1,
      flex: 1,
      alignSelf: 'center',
      backgroundColor: mode === 'light' ? '#f0f0f0' : '#ffffff70'
    },
    lineContainer: {
      marginTop: 5,
      marginBottom: 5,
      flexDirection: 'row',
      // paddingLeft: 5,
      // paddingRight: 5
    },
    logo: {
      width: 170,
      height: 170,
      alignSelf: 'center',
      marginTop: '10%',
      marginBottom: '5%'
    },
  });
  return styles;
};



export default LoginHomePage;