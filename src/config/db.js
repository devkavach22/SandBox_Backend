const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ✅");
    await createAdmin();
    await seedDemoApis();
  } catch (err) {
    console.error("MongoDB error ❌", err.message);
    process.exit(1);
  }
};

const createAdmin = async () => {
  try {
    const User = require("../modules/auth/auth.model");
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) return;
    await User.create({
      name:     "Admin",
      email:    "kavachadmin@gmail.com",
      password: "Kavach@#5467",
      role:     "admin",
    });
    console.log("Admin created ✅");
  } catch (err) {
    console.error("Admin create error ❌", err.message);
  }
};

const seedDemoApis = async () => {
  try {
    const Api = require("../modules/api/api.model");
    const count = await Api.countDocuments({ isDemo: true });
    if (count > 0) return; // Pehle se hain

    await Api.insertMany([
      {
        name:        "KonvertHR Auth",
        url:         "https://staging.konverthr.com/api/auth",
        method:      "POST",
        description: "KonvertHR me authenticate karo aur token lo",
        pricePerCall: 2,
        isDemo:      true,
        sampleBody: {
          user_name: "Komal"
        },
        sampleResponse: {
          status:  "success",
          token:   "4c16f70193749be219adb0ad6f9dd840",
          user_name: "Komal",
          message: "Existing valid token returned"
        },
      },
      {
        name:        "GST Number Verify",
        url:         "https://staging.konverthr.com/api/check_gstnumber",
        method:      "POST",
        description: "GST number valid hai ya nahi check karo — company details bhi milenge",
        pricePerCall: 5,
        isDemo:      true,
        sampleBody: {
          gst_number: "24AAACT2727Q1Z2"
        },
        sampleResponse: {
          status:  "ok",
          message: "Valid GST Number",
          company_details: [{
            name:     "TATA MOTORS PASSENGER VEHICLES LIMITED",
            city:     "Ahmedabad",
            state:    "Gujarat",
          }]
        },
      },
     ,
    ]);

    console.log("Demo APIs seeded ✅");
  } catch (err) {
    console.error("Demo API seed error ❌", err.message);
  }
};

module.exports = connectDB;