import {
  Stitch, 
  RemoteMongoClient,
  RemoteMongoDatabase,
} from 'mongodb-stitch-react-native-sdk';
import {ObjectId} from 'bson';


export const db = (): RemoteMongoDatabase => {
  return Stitch.defaultAppClient
    .getServiceClient(RemoteMongoClient.factory, 'tsapp-service')
    .db('tsapp');
};

export interface FcmToken {
  userId: ObjectId;
  fcmToken: string;
};

export interface NotificationSettings {
  userId: ObjectId;
  notificationEnabled: boolean;
};

export interface UserSetting {
  userId: ObjectId;
  precision: number;
  notificationEnabled: boolean;
  animationEnabled: boolean;
  displayName: string;
};

export interface DBLoggedIn {
  userId: ObjectId;
  loggedIn: boolean;
};


export interface Mark {
  numerator: number;
  denominator: number;
  weight: number;
};

export type Marks = {
  [strand in Strand]: Mark|null
};

export type Strand = 'k'|'t'|'c'|'a'|'f';


/**
 * Updates the FCM to database.
 * @param fcmToken the user's FCM token and userId.
 */
export const updateFcmToken = (fcmToken: FcmToken): Promise<void> => {
  return updateData(fcmToken);
}

/**
 * A user's permission is enabled by default on Android,
 * but is requested on IOS.
 * 
 * @param notificationPermission the user's permission settings.
 */
export const updateNotificationSettings = (
  notificationPermission: NotificationSettings
): Promise<void> => {
  return updateData(notificationPermission);
};

/**
 * Updates the user's custom settings to database.
 * @param userSetting the user's custom settings.
 */
export const updateUserSetting = (userSetting: UserSetting): Promise<void> => {
  return updateData(userSetting);
};

/**
 * Different from the loggedIn state variable from App.tsx,
 * sets whether the user is logged in the entire app even if it is running 
 * in the background.
 * 
 * @param dbLoggedIn whether a user is logged in with persistence state
 */
export const setDBLoggedIn = (dbLoggedIn: DBLoggedIn): Promise<void> => {
  return updateData(dbLoggedIn);
};


/**
 * Search the user by userId and updates whatever data that's needed.
 * @param data the data that needs to be updated to database
 */
const updateData = async (data:
   FcmToken
   |NotificationSettings
   |DBLoggedIn
   |UserSetting
): Promise<void> => {
  
  const userId: ObjectId = data.userId;
  delete data.userId;
  try {
    await db().collection('users').findOneAndUpdate({
      _id: userId,
    }, {
      $set: {...data},
    });
    console.log('successfully updated');

  } catch (err) {
    console.log(err);
  }
};

/**
 * Get the date in terms of Feb/Sep for semesters.
 * @returns the date
 */
export const getDate = (): string => {
  const now = new Date();
  if (now.getMonth() >= 1 && now.getMonth() < 8) {
    // [Feb, Sep)
    return `Feb ${now.getFullYear()}`;
  } else {
    return `Sep ${now.getFullYear()}`;
  }
};

/**
 * Gets the user document from the database.
 * @param userId the userId
 * @returns the user document
 * @todo make a user interface
 */
export const getUser = async(userId: ObjectId): Promise<any> => {
  const user: any = await db().collection('users').findOne({
    _id: userId
  });
  return user; 
};