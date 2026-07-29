import * as mongoose from 'mongoose';

const AutomationRulesSchema = new mongoose.Schema(
  {
    ruleName: {
      type: String,
      required: true,
      trim: true,
    },
    actuatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'actuators',
      required: true,
      index: true,
    },
    triggerSensorType: {
      type: String,
      required: true,
    },
    triggerCondition: {
      type: String,
      enum: ['BELOW', 'ABOVE'],
      required: true,
    },
    triggerThreshold: {
      type: Number,
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'sections',
      required: false,
    },
    greenHouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'greenHouses',
      required: true,
      index: true,
    },
    actionDurationMinutes: {
      type: Number,
      required: false,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    lastTriggeredAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'automationRules',
  },
);

AutomationRulesSchema.index({ greenHouseId: 1, enabled: 1 });

export default AutomationRulesSchema;
