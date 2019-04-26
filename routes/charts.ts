
var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
require('dotenv').config()
import * as chartsGeneration  from "./generate-charts";
var db = mongojs(process.env.MONGODB_URI, ['users']);


// router.get('/make', function (req:any, res:any, next:any) {
// console.log("make chart")
//     let svg = chartsGeneration.makeChart({});
//     res.send(svg);
//     // let pattern = req.params.pattern;

//     // db.users.find(
//     //     { $or: [{ name: { $regex: pattern, $options: 'i' } }, { email: { $regex: pattern, $options: 'i' } }] }

//     //     , function (err, users) {
//     //         if (err) {
//     //             res.send(err);
//     //         } else {
//     //             res.json(users);
//     //         }
//     //     });
// });

router.post('/make', function (req:any, res:any, next:any) {
    let data = req.body.initiative;
    let color = req.body.color;
    let width = req.body.width;
    let diameter = req.body.diameter;
    // console.log("make chart")
        let svg = chartsGeneration.makeChart(data, color, diameter, width);
        res.send(svg);
    });

export default router;