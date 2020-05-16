import React, {useState, useContext, useEffect} from 'react';
import {RefreshControl, StyleSheet} from 'react-native';
import { Container, Content, View, Text } from 'native-base';

import GoBackNav from '../components/GoBackNav';
import {UserContext, ThemeContext, ThemeColour} from '../utils/contexts';
import {getDate, Marks, db, Strand, Mark} from '../utils/functions';
import AssessmentComponent from '../components/Assessment';
import StrandComponent from '../components/StrandComponent';
import SplashScreen from '../components/SplashScreen';

interface Props {
  navigation: any;
  route: any;
};

interface Assessment {
  name: string;
  marks: Marks;
  average: string|null;
  feedback: string;
};

type CourseAvg = {
  [strand in Strand]: Mark|null;
};

type TotalMarks = {
  [strand in Strand]: {
    total: number;
    weight: number;
  };
};

type Weights = {
  [strand in Strand]: number|null;
};

const now = getDate();


const DetailedAssessmentsPage: React.FC<Props> = ({navigation, route}) => {
  if (!route.params?.courseCode) {
    throw new Error('course info not passed for assessments page');
  }
  const courseCode: string = route.params.courseCode;
  const {userId, precision} = useContext(UserContext);
  if (!userId) throw new Error('no uid for retrieving assessments');

  const {colour} = useContext(ThemeContext);
  const styles = getStyles(colour);

  const [assessments, setAssessments] = useState<Assessment[]|null>(null);
  const [courseAvg, setCourseAvg] = useState<CourseAvg|null>(null);
  const [weights, setCourseWeights] = useState<Weights|null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);


  const getAssessmentAvg = async(marks: Marks): Promise<string|null> => {

    let sum: number = 0;
    let totalWeight: number = 0;
    Object.keys(marks).forEach(strand => {
      const typedStrand = strand as Strand;
      const mark = marks[typedStrand];
      if (mark) {
        sum += mark.numerator/mark.denominator*mark.weight;
        totalWeight+=mark.weight;
      }
    });
    if (totalWeight === 0) {
      return null;
    }
    return (sum/totalWeight*100).toFixed(precision);
  };

  // const setCourseWeights = (weights: {[strand in Strand]: number}) => {
  //   let avg: CourseAvg = {} as any;
  //   Object.keys(weights).forEach((strand: string) => {
  //     const typedStrand: Strand = strand as Strand;
  //     if (isNaN(weights[typedStrand])) return;
  //     avg[typedStrand] = {
  //       numerator: 0,
  //       denominator: 0,
  //       weight: weights[typedStrand]
  //     };
  //   });
  //   setCourseAvg(avg);
  // };


  const getCourseData = async(): Promise<{
    weights: Weights;
    assessments: Assessment[];
}> => {

    const course: any = await db().collection('courses').findOne({
      courseCode: courseCode,
      date: now
    });


    const assessmentDocs = await db().collection('assessments').find({
      userId: userId,
      courseId: course._id
    }, {sort: {order: 1}}).toArray();

    const assessments: Assessment[] = await Promise.all(assessmentDocs.map(async (doc: any) => {
      const assessment: Assessment = {
        name: doc.name,
        marks: doc.marks,
        average: null,
        feedback: doc.feedback
      } as Assessment;
      assessment.average = await getAssessmentAvg(assessment.marks);
      return assessment;
    }));
    const weights: Weights = course.weights;
    setCourseWeights(weights);
    setAssessments(assessments);
    return {weights: weights, assessments: assessments};
  };

  const getStrandsAvg = (assessments: Assessment[], weights: Weights) => {

    let totalMarks: TotalMarks = {} as any;
    
    assessments.map(assessment => assessment.marks).forEach(mark => {
      Object.keys(mark).forEach(strand => {
        const typedStrand = strand as Strand;
        let [totalMarkStrand, markStrand] = [totalMarks[typedStrand], mark[typedStrand]];
        
        if (!totalMarkStrand) {
          totalMarkStrand = {
            total: 0,
            weight: 0
          };
        }

        if (markStrand && !isNaN(markStrand.weight) && markStrand.weight !== 0) {
          totalMarkStrand.total += markStrand.numerator/markStrand.denominator*markStrand.weight;
          totalMarkStrand.weight += markStrand.weight;
        }
        totalMarks[typedStrand] = totalMarkStrand;
      });
    });

    let avg: CourseAvg = {
      k: null,
      t: null,
      c: null,
      a: null,
      f: null
    };

    Object.keys(weights).forEach(strand => {
      const typedStrand = strand as Strand;
      const curStrandWeight = weights[typedStrand];
      
      if (!curStrandWeight) return;

      avg[typedStrand] = {
        numerator: totalMarks[typedStrand].total,
        denominator: totalMarks[typedStrand].weight,
        weight: curStrandWeight
      };
    });
    setCourseAvg(avg);
  };

  const refresh = async() => {
    setRefreshing(true);
    const {assessments, weights} = await getCourseData();
    getStrandsAvg(assessments, weights);
    setRefreshing(false);
  };

  useEffect(() => {
    (async() => {
      const {assessments, weights} = await getCourseData();
      getStrandsAvg(assessments, weights);
    })();
  }, []);

  

  if (!assessments || !courseAvg) {
    return <SplashScreen/>
  }

  const getAssessmentCards = () => {
    return assessments.map(assessment => (
      <AssessmentComponent
        name={assessment.name}
        marks={assessment.marks}
        average={assessment.average}
        feedback={assessment.feedback}
      />
    ));
  };

  const getStrands = () => {
    if (!courseAvg) throw new Error('courseAvg is not defined');
    return Object.keys(courseAvg).map(strand => {
      const typedStrand = strand as Strand;
      return <StrandComponent 
        strand={typedStrand} 
        mark={courseAvg[typedStrand]}
        courseStrand={true}/>
    });
  };

  const getCourseAvg = () => {
    if (!courseAvg || !weights) return;
    let totalMark: number = 0;
    let totalWeight: number = 0;
    Object.keys(courseAvg).forEach((strand: string) => {
      const typedStrand = strand as Strand;
      const curStrand = courseAvg[typedStrand];
      if (!curStrand || !curStrand.denominator) return;
      totalMark += curStrand.numerator/curStrand.denominator*curStrand.weight;
      totalWeight += curStrand.weight;
    });
    return (totalMark/totalWeight*100).toFixed(precision);
  };

  return (
    <Container>
      <GoBackNav 
        goBack={navigation.goBack} 
        courseCode={courseCode}
        average={getCourseAvg()||''}/>
      <Content refreshControl={
        <RefreshControl 
        refreshing={refreshing} 
        onRefresh={refresh} 
        colors={[colour.refresh]}/>
      }
      style={{
        backgroundColor: colour.background,
        padding: 15
      }}
      >
        <View style={styles.courseAvg}>
          {getStrands()}
        </View>
        {getAssessmentCards()}
        <View style={{height: 40}}/>
      </Content>
    </Container>
  );
};

const getStyles = (colour: ThemeColour) => {
  return StyleSheet.create({
    courseAvg: {
      flexDirection: 'row',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: 20,
      marginTop: 25
    }
  });
};


export default DetailedAssessmentsPage;