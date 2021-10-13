var express = require('express');
var router = express.Router();
var cors = require('cors');
var mongojs = require('mongojs');
const getDepth = require("./traverse");
require('dotenv').config()
var db = mongojs(process.env.MONGODB_URI, ['datasets']);

const corsOptions = {
  origin: process.env.CORS_WHITELIST_EMBEDABBLE_APP_URL,
}

/* GET One dataset with the provided ID as long as it is marked as embeddable */
router.get('/:id', cors(corsOptions), function (req, res, next) {
    db.datasets.findOne(
        { _id: mongojs.ObjectId(req.params.id) },
        function (err, datasets) {
            if (err) {
                res.send(err);
            } else if (!datasets) {
                console.error('[ERROR] Could not find dataset with id:', req.params.id);
                res.status(404).send('The requested map does not exist or it is not shared publicly.');
            } else {
                if (datasets.isEmbeddable) {
                  datasets.depth = getDepth(datasets)
                  res.json(datasets);
                } else {
                  res.status(404).send('The requested map does not exist or it is not shared publicly.');
                }
            }
        });
});

module.exports = router;
