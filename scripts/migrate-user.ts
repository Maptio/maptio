import * as request from "request-promise";
import * as fs from "fs";
import * as path from "path";
import { RequestOptions } from "https";


function getDatabaseUser(userId: string) {
    let options: request.RequestPromiseOptions = {
        method: "GET",
        headers: {
            authorization: `Bearer ${apiToken}`
        },
        json: true
    }

    return request.get(`http://localhost:3000/api/v1/user/${userId}`, options)
        .then(user => {
            return user;
        }, (error) => { throw new Error(error) })
        .catch(err => console.error(err))
}


function updateAuth0User(userId: string, user: any) {
    let options: request.RequestPromiseOptions = {
        method: "PATCH",
        headers: {
            authorization: `Bearer ${auth0Token}`
        },
        body: {
            user_metadata:
            {
                shortid: user.shortid,
                teams : user.teams
            },
            connection: "Username-Password-Authentication"
        },
        json:true

    }

    return request.patch(`https://login.maptio.com/api/v2/users/${userId}`, options)
        .then(user => {
            return user;
        }, (error) => { throw new Error(error) })
        .catch(err => console.error(err))

}


const userId = process.argv[2];
const apiToken = fs.readFileSync(path.resolve("scripts", "maptio.token"), "utf-8");
const auth0Token = fs.readFileSync(path.resolve("scripts", "auth0.token"), "utf-8");

console.log("USER ID: ", userId);
getDatabaseUser(userId).then(user => {
    return updateAuth0User(userId, user)
})
    .then(updatedUser => {
        console.log("updated", updatedUser)
    })