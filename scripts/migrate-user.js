"use strict";
exports.__esModule = true;
var request = require("request-promise");
var fs = require("fs");
var userId = process.argv[2];
var apiToken = fs.readFileSync("./token", "utf-8");
function getDatabaseUser(userId) {
    var options = {
        url: "http://localhost:3000/api/v1/" + userId,
        headers: {
            authorization: "Bearer " + apiToken
        }
    };
    request(options).then(function (user) {
        console.log(user);
    });
}
console.log("USER ID: ", userId);
