import { ObjectId } from 'mongoose';

export interface T {
  [key: string]: any;
}

export enum Message {
  // General
  SOMETHING_WENT_WRONG = 'Something went wrong!',
  NO_DATA_FOUND = 'No data found!',
  CREATE_FAILED = 'Create failed!',
  UPDATE_FAILED = 'Update failed!',
  REMOVE_FAILED = 'Remove failed!',
  UPLOAD_FAILED = 'Upload failed!',
  BAD_REQUEST = 'Bad Request',

  // Auth & Access
  NOT_AUTHENTICATED = 'You are not authenticated, please login first!',
  TOKEN_NOT_EXIST = 'Bearer Token is not provided!',
  ONLY_SPECIFIC_ROLES_ALLOWED = 'Allowed only for users with specific roles!',
  NOT_ALLOWED_REQUEST = 'Not Allowed Request!',
  BLOCKED_USER = 'Your account has been blocked!',
  WRONG_PASSWORD = 'Wrong password, try again!',

  // Upload formats (farm images, reports)
  PROVIDE_ALLOWED_FORMAT = 'Please provide jpg, jpeg or png files only!',

  // Smart Farm: User/Farm
  NO_FARM_FOUND = 'No farm found with that information!',
  NO_FARM_OWNER = 'No farm owner found!',
  FARM_ACCESS_DENIED = 'You do not have access to this farm!',

  // Smart Farm: Field / Greenhouse
  NO_FIELD_FOUND = 'No field found!',
  NO_GREENHOUSE_FOUND = 'No greenhouse found!',
  FIELD_ACCESS_DENIED = 'You do not have access to this field!',

  // Smart Farm: Device / Sensor
  NO_DEVICE_FOUND = 'No device found!',
  DEVICE_OFFLINE = 'Device is offline!',
  DEVICE_NOT_CONNECTED = 'Device is not connected!',
  DEVICE_PAIRING_FAILED = 'Device pairing failed!',
  DEVICE_ALREADY_REGISTERED = 'Device is already registered!',
  SENSOR_NOT_FOUND = 'No sensor found!',
  SENSOR_DATA_NOT_AVAILABLE = 'Sensor data is not available yet!',

  // Smart Farm: Monitoring / Readings
  INVALID_SENSOR_READING = 'Invalid sensor reading data!',
  READING_CREATE_FAILED = 'Failed to save sensor reading!',
  READING_UPDATE_FAILED = 'Failed to update sensor reading!',

  // Smart Farm: Irrigation / Automation
  IRRIGATION_NOT_FOUND = 'No irrigation schedule found!',
  IRRIGATION_START_FAILED = 'Failed to start irrigation!',
  IRRIGATION_STOP_FAILED = 'Failed to stop irrigation!',
  IRRIGATION_ALREADY_RUNNING = 'Irrigation is already running!',
  AUTOMATION_RULE_NOT_FOUND = 'No automation rule found!',
  AUTOMATION_RULE_CREATE_FAILED = 'Failed to create automation rule!',
  AUTOMATION_RULE_UPDATE_FAILED = 'Failed to update automation rule!',

  // Smart Farm: Crop / Planting
  CROP_NOT_FOUND = 'No crop found!',
  PLANTING_NOT_FOUND = 'No planting record found!',
  PLANTING_CREATE_FAILED = 'Failed to create planting record!',
  HARVEST_CREATE_FAILED = 'Failed to create harvest record!',

  // Smart Farm: Alerts
  ALERT_NOT_FOUND = 'No alert found!',
  ALERT_CREATE_FAILED = 'Failed to create alert!',
  ALERT_UPDATE_FAILED = 'Failed to update alert!',
  USED_MEMBER_NICK_OR_PHONE = "USED_MEMBER_NICK_OR_PHONE",
  NO_MEMBER_NICK = "NO_MEMBER_NICK",
}


export interface StatisticModifier {
  _id: ObjectId;
  targetKey: string;
  modifier: number;
}
