import User from "../models/user.models.js";
import Message from "../models/message.models.js";
import cloudinary from "../utils/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req?.user?._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error at getUsersForSidebar!",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id } = req?.params;
    const senderId = req?.user?._id;
    const messages = await Message.find({
      $or: [
        { senderId, receiverId: id },
        { senderId: id, receiverId: senderId },
      ],
    });
    if (!messages) {
      return res.status(400).json({ message: "Messages not found!" });
    }
    res.status(200).json(messages);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error at getMessages!" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req?.body;
    const { id } = req?.params;
    const senderId = req?.user?._id;

    let imageUrl;
    if (image) {
      const res = await cloudinary.uploader.upload(image);
      imageUrl = res.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId: id,
      text,
      image: imageUrl,
    });

    if (!newMessage) {
      return res.status(400).json({ message: "Invalid message data!" });
    }

    await newMessage.save();

    // real time functionality here implement later

    res.status(201).json(newMessage);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error at sendMessage!" });
  }
};
