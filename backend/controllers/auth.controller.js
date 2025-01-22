import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { User } from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerficationEmail, sendWelcomeEmail, sendForgotPasswordEmail, sendPasswordResetSuccessEmail } from "../mailtrap/emails.js";

export const signup = async(req, res) => {
  const { name, email, password } = req.body;

  try{
    if(!name || !email || !password) {
      throw new Error("Please fill all fields");  
    }

    const userAlreadyExists = await User.findOne({ email });
    console.log("userAlreadyExists", userAlreadyExists);
    if(userAlreadyExists) {
      return res.status(400).json({ success:false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      verificationToken,
      verificationExpire: Date.now() + 24 * 60 * 60 * 1000 //24hrs
     });

    await user.save();

    generateTokenAndSetCookie(res, user._id);

    await sendVerficationEmail(user.email, user.verificationToken);

    res.status(201).json({ 
      success: true, 
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined
      }
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export const verifyEmail = async(req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationExpire: { $gt: Date.now() }
    })
    if(!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({ 
      success: true, 
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined
      }
    });
  }
  catch (error) {
    console.log("Error verifying email", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export const login = async(req, res) => {
  try{
    const { email, password } = req.body;
    if(!email || !password) {
      throw new Error("Please fill all fields");
    }
    const user = await User.findOne({ email });
    if(!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined
      }
    });
  }
  catch (error) {
    console.log("Error logging in", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export const forgotPassword = async(req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if(!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetExpire = Date.now() + 1 * 60 * 60 * 1000; //1hr

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetExpire;

    await user.save();

    await sendForgotPasswordEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    res.status(200).json({ success: true, message: "Password reset email sent" });

  } catch (error) {
    console.log("Error forgetting password", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export const resetPassword = async(req, res) => {
  
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    })

    if(!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    //update password
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    await sendPasswordResetSuccessEmail(user.email);

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log("Error resetting password", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export const logout = async(req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
  console.log("Logged out successfully");
}

export const checkAuth = async(req, res) => {
  try{
    const user = await User.findById(req.user);
    if(!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error checking auth", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}