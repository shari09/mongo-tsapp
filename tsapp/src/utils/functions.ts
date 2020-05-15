import {
  Stitch, 
  RemoteMongoClient,
} from 'mongodb-stitch-react-native-sdk';
import {ObjectId} from 'bson';


export const db = () => {
  return Stitch.defaultAppClient
  .getServiceClient(RemoteMongoClient.factory, 'tsapp-service')
  .db('tsapp');
};


export const errorCodes = {
  INVALID_CREDENTIALS: 0
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



export const updateFcmToken = (fcmToken: FcmToken) => {
  return updateData(fcmToken);
}

export const updateNotificationSettings = (notificationPermission: NotificationSettings) => {
  return updateData(notificationPermission);
};

export const updateUserSetting = (userSetting: UserSetting) => {
  return updateData(userSetting);
};

export const setDBLoggedIn = (dbLoggedIn: DBLoggedIn) => {
  return updateData(dbLoggedIn);
};


//updating to cloud firestore
const updateData = async (data: FcmToken|NotificationSettings|DBLoggedIn|UserSetting) => {
  
  const userId = data.userId;
  delete data.userId;
  try {
    await db().collection('users').findOneAndUpdate({
      _id: userId
    }, {
      $set: {...data}
    });
    console.log('successfully updated');
    return 'successfully updated';

  } catch (err) {
    return err;
  }
};


export const getDate = (): string => {
  const now = new Date();
  if (now.getMonth() >= 1 && now.getMonth() < 8) {
    // [Feb, Sep)
    return `Feb ${now.getFullYear()}`;
  } else {
    return `Sep ${now.getFullYear()}`;
  }
};

export const getUser = async(userId: ObjectId): Promise<any> => {
  const user: any = await db().collection('users').findOne({
    _id: userId
  });
  return user; 
};