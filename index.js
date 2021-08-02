const express = require("express");
const axios = require("axios");
const redis = require("redis");
var crypto = require("crypto");

const app = express();

const redisPort = 6379;
const client = redis.createClient(redisPort);

client.on("error", err => {
  console.log(err);
});

app.get("/cache_n_call", (req, res) => {
  const endpoint = req.query.endpoint;

  try {
    client.get(endpoint, async (err, storedData) => {
      if (err) throw err;

      if (storedData) {
        res.status(200).send({
          jobs: JSON.parse(storedData),
          message: "cache hit",
        });
      } else {
        let response = await axios.get(endpoint);
        client.setex(endpoint, 600, JSON.stringify(response.data));
        res.status(200).send({
          data: response.data,
          message: "cache miss",
        });
      }
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Node server started");
});
