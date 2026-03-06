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
      {
        name:        "Create Lead",
        url:         "https://staging.konverthr.com/api/lead/create",
        method:      "POST",
        description: "Naya lead create karo CRM me",
        pricePerCall: 4,
        isDemo:      true,
        sampleBody: {
          email:          "priya@example.com",
          contact_name:   "Priya Shah",
          mobile_number:  "9123456780",
          subject:        "Need Payroll Services",
          is_from_kavach_services: true,
          is_from_konvert_hr:      false,
          company_name:   "Global Systems Ltd"
        },
        sampleResponse: {
          status:        "OK",
          message:       "Lead created successfully",
          assigned_tags: [12, 15]
        },
      },
      {
        name:        "User Signup",
        url:         "https://staging.konverthr.com/api/user/signup",
        method:      "POST",
        description: "Naya user register karo KonvertHR me",
        pricePerCall: 6,
        isDemo:      true,
        sampleBody: {
          name:         "John Doe",
          company_name: "ABC Pvt Ltd",
          gst_number:   "22AAAAA0000A1Z5",
          mobile:       "9876543210",
          email:        "john@example.com",
          designation:  "Manager",
          city:         "Bangalore",
          password:     "StrongPassword123",
          first_name:   "John",
          last_name:    "Doe"
        },
        sampleResponse: {
          status:  "OK",
          message: "User Is Registered, Email Sent",
          id:      45
        },
      },
      {
        name:        "KonvertHR Login",
        url:         "https://staging.konverthr.com/api/login",
        method:      "POST",
        description: "KonvertHR me login karo",
        pricePerCall: 2,
        isDemo:      true,
        sampleBody: {
          email:         "john@example.com",
          password:      "John@123",
          is_plan_login: true
        },
        sampleResponse: {
          status:  "OK",
          message: "Login successful",
          token:   "eyJhbGc..."
        },
      },
      {
        name:        "Get Random Jokes",
        url:         "https://official-joke-api.appspot.com/random_ten",
        method:      "GET",
        description: "10 random jokes lo — general aur programming",
        pricePerCall: 2,
        isDemo:      true,
        sampleBody:  null,
        sampleResponse: [
          {
            type:      "general",
            setup:     "What's brown and sticky?",
            punchline: "A stick.",
            id:        266
          },
          {
            type:      "programming",
            setup:     "Why did the developer quit his job?",
            punchline: "Because he didn't get arrays.",
            id:        408
          }
        ],
      },
      {
        name:        "Get Random Users",
        url:         "https://randomuser.me/api/?results=5",
        method:      "GET",
        description: "5 random users ki details lo — name, email, photo, location",
        pricePerCall: 3,
        isDemo:      true,
        sampleBody:  null,
        sampleResponse: {
          results: [
            {
              gender: "male",
              name:   { title: "Mr", first: "John", last: "Doe" },
              email:  "john.doe@example.com",
              phone:  "123-456-7890",
              picture: {
                large: "https://randomuser.me/api/portraits/men/40.jpg"
              }
            }
          ],
          info: { results: 5, page: 1 }
        },
      },
    ]);

    console.log("Demo APIs seeded ✅");
  } catch (err) {
    console.error("Demo API seed error ❌", err.message);
  }
};

module.exports = connectDB;