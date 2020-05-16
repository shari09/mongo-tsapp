import {Container, Content, Spinner} from 'native-base';
import React, {useContext} from 'react';
import {Theme, ThemeContext} from '../utils/contexts';

const SplashScreen = () => {
  const {colour} = useContext<Theme>(ThemeContext);
  return (
    <Container>
      <Content style={{backgroundColor: colour.background}}>
        <Spinner color="blue" />
      </Content>
    </Container>
  );
};

export default SplashScreen;
