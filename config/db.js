/******************************************************************************
ITE5315 – Project
I declare that this assignment is my own work in accordance with Humber Academic Policy.
No part of this assignment has been copied manually or electronically from any other source
(including web sites) or distributed to other students.
Name: Subramanian Noorani Gopalakrishnan
Student ID: N01650018
Date: 10-04-2024
******************************************************************************/
const mongoose = require("mongoose");
const restaurantSchema = require("../models/restaurant");
const userSchema = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Schema = mongoose.Schema;
let Restaurant;
let User;

const initialize = async (url) => {
  mongoose.connect(url);
  Restaurant = mongoose.model("restaurants", restaurantSchema, "restaurants");
  User = mongoose.model("users", userSchema, "users");
};

const addNewRestaurant = async (data) => {
  try {
    const newRestaurant = new Restaurant(data);
    await newRestaurant.save();
    console.log("New restaurant added successfully:", newRestaurant);
    return newRestaurant;
  } catch (reason) {
    console.error("Error adding new restaurant:", error);
    throw error;
  }
};

const getAllRestaurants = async (page, perPage, borough = null) => {
  try {
    let query = {};
    if (borough) {
      query.borough = borough;
    }

    const restaurants = await Restaurant.find(query)
      .sort("restaurant_id")
      .skip((page - 1) * perPage)
      .limit(perPage);

    return restaurants;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
};

const getRestaurantById = async (Id) => {
  try {
    const restaurant = await Restaurant.findById(Id);
    return restaurant;
  } catch (error) {
    console.error("Error fetching restaurant by id:", error);
    throw error;
  }
};

const updateRestaurantById = async (data, Id) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(Id, data, {
      new: true,
    });
    return restaurant;
  } catch (error) {
    console.error("Error in updating restaurant", error);
    throw error;
  }
};

const deleteRestaurantById = async (Id) => {
  try {
    const result = await Restaurant.findByIdAndDelete(Id);
    return result;
  } catch (error) {
    console.error("Error in deleting restaurant", error);
    throw error;
  }
};

const registerUser = async (name, password) => {
  try {
    const existingUser = await User.findOne({ name: name });
    if (existingUser) {
      return { message: "Username already exists", success: false };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      password: hashedPassword,
    });
    await newUser.save();
    return { message: "User registered successfully", success: true };
  } catch (error) {
    console.error("Error while registering user -- ", error);
    return {
      message: "An error occurred while registering new user",
      success: false,
    };
  }
};

const authenticateUser = async (name, password) => {
  try {
    const user = await User.findOne({ name });
    if (!user) {
      return { success: false, message: "User not found" };
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return { success: false, message: "Incorrect password" };
    }
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    return {
      success: true,
      token: token,
      message: "User Authenticated successfully",
    };
  } catch (error) {
    console.error("Error in authenticating user:", error);
    return { success: false, message: "Error in authenticating uer" };
  }
};

const saveReview = async (restaurantId, rating, feedback) => {
  try {
    const review = `${rating} - ${feedback}`;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }
    restaurant.reviews.push(review);
    await restaurant.save();
    return { message: "Review saved successfully" };
  } catch (error) {
    console.error("Error saving review:", error);
    throw new Error("Failed to save review");
  }
};

module.exports = {
  initialize,
  addNewRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantById,
  deleteRestaurantById,
  registerUser,
  authenticateUser,
  saveReview,
};
