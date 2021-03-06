require("dotenv").config({ path: ".env" });

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Pusher = require("pusher");
const Datastore = require("nedb");

const app = express();

const db = new Datastore();

const pusher = new Pusher({
  appId: "1008518",
  key: "54e971bbd42f9cce65e9",
  secret: "6c5d8e2d753be76c38d8",
  cluster: "ap2",
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  db.find({}, (err, data) => {
    if (err) return res.status(500).send(err);

    res.json(data);
  });
});

app.post("/comment", (req, res) => {
  db.insert(Object.assign({}, req.body), (err, newComment) => {
    if (err) {
      return res.status(500).send(err);
    }

    pusher.trigger("comments", "new-comment", {
      comment: newComment,
    });

    res.status(200).send("OK");
  });
});

app.post("/vote", (req, res) => {
  const { id, vote } = req.body;
  db.findOne({ _id: id }, function (err, doc) {
    if (err) {
      return res.status(500).send(err);
    }

    db.update(
      { _id: id },
      { $set: { votes: doc.votes + vote } },
      { returnUpdatedDocs: true },
      (err, num, updatedDoc) => {
        if (err) return res.status(500).send(err);

        pusher.trigger("comments", "new-vote", {
          doc: updatedDoc,
        });
      }
    );
  });
});

app.set("port", process.env.PORT || 5000);
const server = app.listen(app.get("port"), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
