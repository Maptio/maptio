
var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
require('dotenv').config()
import * as chartsGeneration  from "./generate-charts";
var db = mongojs(process.env.MONGODB_URI, ['users']);


router.get('/make', function (req:any, res:any, next:any) {

    let svg = chartsGeneration.makeChart();
    res.send(svg);
    // let pattern = req.params.pattern;

    // db.users.find(
    //     { $or: [{ name: { $regex: pattern, $options: 'i' } }, { email: { $regex: pattern, $options: 'i' } }] }

    //     , function (err, users) {
    //         if (err) {
    //             res.send(err);
    //         } else {
    //             res.json(users);
    //         }
    //     });
});

export default router;