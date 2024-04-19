/******************************************************************************
ITE5315 – Project
I declare that this assignment is my own work in accordance with Humber Academic Policy.
No part of this assignment has been copied manually or electronically from any other source
(including web sites) or distributed to other students.
Name: Subramanian Noorani Gopalakrishnan
Student ID: N01650018
Date: 10-04-2024
******************************************************************************/
require("dotenv").config();
const express = require("express");

const app = express();
const db = require("./config/db");
const bodyParser = require("body-parser");
const path = require("node:path");
const jwt = require("jsonwebtoken");

const { body, check, validationResult } = require("express-validator");

const { engine } = require("express-handlebars");
const handlebars = require("handlebars");

const port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", ".hbs");
app.use(express.static(path.join(__dirname, "public")));

function verifyToken(req, res, next) {
  const bearerHeadr = req.headers["authorization"];
  if (typeof bearerHeadr != "undefined") {
    const bearer = bearerHeadr.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    jwt.verify(req.token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        res.sendStatus(401);
        return;
      }
      console.log(decoded);
      next();
    });
  } else {
    res.sendStatus(401);
    return;
  }
}

app.post("/api/restaurants", verifyToken, async (req, res) => {
  try {
    const restaurant = await db.addNewRestaurant(req.body);
    console.log("restaurant added successfully");
    res.status(200).json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get(
  "/api/restaurants",
  [
    check("page").isNumeric(),
    check("perPage").isNumeric(),
    check("borough").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const page = req.query.page;
    const perPage = req.query.perPage;
    const borough = req.query.borough;
    try {
      const restaurants = await db.getAllRestaurants(page, perPage, borough);
      res.json(restaurants);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

app.get("/api/restaurants/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const restaurant = await db.getRestaurantById(id);
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: "Restaurant not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/restaurants/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const updatedRestaurant = await db.updateRestaurantById(data, id);
    if (updatedRestaurant) {
      console.log("restaurant updated successfully");
      res.json(updatedRestaurant);
    } else {
      res.status(404).json({ message: "Restaurant not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/restaurants/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.deleteRestaurantById(id);
    if (result) {
      res.json({ message: "Restaurant successfully deleted" });
    } else {
      res.status(404).json({ message: "Restaurant not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/search", async (req, res) => {
  res.render("search");
});

app.get("/restaurants/review/:id", async (req, res) => {
  const id = req.params.id;
  try {
    //console.log("restaurant id--", id);
    const restaurant = await db.getRestaurantById(id);
    if (restaurant) {
      res.render("review", { restaurant });
    } else {
      res.status(404).json({ message: "Restaurant not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/restaurants/review/:id", async (req, res) => {
  const restaurantId = req.params.id;
  const { rating, feedback } = req.body;

  if (!rating || !feedback) {
    return res
      .status(400)
      .json({ message: "Rating and feedback are mandatory" });
  }
  try {
    const result = await db.saveReview(restaurantId, rating, feedback);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post(
  "/search",
  [
    check("page").isNumeric(),
    check("perPage").isNumeric(),
    check("borough").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const page = req.body.page;
    const perPage = req.body.perPage;
    const borough = req.body.borough;

    try {
      const restaurants = await db.getAllRestaurants(page, perPage, borough);
      res.render("search", {
        restaurants,
        page,
        perPage,
        borough,
        showResults: true,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

app.post("/register", async (req, res) => {
  const { name, password } = req.body;
  const result = await db.registerUser(name, password);
  if (result.success) {
    res.json({ message: result.message });
  } else {
    res.status(400).json({ message: result.message });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await db.authenticateUser(username, password);
  if (result.success) {
    res.cookie("token", result.token);
    res.json({ message: result.message });
  } else {
    res.status(401).json({ message: result.message });
  }
});

db.initialize(process.env.DB_CONNECTION_STRING)
  .then(() => {
    console.log("connected to database");
    app.listen(port, () => {
      console.log(`Server started on port: ${port}`);
    });
  })
  .catch((e) => {
    console.log("Error in connecting to database");
    console.error(e);
  });
