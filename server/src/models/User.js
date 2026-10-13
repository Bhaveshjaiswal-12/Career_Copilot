import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password by default
    },
    profile: {
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      headline: { type: String, default: '' },
      summary: { type: String, default: '' },
      preferredRole: { type: String, default: '' },
      targetLocations: [{ type: String }],
      workMode: { type: String, enum: ['any', 'remote', 'hybrid', 'on-site'], default: 'any' },
      experienceLevel: { type: String, enum: ['any', 'entry', 'mid', 'senior', 'lead', 'executive'], default: 'any' },
      employmentType: { type: String, enum: ['any', 'full-time', 'part-time', 'contract', 'internship'], default: 'any' },
      minSalary: { type: Number, default: 0 },
      skills: [{ type: String }],
      education: [
        {
          institution: String,
          degree: String,
          field: String,
          startDate: String,
          endDate: String,
          description: String,
        },
      ],
      experience: [
        {
          company: String,
          position: String,
          location: String,
          startDate: String,
          endDate: String,
          current: { type: Boolean, default: false },
          description: String,
          highlights: [String],
        },
      ],
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
          url: String,
          github: String,
        },
      ],
      certifications: [
        {
          name: String,
          issuer: String,
          date: String,
          url: String,
        },
      ],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
