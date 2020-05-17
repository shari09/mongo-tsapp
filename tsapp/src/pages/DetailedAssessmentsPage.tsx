import {Container, Content, View} from 'native-base';
import React, {useContext, useEffect, useState} from 'react';
import {RefreshControl, StyleSheet} from 'react-native';
import AssessmentComponent from '../components/Assessment';
import GoBackNav from '../components/GoBackNav';
import SplashScreen from '../components/SplashScreen';
import StrandComponent from '../components/StrandComponent';
import {
  IUserContext,
  Theme,
  ThemeColour,
  ThemeContext,
  UserContext,
} from '../utils/contexts';
import {db, getDate, Mark, Marks, Strand} from '../utils/functions';

interface Props {
  navigation: any;
  route: any;
}

interface Assessment {
  name: string;
  marks: Marks;
  average: string | null;
  feedback: string;
}

type StrandsAvg = {
  [strand in Strand]: Mark | null;
};

type TotalMarks = {
  [strand in Strand]: {
    total: number;
    weight: number;
  };
};

type Weights = {
  [strand in Strand]: number | null;
};

const now: string = getDate();

const DetailedAssessmentsPage: React.FC<Props> = ({navigation, route}) => {
  if (!route.params?.courseCode) {
    throw new Error('course info not passed for assessments page');
  }
  const courseCode: string = route.params.courseCode;
  const {userId, precision} = useContext<IUserContext>(UserContext);
  if (!userId) {
    throw new Error('no uid for retrieving assessments');
  }

  const {colour} = useContext<Theme>(ThemeContext);
  const styles = getStyles(colour);

  const [assessments, setAssessments] = useState<Assessment[] | null>(null);
  const [strandsAvg, setStrandsAvg] = useState<StrandsAvg | null>(null);
  const [weights, setCourseWeights] = useState<Weights | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  /**
   * Find the assessment average.
   * @param marks the marks for the assessment.
   * @returns assessment average,
   *          'isNaN' if the weights are zero,
   *          and null if there is no marks present.
   */
  const getAssessmentAvg = async (marks: Marks): Promise<string | null> => {
    let sum: number = 0;
    let totalWeight: number = 0;
    Object.keys(marks).forEach((strand: string) => {
      const typedStrand: Strand = strand as Strand;
      const mark: Mark | null = marks[typedStrand];
      if (mark) {
        sum += (mark.numerator / mark.denominator) * mark.weight;
        totalWeight += mark.weight;
      }
    });
    if (totalWeight === 0) {
      return null;
    }
    return ((sum / totalWeight) * 100).toFixed(precision);
  };

  /**
   * Get the course weights and assessment data from the database.
   * @todo make interface for query results.
   * @returns course weights and assessments.
   */
  const getCourseData = async (): Promise<{
    weights: Weights;
    assessments: Assessment[];
  }> => {
    const course: any = await db().collection('courses').findOne({
      courseCode: courseCode,
      date: now,
    });

    const assessmentDocs = await db()
      .collection('assessments')
      .find(
        {
          userId: userId,
          courseId: course._id,
        },
        {sort: {order: 1}},
      )
      .toArray();

    const assessments: Assessment[] = await Promise.all(
      assessmentDocs.map(async (doc: any) => {
        const assessment: Assessment = {
          name: doc.name,
          marks: doc.marks,
          average: null,
          feedback: doc.feedback,
        } as Assessment;
        assessment.average = await getAssessmentAvg(assessment.marks);
        return assessment;
      }),
    );
    const weights: Weights = course.weights;
    return {
      weights: weights,
      assessments: assessments,
    };
  };

  /**
   * Gets the average of each strand, used for overall strand average display.
   * @param assessments the assessments.
   * @param weights the course weights.
   * @returns the average of each strand.
   */
  const getStrandsAvg = (
    assessments: Assessment[],
    weights: Weights,
  ): StrandsAvg => {
    let totalMarks: TotalMarks = {} as any;

    assessments
      .map((assessment: Assessment) => assessment.marks)
      .forEach((marks: Marks) => {
        Object.keys(marks).forEach((strand: string) => {
          const typedStrand: Strand = strand as Strand;
          let [totalMarkStrand, markStrand] = [
            totalMarks[typedStrand],
            marks[typedStrand],
          ];

          if (!totalMarkStrand) {
            totalMarkStrand = {
              total: 0,
              weight: 0,
            };
          }

          if (
            markStrand &&
            !isNaN(markStrand.weight) &&
            markStrand.weight !== 0
          ) {
            totalMarkStrand.total +=
              (markStrand.numerator / markStrand.denominator) *
              markStrand.weight;
            totalMarkStrand.weight += markStrand.weight;
          }
          totalMarks[typedStrand] = totalMarkStrand;
        });
      });

    let avg: StrandsAvg = {
      k: null,
      t: null,
      c: null,
      a: null,
      f: null,
    };

    Object.keys(weights).forEach((strand: string) => {
      const typedStrand: Strand = strand as Strand;
      const curStrandWeight: number | null = weights[typedStrand];

      if (!curStrandWeight) {
        return;
      }

      avg[typedStrand] = {
        numerator: totalMarks[typedStrand].total,
        denominator: totalMarks[typedStrand].weight,
        weight: curStrandWeight,
      };
    });
    return avg;
  };

  /**
   * Loads the course weight data, assessment data,
   * and recalculates the strands average.
   * [does not refresh the database data from ta website]
   */
  const load = async (): Promise<void> => {
    const {assessments, weights} = await getCourseData();
    setCourseWeights(weights);
    setAssessments(assessments);
    const strandsAvg = getStrandsAvg(assessments, weights);
    setStrandsAvg(strandsAvg);
  };

  /**
   * Reloads all the data.
   */
  const refresh = async (): Promise<void> => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  //load all data upon mounting
  useEffect(() => {
    load();
  }, []);

  if (!assessments || !strandsAvg) {
    return <SplashScreen />;
  }

  /**
   * Get the assessment card components.
   * @returns an array of components.
   */
  const getAssessmentCards = (): JSX.Element[] => {
    return assessments.map((assessment) => (
      <AssessmentComponent
        name={assessment.name}
        marks={assessment.marks}
        average={assessment.average}
        feedback={assessment.feedback}
      />
    ));
  };

  /**
   * Gets the display for the strand averages.
   * @returns an array of the Strand components.
   */
  const getStrands = (): JSX.Element[] => {
    if (!strandsAvg) {
      throw new Error('strandsAvg is not defined');
    }
    return Object.keys(strandsAvg).map((strand: string) => {
      const typedStrand: Strand = strand as Strand;
      return (
        <StrandComponent
          strand={typedStrand}
          mark={strandsAvg[typedStrand]}
          courseStrand={true}
        />
      );
    });
  };

  /**
   * Gets the overall course average.
   * @returns course average fixed to the user precision preference,
   *          undefined if there are missing weights.
   */
  const getCourseAvg = (): string | undefined => {
    if (!strandsAvg || !weights) {
      return;
    }
    let totalMark: number = 0;
    let totalWeight: number = 0;
    Object.keys(strandsAvg).forEach((strand: string) => {
      const typedStrand = strand as Strand;
      const curStrand: Mark | null = strandsAvg[typedStrand];
      if (!curStrand || !curStrand.denominator) {
        return;
      }
      totalMark +=
        (curStrand.numerator / curStrand.denominator) * curStrand.weight;
      totalWeight += curStrand.weight;
    });
    return ((totalMark / totalWeight) * 100).toFixed(precision);
  };

  return (
    <Container>
      <GoBackNav
        goBack={navigation.goBack}
        courseCode={courseCode}
        average={getCourseAvg() || ''}
      />
      <Content
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colour.refresh]}
          />
        }
        style={{
          backgroundColor: colour.background,
          padding: 15,
        }}>
        <View style={styles.courseAvg}>{getStrands()}</View>
        {getAssessmentCards()}
        <View style={{height: 40}} />
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
      marginTop: 25,
    },
  });
};

export default DetailedAssessmentsPage;
