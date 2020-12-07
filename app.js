const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const userRoutes = require("./routes");

app.use(bodyParser.json());

app.use(userRoutes);

app.get("/", (req, res) => {
    return res.json("Start with /users");
});

app.listen(3000, () => {
    console.log("Go to http://localhost:3000");
});