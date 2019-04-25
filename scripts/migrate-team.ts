import * as request from "request-promise";
import * as fs from "fs";
import * as path from "path";
import { RequestOptions } from "https";


function getTeamMembersIds(teamId: string) {
    let options: request.RequestPromiseOptions = {
        method: "GET",
        headers: {
            authorization: `Bearer ${apiToken}`
        },
        json: true
    }

    return request.get(`http://localhost:3000/api/v1/team/${teamId}`, options)
        .then(team => {
            return team.members.map((m: any) => m.user_id);
        }, (error) => { throw new Error(error) })
        .catch(err => console.error(err))
}

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
}


function updateAuth0User(userId: string, user: any) {
    console.log(`    Updating...`)
    let options: request.RequestPromiseOptions = {
        method: "PATCH",
        headers: {
            authorization: `Bearer ${auth0Token}`
        },
        body: {
            user_metadata:
            {
                shortid: user.shortid,
                teams: user.teams
            },
            connection: "Username-Password-Authentication"
        },
        json: true

    }

    return request.patch(`https://login.maptio.com/api/v2/users/${userId}`, options)
        .then(user => {
            console.log(`    Updated with shortId:${user.user_metadata.shortid} and ${user.user_metadata.teams.length} teams`)
            return user;
        }, (error) => {
            console.error(`     !!!!! Cannot update ${userId}`)
        })

}

function retrieveAndUpdate(id: string) {
    return getDatabaseUser(id)
        .then(u => {
            console.log("    Retrieving ...");
            return u;
        })
        .then((u: any) => {
            return updateAuth0User(u.user_id, u)
        })
        .then(user => {

        });
}


function retrieveAndUpdateUsers(arr: string[]) {
    return arr.reduce((promise, item, index) => {
        return promise
            .then((result: any) => {

                console.log(`${index+1}. User Id ${item}`);
                return retrieveAndUpdate(item).then(result => final.push(result));
            })
            .catch(console.error);
    }, Promise.resolve());
}

const teamId = process.argv[2];
const apiToken = fs.readFileSync(path.resolve("scripts", "maptio.token"), "utf-8");
const auth0Token = fs.readFileSync(path.resolve("scripts", "auth0.token"), "utf-8");
let final = [];

console.log(`Updating team ${teamId} ...`);
getTeamMembersIds(teamId).then((userIds: string[]) => {
    console.log(`${userIds.length} members`);

    return retrieveAndUpdateUsers(userIds)

})


