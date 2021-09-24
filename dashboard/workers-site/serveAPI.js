import generateErrorPage from "./generateErrorPage";

//Get existing dataset (set of networks or devices) from KV
async function getExistingData(name) {
    let existing = await wake_anywhere_conf.get(name);

    if (existing == null) {
        //Return empty object if there isn't anything in KV yet
        existing = {};
    } else {
        //Get and parse JSON
        existing = JSON.parse(existing);
    }

    return existing;
}

//Stringifys JSON into an exposed and redacted copy
function stringifyHideSecrets(dataset) {
    var exposed = JSON.stringify(dataset);
    return { redacted: exposed.replace(/\"secret\":\s*?\".*?\"/g, '"secret": ""'), exposed };
}

export default async function serveAPI(name, event, url) {
    const request = event.request;

    if (request.method == "GET") {
        //Get data
        let dataset = await getExistingData(name);
        let { redacted } = stringifyHideSecrets(dataset);

        //Serve redacted data
        return new Response(redacted, { status: 200, headers: { "Content-Type": "application/json" } });
    } else if (request.method == "PATCH") {
        //Get request data and existing data
        let data = await request.json();
        let dataset = await getExistingData(name);

        //Generate an ID for the item (a network or device) if it doesn't have one yet
        if (!data.id) data.id = new Date().getTime();

        //If secret is omitted, use existing
        if ((name == "networks") && !data.secret && dataset[data.id]) data.secret = dataset[data.id].secret;

        //Update data
        dataset[data.id] = data;
        let { redacted, exposed } = stringifyHideSecrets(dataset);

        //Store in KV
        if (url.host != "demo.wakeanywhere.com") await wake_anywhere_conf.put(name, exposed);
        return new Response(redacted, { status: 200, headers: { "Content-Type": "application/json" } });
    } else if (request.method == "DELETE") {
        //Get request data and existing data
        let data = await request.json();
        let dataset = await getExistingData(name);

        //Delete data
        delete dataset[data.id];
        let { redacted, exposed } = stringifyHideSecrets(dataset);

        //Store in KV
        if (url.host != "demo.wakeanywhere.com") await wake_anywhere_conf.put(name, exposed);
        return new Response(redacted, { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return generateErrorPage(400, "Invalid request");
}