const getDate = () => {
  const now = new Date();
  if (now.getMonth() >= 1 && now.getMonth() < 8) {
    // [Feb, Sep)
    return `Feb ${now.getFullYear()}`;
  } else {
    return `Sep ${now.getFullYear()}`;
  }
};



const getFromTa = async(username, password) => {
  let homePage;
  //signing in
  try {
    console.log(`logging in as ${username}`);
    const res = await context.http.post({
      url: `https://ta.yrdsb.ca/yrdsb/index.php?username=${username}&password=${password}`,
      // body: `username=${username}&password=${password}`,
      // headers: {'Content-Type': ['application/x-www-form-url-encoded']}, 
      followRedirects: true,
    });
    // console.log(JSON.stringify(res, null, 2));

    homePage = res.body.text();
  } catch (e) {
    console.log(e);
  }

  if (/Invalid Login/.test(homePage)) {
    throw new Error(`Invalid login: ${username}`);
  }

  //course overview
  const courseOverviews = getCourseOverviews(homePage);


  //course details

  const courseLinkRegex = /<a href="viewReport.php\?subject_id=([0-9]+)&student_id=([0-9]+)">/g;
  let courseLinkMatches = courseLinkRegex.exec(homePage);
  
  //following the course links
  if (!courseLinkMatches) {
    console.log(`no open coursePages found for user ${username}`);
    return [null, null];
  }

  let courses = [];
  let coursePage;
  let coursePageRes;
  let courseCode;
  let weights;
  let assessments;
  
  while (courseLinkMatches) {

    try {
      coursePageRes = await context.http.get({
        url: `https://ta.yrdsb.ca/live/students/viewReport.php?subject_id=${courseLinkMatches[1]}&student_id=${courseLinkMatches[2]}`
      });
    } catch (e) {
      console.log(e);
    }

    coursePage = coursePageRes.body.text().replace(/\s+/g, ' ');

    courseCode = getCourseCode(coursePage);
    weights = getWeights(coursePage);
    assessments = getAssessments(coursePage);

    courses.push({
      courseCode: courseCode,
      weights: weights,
      assessments: assessments
    });

    courseLinkMatches = courseLinkRegex.exec(homePage);
  }
  return [courseOverviews, courses];
};


const getCourseCode = (coursePage) => {
  const courseCodeMatch = /<h2>(\S+?)<\/h2/.exec(coursePage);
  if (courseCodeMatch) return courseCodeMatch[1];
  return null;
};


const getWeights = (coursePage) => {
  const weights = {};

  //other and culminating are combined together which is weird
  const strandColours = {
    k: '#ffffaa',
    t: '#c0fea4',
    c: '#afafff',
    a: '#ffd490',
    f: '#cccccc'
  };
  
  Object.keys(strandColours).forEach(strand => {
    const weightRegexStr = `<tr bgcolor="${strandColours[strand]}">.*?right">(.*?)%.*?right">(.*?)%`;
    const weightRegex = new RegExp(weightRegexStr, 'gs');
    const result = weightRegex.exec(coursePage);
    if (!result) return;
    if (strand === 'f') {
      weights[strand] = Number(result[1]);
    } else {
      weights[strand] = Number(result[2]);
    }
  });
  return weights;
};

