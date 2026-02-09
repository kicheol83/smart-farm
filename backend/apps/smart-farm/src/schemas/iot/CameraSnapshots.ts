import { Schema } from 'mongoose';

export const CameraSnapshootsSchema = new Schema(
  {
    snapshotUrl: {
      type: String,
      required: true,
    },
    captureAt: {
      type: Date,
      required: true,
    },
    cameraId: {
      type: Schema.Types.ObjectId,
      ref: 'Camera',
      required: true,
    },
  },
  { timestamps: true, collection: 'camera_snapshots' },
);

CameraSnapshootsSchema.index({ cameraId: 1 });
CameraSnapshootsSchema.index({ captureAt: -1 });
CameraSnapshootsSchema.index({ cameraId: 1, captureAt: -1 });

export default CameraSnapshootsSchema;
