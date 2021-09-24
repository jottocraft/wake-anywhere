import generateErrorPage from "./generateErrorPage";

export default async function wakeDevice(event, url) {
    //Get all configurations
    let [wakeRequest, networks, devices] = await Promise.all([
        event.request.json(),
        wake_anywhere_conf.get("networks"),
        wake_anywhere_conf.get("devices")
    ]);

    //Parse as JSON
    networks = JSON.parse(networks), devices = JSON.parse(devices);

    //Get device and network configuration
    let device = devices[wakeRequest.id];
    let network = networks[device.network];

    //Pass to local network
    let response;
    if (url.host == "demo.wakeanywhere.com") {
        response = { status: 204 };
    } else {
        response = await fetch("https://" + network.dns + "/api/send-magic-packet", {
            method: "POST",
            headers: {
                "X-WakeAnywhere-Secret": network.secret,
                "X-WakeAnywhere-MAC": device.mac
            }
        });
    }

    if (response.status == 204) {
        //Device woken successfully
        device.lastWoken = new Date().getTime();

        //Stringify and store to KV
        var updatedDevicesString = JSON.stringify(devices);
        await wake_anywhere_conf.put("devices", updatedDevicesString);

        return new Response(updatedDevicesString, { status: 200, headers: { "Content-Type": "application/json" } });
    } else {
        return generateErrorPage(response.status, response.statusText);
    }
}