const getAssessments = (coursePage) => {
  const strandColours = {
    k: 'ffffaa',
    t: 'c0fea4',
    c: 'afafff',
    a: 'ffd490',
    f: 'cccccc'
  };
  
  let assessments = [];
  
  const assessmentRegex = /<td rowspan="2">.*?&nbsp;\s*<\/td>\s*<\/tr>/gs;
  let assessmentMatch = assessmentRegex.exec(coursePage);
  
  const nameRegex = /<td rowspan="2">(.*?)<\/td>/;
  
  while (assessmentMatch) {
    const assessment = {};
    assessment.marks = {};
  
    let assessmentStr = assessmentMatch[0];
    
    assessment.name = filterSpecialSymbols(nameRegex.exec(assessmentStr)[1].trim());
  
    Object.keys(strandColours).forEach(strand => {
      const strandMarkRegexStr = `<td bgcolor="${strandColours[strand]}" align="center" id=.*?>(.*?)/(.*?)=`;
      const strandMarkRegex = new RegExp(strandMarkRegexStr);
  
      //get the marks
      const strandMarkMatch = strandMarkRegex.exec(assessmentStr);
      const strandWeightMatch = /(weight=(.*?)|(no weight))</.exec(assessmentStr);
      if (strandMarkMatch) {
        assessment.marks[strand] = {};
        assessment.marks[strand].numerator = Number(strandMarkMatch[1]);
        assessment.marks[strand].denominator = Number(strandMarkMatch[2]);
        assessment.marks[strand].weight = Number(strandWeightMatch[2]);
  
        //strip it so it won't match the same strand
        assessmentStr = assessmentStr.slice(strandWeightMatch.index);
      } else {
        assessment.marks[strand] = null;
      }
    });
    const feedbackRegex = /<td colspan="4" bgcolor="white">(.*)&nbsp;/gs;
    const feedbackMatch = feedbackRegex.exec(assessmentStr);
    
    assessment.feedback = filterSpecialSymbols(
      feedbackMatch[1]
        .replace(/\n/g, '')
        .replace(/<br>/g, '\n')
        .trim()
    );
    
    assessments.push(assessment);
    assessmentMatch = assessmentRegex.exec(coursePage);

  }
  return assessments;
};


