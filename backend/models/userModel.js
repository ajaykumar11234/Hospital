import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: "https://img.favpng.com/12/22/15/person-icon-png-favpng-3qfAUXKk4BC2zas4D2cC3HkKb.jpg" },
  address: { type: Object, default:{line1:'',line2:''} },
  gender: { type: String, default: "-" },
  dob: { type: String, default: "-" },
  phone: { type: String, default: "-" }
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
