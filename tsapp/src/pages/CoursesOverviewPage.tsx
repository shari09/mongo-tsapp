import React, { useEffect, useContext, useState } from 'react';
import {View, StyleSheet, RefreshControl} from 'react-native';
import {Container, Content} from 'native-base';
import {Stitch, RemoteMongoClient} from 'mongodb-stitch-react-native-sdk';


import {UserContext, ThemeContext, ThemeColour} from '../utils/contexts';
import {getDate, db} from '../utils/functions';
import Course from '../components/Course';
import SplashScreen from '../components/SplashScreen';
import HeaderNav from '../components/HeaderNav';

interface Props {
  navigation: any;
};

interface CourseInfo {
  name: string;
  courseCode: string;
  room: string;
  average: string;
};

const CoursesOverviewPage: React.FC<Props> = ({navigation}) => {
  const now = getDate();
  const {userId, name, precision} = useContext(UserContext);
  if (!userId) return <SplashScreen/>;

  const {colour} = useContext(ThemeContext);
  const styles = getStyles(colour);

  const [courses, setCourses] = useState<CourseInfo[]|null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);


  const getCourseInfo = async() => {

    const courseOverviews: any[] = await db().collection('courseOverviews')
      .find({
        date: now,
        userId: userId
      }, {sort: {
        period: 1
      }})
      .toArray();

    if (courseOverviews.length > 0) {

      const coursesInfo: CourseInfo[] = courseOverviews.map(course => {
        course.average = (course.average*100).toFixed(precision);
        return course as CourseInfo;
      });
      setCourses(coursesInfo);
    }
  };

  const refresh = async(): Promise<void> => {
    setRefreshing(true);
    await Stitch.defaultAppClient.callFunction('run', [userId]);
    await getCourseInfo();
    setRefreshing(false);
  };

  const navigate = (courseCode: string) => {
    navigation.navigate('Detailed', {courseCode: courseCode});
  };

  useEffect(() => {
    (async() => {
      await Stitch.defaultAppClient.callFunction('run', [userId]);
      await getCourseInfo();
    })();
  }, []);

  if (!courses) {
    return <SplashScreen/>
  }


  //get the courses
  const getCoursesCards = () => {
    return courses.map(course => (
      <Course
        name={course.name}
        courseCode={course.courseCode}
        navigate={navigate}
        room={course.room}
        average={course.average}
      />
    ));
  };

  return (
    <Container>
      <HeaderNav heading={name||'Home'} toggleDrawer={navigation.toggleDrawer}/>
      <Content style={styles.content} refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={refresh} 
          colors={[colour.refresh]}/>
      }>
        <View style={styles.dropShadow}></View>
        {getCoursesCards()}
      </Content>
    </Container>
    
  );
};

const getStyles = (colour: ThemeColour) => {
  const styles = StyleSheet.create({
    content: {
      backgroundColor: colour.background,
    },
    dropShadow: {
      elevation: 5,
      backgroundColor: colour.header.dropShadow,
      height: 1,
      marginBottom: 20
    }
  });
  return styles;
};



export default CoursesOverviewPage;