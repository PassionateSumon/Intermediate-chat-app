import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/utils.js";
import cloudinary from "../utils/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req?.body;
  console.log( fullName, email, password )

  try {
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "All fields are required!" });
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (!newUser) {
      return res.status(400).json({ message: "Invalid user data!" });
    }

    generateToken(newUser._id, res);
    await newUser.save();
    return res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error at signup!" });
  }
};
export const login = async (req, res) => {
  const { email, password } = req?.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const isMatched = await bcrypt.compare(hashedPassword, user.password);

    if (!isMatched)
      return res.status(400).json({ message: "Password is incorrect!" });

    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({
      message: "INternal server error at login!",
    });
  }
};
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    return res.status(200).json({
      message: "Logged out successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error at logout catch!",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req?.body;
    const userId = req?.user?._id;
    if (!profilePic) {
      return res.status(400).json({
        message: "Profile picture is needed!",
      });
    }

    const res = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: res.secure_url },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({
        message: "User not found!",
      });
    }

    return res.status(200).json({
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error at update profile!",
    });
  }
};

export const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error at catch check!",
    });
  }
};
