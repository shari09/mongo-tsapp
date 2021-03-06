import {FunctionCredential, Stitch} from 'mongodb-stitch-react-native-sdk';
import {Container, Content, Form, Spinner} from 'native-base';
import React, {useContext, useState} from 'react';
import {Image, StatusBar, StyleSheet, View} from 'react-native';
import Button from '../components/Button';
import InputBox from '../components/InputBox';
import {Theme, ThemeColour, ThemeContext} from '../utils/contexts';
import {createToast} from '../utils/toast';

interface Props {
  navigation: any;
}

const LoginHomePage: React.FC<Props> = () => {
  const [studentId, setStudentId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isInvalid, setIsInvalid] = useState<boolean>(false);

  const {mode, colour} = useContext<Theme>(ThemeContext);
  const styles = getStyles(colour, mode);

  /**
   * Login to Stitch with TA credentials.
   */
  const taLogin = async (): Promise<void> => {
    setIsSigningIn(true);
    if (studentId === '' || password === '') {
      createToast({
        text: 'Please fill out all fields',
        type: 'warning',
      });
      setPassword('');
      setIsSigningIn(false);
      return;
    }

    try {
      await Stitch.defaultAppClient.auth.loginWithCredential(
        new FunctionCredential({
          username: studentId.trim(),
          password: password,
        }),
      );
    } catch (err) {
      console.log(err);
      setPassword('');
      setIsInvalid(true);
      createToast({
        text: 'Incorrect username or password',
        type: 'danger',
      });
    }
    setIsSigningIn(false);
  };

  return (
    <Container>
      <StatusBar
        backgroundColor={colour.statusBarBackground}
        barStyle={mode === 'light' ? 'dark-content' : 'light-content'}
      />
      <Content style={styles.content}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <View style={styles.lineContainer}>
          <View style={styles.line} />
        </View>
        <Form>
          <InputBox
            icon="person"
            placeholder="Student ID"
            value={studentId}
            autoCompleteType="username"
            setValue={setStudentId}
            isInvalid={isInvalid}
            setIsInvalid={setIsInvalid}
            xIcon={true}
            disabled={isSigningIn}
          />
          <InputBox
            icon="lock"
            placeholder="Password"
            value={password}
            autoCompleteType="password"
            secureTextEntry={true}
            setValue={setPassword}
            isInvalid={isInvalid}
            setIsInvalid={setIsInvalid}
            disabled={isSigningIn}
          />
        </Form>
        {isSigningIn ? <Spinner color="blue" /> : null}
        <Button buttonText="Login" buttonOnPress={taLogin} />
      </Content>
    </Container>
  );
};

const getStyles = (colour: ThemeColour, mode: 'light' | 'dark' = 'dark') => {
  const styles = StyleSheet.create({
    content: {
      padding: '5%',
      backgroundColor: colour.background,
    },
    line: {
      height: 1,
      flex: 1,
      alignSelf: 'center',
      backgroundColor: mode === 'light' ? '#f0f0f0' : '#ffffff70',
    },
    lineContainer: {
      marginTop: 5,
      marginBottom: 5,
      flexDirection: 'row',
    },
    logo: {
      width: 150,
      height: 150,
      alignSelf: 'center',
      marginTop: '18%',
      marginBottom: '10%',
    },
  });
  return styles;
};

export default LoginHomePage;
