import React, {useContext} from 'react';
import {Container} from 'native-base';
import {createStackNavigator} from '@react-navigation/stack';
import {UserContext} from '../utils/contexts';
import SplashScreen from '../components/SplashScreen';
import CoursesOverviewPage from './CoursesOverviewPage';
import DetailedAssessmentsPage from './DetailedAssessmentsPage';

interface Props {
  navigation: any;
};

const Stack = createStackNavigator();

const HomePage: React.FC<Props> = ({navigation}) => {

  const {userId} = useContext(UserContext);
  if (!userId) return <SplashScreen/>

  return (
    <Container>
        <Stack.Navigator screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal'
        }} initialRouteName='Overview'>
          <Stack.Screen
            name='Overview'
            component={CoursesOverviewPage}
          />
          <Stack.Screen 
            name='Detailed'
            component={DetailedAssessmentsPage}
          />
        </Stack.Navigator>

    </Container>
  );
};

export default HomePage;