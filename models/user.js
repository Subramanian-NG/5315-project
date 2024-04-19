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
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  password: String,
});

module.exports = userSchema;
