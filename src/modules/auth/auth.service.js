// const User = require("./auth.model");
// const jwt = require("jsonwebtoken");

// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

// const generateToken = (userId, role) => {
//     return jwt.sign(
//         { id: userId, role },
//         process.env.JWT_SECRET,
//         { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
//     );
// };

// // ── Register ──
// const registerService = async ({ name, email, password, phone, avatar }) => { // ← avatar add kiya

//     if (email.toLowerCase() === "kavachadmin@gmail.com") {
//         throw { status: 403, message: "Admin registration not allowed" };
//     }

//     if (!phone) {
//         throw { status: 400, message: "Phone number required" };
//     }
//     if (!/^[6-9]\d{9}$/.test(phone)) {
//         throw { status: 400, message: "Invalid phone number — must be 10 digit valid Indian number" };
//     }

//     const exists = await User.findOne({ email: email.toLowerCase() });
//     if (exists) throw { status: 409, message: "Email already registered" };

//     const user = await User.create({
//         name,
//         email: email.toLowerCase(),
//         password,
//         phone,
//         avatar: avatar || null,  // ← avatar save karo
//         role: "customer",
//     });

//     const token = generateToken(user._id, user.role);

//     return {
//         user: {
//             id: user._id,
//             name: user.name,
//             email: user.email,
//             phone: user.phone,
//             role: user.role,
//             balance: user.balance,
//             avatar: user.avatar,  // ← response me bhi do
//         },
//     };
// };

// // ── Login ──
// const loginService = async ({ email, password }) => {
//     const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
//     if (!user) throw { status: 401, message: "Invalid email or password" };

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) throw { status: 401, message: "Invalid email or password" };

//     const token = generateToken(user._id, user.role);

//     return {
//         token,
//         user: {
//             id: user._id,
//             name: user.name,
//             client_id: user.client_id,

//             email: user.email,
//             phone: user.phone,
//             role: user.role,
//             balance: user.balance,
//             avatar: user.avatar,
//         },
//     };
// };

// module.exports = { registerService, loginService };




const User = require("./auth.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ── NODEMAILER CONFIGURATION ──
// Ye transporter user ko email bhejega. 
// .env file mein EMAIL_USER aur EMAIL_PASS (App Password) hona zaroori hai.
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASSWORD  
    }
});

// ── TOKEN GENERATOR ──
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

// ── REGISTER SERVICE ──
const registerService = async ({ name, email, password, phone, avatar }) => {
    if (email.toLowerCase() === "kavachadmin@gmail.com") {
        throw { status: 403, message: "Admin registration not allowed" };
    }

    if (!phone) {
        throw { status: 400, message: "Phone number required" };
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
        throw { status: 400, message: "Invalid phone number — must be 10 digit valid Indian number" };
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) throw { status: 409, message: "Email already registered" };

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone,
        avatar: avatar || null,
        role: "customer",
    });

    const token = generateToken(user._id, user.role);

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            balance: user.balance,
            avatar: user.avatar,
        },
    };
};

// ── LOGIN SERVICE ──
const loginService = async ({ email, password }) => {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) throw { status: 401, message: "Invalid email or password" };

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw { status: 401, message: "Invalid email or password" };

    const token = generateToken(user._id, user.role);

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            client_id: user.client_id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            balance: user.balance,
            avatar: user.avatar,
        },
    };
};

// ── FORGOT PASSWORD SERVICE (SEND EMAIL) ──
const forgotPasswordService = async (email) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw { status: 404, message: "User with this email does not exist" };

    // 1. Generate 6-char random code
    const tempPassword = crypto.randomBytes(3).toString("hex").toUpperCase();

    // 2. Save to DB with 15 mins expiry
    user.tempPassword = tempPassword;
    user.tempPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // 3. Send Styled Email
    await transporter.sendMail({
        from: `"SandboxHub Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "CRITICAL: Temporary Access Key Requested",
        html: `
        <div style="background-color: #020b08; color: #e8fff6; font-family: sans-serif; padding: 40px; border-radius: 12px; border: 1px solid #0d3324; max-width: 500px; margin: auto;">
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="display: inline-block; background-color: #00ffb4; padding: 8px 16px; border-radius: 4px; color: #020b08; font-weight: 900; font-size: 18px;">
                    SANDBOX HUB
                </div>
            </div>
            <h2 style="color: #e8fff6; text-align: center; font-size: 16px; text-transform: uppercase;">Security Override Protocol</h2>
            <p style="font-size: 13px; text-align: center; color: #5a8a70;">Use the temporary key below to reset your terminal access.</p>
            
            <div style="background: #071a12; border: 1px dashed #00ffb4; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px;">
                <span style="font-size: 32px; font-weight: bold; color: #00ffb4; letter-spacing: 6px;">
                    ${tempPassword}
                </span>
            </div>

            <p style="font-size: 11px; color: #3a5a4a; text-align: center;">This key expires in 15 minutes. If you didn't request this, ignore this message.</p>
        </div>
        `
    });

    return { message: "Security code dispatched to your terminal." };
};

// ── RESET PASSWORD SERVICE (VERIFY & UPDATE) ──
const resetPasswordService = async ({ email, tempPassword, newPassword }) => {
    // Select hidden fields for verification
    const user = await User.findOne({ email: email.toLowerCase() })
        .select("+tempPassword +tempPasswordExpires");
    
    if (!user) {
        throw { status: 404, message: "User not found" };
    }

    // Check code and expiry
    if (!user.tempPassword || user.tempPassword !== tempPassword) {
        throw { status: 401, message: "Invalid temporary security key" };
    }

    if (user.tempPasswordExpires < Date.now()) {
        throw { status: 401, message: "Security key has expired" };
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    
    // Clear temp fields
    user.tempPassword = undefined;
    user.tempPasswordExpires = undefined;

    await user.save();

    return { message: "Security protocol updated. Password changed." };
};

module.exports = { 
    registerService, 
    loginService, 
    forgotPasswordService, 
    resetPasswordService 
};