const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require('body-parser');
const wol = require("wol");

const app = express();
const port = 8667;

//Random string generator
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

//Get secret path
const SECRET_PATH = path.join(__dirname, "secret");

//Get secret
var secret;
if (fs.existsSync(SECRET_PATH)) {
    secret = String(fs.readFileSync(SECRET_PATH));
} else {
    secret = makeid(60);
    console.log("Generated secret (first run)");
    fs.writeFile(SECRET_PATH, secret, function (err) {
        if (err) {
            console.log("An error occured when trying to store the secret. Please make sure that this script has the permissions needed to read and write files next to itself and try again.");
        }
    });
}

//Read body as JSON
app.use(bodyParser.json());

app.get('/', (req, res) => {
    if (!secret) return res.status(503).send("This Wake Anywhere controller does not have a working secret");
    return res.status(200).send("Wake Anywhere controller OK");
});

app.post('/api/send-magic-packet', (req, res) => {
    let providedSecret = req.get('X-WakeAnywhere-Secret');
    let targetMAC = req.get('X-WakeAnywhere-MAC');
    
    //Log request
    console.log("Got wake request for", targetMAC);

    //Check that request is valid
    if (!secret) return res.sendStatus(503);
    if (!targetMAC) return res.sendStatus(400);
    if (!providedSecret) return res.sendStatus(401);
    if (secret != providedSecret) return res.sendStatus(403);

    //Try waking target
    wol.wake(targetMAC, function (err, result) {
        if (err || !result) {
            //Catch errors
            console.log("Wake-On-LAN error: ", err);
            res.sendStatus(500);
        }

        res.sendStatus(204);
    });
});

//Start express server
app.listen(port, () => {
    console.log(`Wake Anywhere controller listening on port ${port}`);
});