const filterSpecialSymbols = (sentence) => {
  let filteredSentence = sentence;
  const specialSymbols = [/&amp;/g, /&#039;/g];
  const filtered = ['&', "'"];

  specialSymbols.forEach((symbol, index) => {
    filteredSentence = filteredSentence.replace(symbol, filtered[index]);
  });
  return filteredSentence;
};

const getCourseOverviews = (homePage) => {
  homePage = homePage.replace(/\s+/g, ' ');
  const courseRegex = /<tr bgcolor="#(ddffff|eeffff)">.*?<\/td>/g;

  let courseMatch = courseRegex.exec(homePage);
  
  let courseOverviews = [];
  while (courseMatch) {
    const courseMatchStr = courseMatch[0];
    const courseOverview = {};
    let match;
    
    match = /(.{6}-.{2})/.exec(courseMatchStr);
    courseOverview.courseCode = match ? match[1] : '';
  
    match = /:(.*?)<br>/.exec(courseMatchStr);
    courseOverview.name = match ? match[1].trim() : '';
  
    match = /Block:(.*?)-/.exec(courseMatchStr);
    courseOverview.period = match ? match[1].trim() : '';
  
    match = /rm\.(.*?)</gs.exec(courseMatchStr);
    courseOverview.room = match ? match[1].trim() : '';
  
    courseOverviews.push(courseOverview);
    courseMatch = courseRegex.exec(homePage);
  }

  return courseOverviews;
};


const updateDB = async(courses, userId) => {
  const db = context.services.get('tsapp-service').db('tsapp');

  const asyncFunctions = courses.map(course => async() => {
    const coursesCollection = db.collection('courses');
    const date = getDate();
    
    try {
      let docId;
      const courseDoc = await coursesCollection
            .findOne({
              courseCode: course.courseCode,
              date: getDate()
            });
      //if this course does not exist, first time set up add weightings
      if (!courseDoc) {
        docId = (await coursesCollection.insertOne({
          courseCode: course.courseCode,
          date: date,
          students: [userId],
          assessmentNames: [],
          weights: course.weights
        })).insertedId;
      } else {
        docId = courseDoc._id;

        
        //add the student to the course
        if (courseDoc.students.indexOf(userId) > -1) {
          const query = {_id: docId};
          const update = {
            $addToSet: {
              students: userId
            }
          };
          coursesCollection.findOneAndUpdate(query, update);
        }
      }

      
      //add/update assessment names
      const assessmentNames = course.assessments.map(assessment => assessment.name);
      
      //very sketched i'll rewrite this
      await coursesCollection.findOneAndUpdate(
        {_id: docId},
        {$set: {assessmentNames: assessmentNames}}
      );
      const modified = await updateAssessments(course, docId, userId)
      
      //if there is a change in the student's assessments
      if (modified) {
        return updateCourseAvg(course, userId);
      }

      return Promise.resolve();
    } catch (e) {
      //I'll do something about this later
      console.log(e);
    }
  });

  return asyncFunctions.reduce(async(prevPromise, nextFunction) => {
    await prevPromise;
    await nextFunction();
  }, Promise.resolve());
};


const updateCourseAvg = async(course, userId) => {
  const courseOverviewCollection = context.services.get('tsapp-service')
                                    .db('tsapp')
                                    .collection('courseOverviews');
  const now = getDate();
  const avg = getCourseAvg(course.weights, course.assessments);

  const courseDoc = await courseOverviewCollection.findOne({
    date: now,
    courseCode: course.courseCode,
    userId: userId
  });

  if (!courseDoc) {
    return courseOverviewCollection.insertOne({
      userId: userId,
      average: avg,
      date: now
    });
  }
  return courseOverviewCollection.findOneAndUpdate({
    date: now,
    courseCode: course.courseCode,
    userId: userId
  }, {
    $set: {average: avg}
  });
};

const getCourseAvg = (weights, assessments) => {
  //in case the teacher didn't post any weights
  if (!weights) return null;


  // [sum, total weights]
  const marks = {
    k: [0, 0],
    t: [0, 0],
    c: [0, 0],
    a: [0, 0],
    f: [0, 0]
  };

  assessments.forEach((assessment) => {
    Object.keys(assessment.marks).forEach(strand => {
      if (assessment.marks[strand] 
        && assessment.marks[strand].weight
        && !isNaN(assessment.marks[strand].weight)) {
        const mark = assessment.marks;
        marks[strand][0] += mark[strand].numerator/mark[strand].denominator*mark[strand].weight;
        marks[strand][1] += mark[strand].weight;
      }
    });
  });

  let sum = 0;
  let totalWeight = 0;
  Object.keys(marks).forEach(strand => {
    if (marks[strand][1] > 0) {
      sum += marks[strand][0]/marks[strand][1]*weights[strand];
      totalWeight += weights[strand];
    }
  });

  if (totalWeight === 0) return null;
  return sum/totalWeight;
};


const updateAssessments = async(course, courseId, userId) => {
  const assessmentCollection = context.services.get('tsapp-service')
                                               .db('tsapp')
                                               .collection('assessments');
  const _ = require('lodash');

  const assessments = await assessmentCollection.find({
    userId: userId,
    courseId: courseId
  }).sort({order: 1}).toArray();

  //index is used for ordering
  const taAssessments = course.assessments.map((assessment, index) => [assessment, index]);

  let modified = false;

  //deleting assessments and updating assessment order to database
  await Promise.all(assessments.map(async assessmentDoc => {
    const dbAssessment = {
      name: assessmentDoc.name,
      marks: assessmentDoc.marks,
      feedback: assessmentDoc.feedback
    };

    const match = taAssessments.filter(ta => {
      return _.isEqual(ta[0], dbAssessment);
    });

    const assessmentIdx = match.length > 0 ? taAssessments.indexOf(match[0]) : -1;

    //if assessment exists in db but not ta
    if (assessmentIdx === -1) {
      console.log('deleted assessment');
      modified = true;
      return assessmentCollection.findOneAndDelete({_id: assessmentDoc._id});
    }

    const order = taAssessments[assessmentIdx][1]; //the order of the assessment, for displaying reasons
    taAssessments.splice(assessmentIdx, 1); //delete the string so no duplicates

    //random assessment inserted in the middle of the table
    if (order !== assessmentDoc.order) {
      return assessmentsRef.findOneAndUpdate({_id: assessmentDoc._id}, {order: order});
    }
    return Promise.resolve();
  }));


  //adding new documents/updating marks/weights/feedback
  await Promise.all(taAssessments.map(async taAssessment => {
    const assessment = taAssessment[0];
    console.log(`new mark ${course.courseCode}`);
    modified = true;
    const res = await sendMarkNotif(userId, course.courseCode, assessment);
    console.log(JSON.stringify(res));
    return assessmentCollection.insertOne({
      userId: userId,
      courseId: courseId,
      order: taAssessment[1],
      ...assessment
    });
  }));
  return Promise.resolve(modified);

};

const sendMarkNotif = async(userId, courseCode, assessment) => {
  const db = context.services.get('tsapp-service').db('tsapp');
  return new Promise(async(resolve, reject) => {
    const user = await db.collection('users').findOne({_id: userId});
    let bodyText;
    let avg = getAssessmentAvg(assessment.marks);
    avg = avg ? (avg*100).toFixed(user.precision) : null;

    if (avg) {
      bodyText = `${assessment.name}: ${avg}%`;
    } else {
      bodyText = `${assessment.name}: null`;
    }

    const notification = {
      notification: {
        title: courseCode,
        body: bodyText,
      },
      to: user.fcmToken
    };

    resolve(context.http.post({
      url: 'https://fcm.googleapis.com/fcm/send',
      headers: {
        'Content-Type': ['application/json'],
        'Authorization': [`key=${context.values.get('fcmKey')}`]
      },
      body: JSON.stringify(notification)
    }));

  });
};

const getAssessmentAvg = (marks) => {
  let sum = 0;
  let totalWeight = 0;
  Object.keys(marks).forEach(strand => {
    const mark = marks[strand];
    if (mark && mark.weight) {
      sum += mark.numerator/mark.denominator*mark.weight;
      totalWeight += mark.weight;
    }
  });
  if (totalWeight === 0) {
    return null;
  }
  return sum/totalWeight;
};


const updateCourseOverviews = async(userId, courseOverviews) => {
  const now = getDate();
  const courseOverviewCollection = context.services.get('tsapp-service')
                                      .db('tsapp')
                                      .collection('courseOverviews');
  const courseOverviewsDb = await courseOverviewCollection.find({
    date: now,
    userId: userId
  }).toArray();

  courseOverviewsDb.forEach(overview => {
    const match = courseOverviews.filter(ta => {
      return ta.courseCode === overview.courseCode;
    });
    
    const sameCourseIdx = match.length > 0 ? courseOverviews.indexOf(match[0]) : -1;

    //user no longer registered in this course
    //dropped out or smth
    if (sameCourseIdx === -1) {
      courseOverviewCollection.findOneAndDelete({
        _id: overview._id
      }).catch(console.log);
    } else {
      //if the room number changed or something
      courseOverviewCollection.findOneAndUpdate({
        _id: overview._id
      }, {$set: {...courseOverviews[sameCourseIdx]}});
      courseOverviews.splice(sameCourseIdx, 1);
    }
  });

  if (courseOverviews.length > 0) {
    return Promise.all(courseOverviews.map(async taCourseOverview => {
      return courseOverviewCollection.insertOne({
        date: now,
        userId: userId,
        ...taCourseOverview
      });
    }));
  }
  
};



const run = async (userId) => {
  const db = context.services.get('tsapp-service').db('tsapp');
  if (!userId) {
    const users = await db.collection('users').find({
      // notificationEnabled: true,
      // loggedIn: true
    }).toArray();
    const asyncFunc = users.map(user => async () => {
      const [courseOverviews, courses] = await getFromTa(user.username, user.password);
      await updateDB(courses, user._id);
      await updateCourseOverviews(user._id, courseOverviews);
    });
    await asyncFunc.reduce(async (prevPromise, nextFunc) => {
      await prevPromise;
      await nextFunc();
    }, Promise.resolve());
  } else {
    //update only one user
    
    const user = await db.collection('users').findOne({_id: userId});
    const [courseOverviews, courses] = await getFromTa(user.username, user.password);
    await updateDB(courses, user._id);
    await updateCourseOverviews(user._id, courseOverviews);
  }
  
};

exports = run;