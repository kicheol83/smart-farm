import { ObjectId } from 'bson';
export const AUTH_TIMER = 30;
export const CREATE_JOB_LIMIT = 3;

/** IMAGE CONFIGURATION **/
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
  const ext = path.parse(filename).ext;
  return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
  return typeof target === 'string' ? new ObjectId(target) : target;
};

export const availableManagerSorts = [
  'createdAt',
  'updatedAt',
  'memberRole',
  'memberStatus',
];
export const availableMembersSorts = [
  'createdAt',
  'updatedAt',
  'memberRole',
  'memberStatus',
];
