import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, 'Please provide a location ID'],
      unique: true,
      trim: true,
    },
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Please provide a business ID'],
    },
    branch_name: {
      type: String,
      required: [true, 'Please provide a branch name'],
      maxlength: [100, 'Branch name cannot be more than 100 characters'],
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: [true, 'Please provide a street address'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'Please provide a city'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'Please provide a state'],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, 'Please provide a zip code'],
        trim: true,
      },
      country: {
        type: String,
        default: 'US',
        trim: true,
      },
      building: {
        type: String,
        trim: true,
      },
      floor: {
        type: String,
        trim: true,
      },
      landmark: {
        type: String,
        trim: true,
      },
    },
    contact: {
      phone: {
        type: String,
        required: [true, 'Please provide a contact phone'],
        trim: true,
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
    },
    longitude: {
      type: Number,
      required: [true, 'Please provide longitude'],
      min: -180,
      max: 180,
    },
    latitude: {
      type: Number,
      required: [true, 'Please provide latitude'],
      min: -90,
      max: 90,
    },
    timeZone: {
      type: String,
      required: [true, 'Please provide a timezone'],
      default: 'UTC',
      trim: true,
    },
    online_ordering: {
      pickup: {
        type: Boolean,
        default: true,
      },
      delivery: {
        type: Boolean,
        default: true,
      },
    },
    opening: [
      {
        day_of_week: {
          type: String,
          required: true,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
        open_time: {
          type: String,
          required: true,
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format'],
        },
        close_time: {
          type: String,
          required: true,
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format'],
        },
        is_closed: {
          type: Boolean,
          default: false,
        },
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    // Keep existing fields for backward compatibility
    name: {
      type: String,
      maxlength: [100, 'Location name cannot be more than 100 characters'],
      trim: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    operatingHours: {
      monday: { open: String, close: String, closed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
      friday: { open: String, close: String, closed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, closed: { type: Boolean, default: false } },
    },
    // Deprecated - use business_id instead
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Middleware to filter out inactive locations by default
locationSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const Location = mongoose.model('Location', locationSchema);

export default Location;
