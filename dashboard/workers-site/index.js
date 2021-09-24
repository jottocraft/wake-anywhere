import generateErrorPage from "./generateErrorPage";
import serveAPI from "./serveAPI";
import serveKV from "./serveKV";
import wakeDevice from "./wakeDevice";

//Root fetch listener
addEventListener('fetch', event => {
  try {
    event.respondWith(appendHeaders(event));
  } catch (e) {
    event.respondWith(generateErrorPage(501, e.message || e.toString()));
  }
});

//Headers proxy
async function appendHeaders(event) {
  var response = await handleEvent(event);

  //headers to add to response
  var appendHeaders = {
    "X-jottocraft": "cfw",
    //This should probably be commented out in production
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,PATCH,DELETE,OPTIONS"
  };

  //Construct new headers
  var newHeaders = new Headers(response.headers);
  Object.keys(appendHeaders).map(function (name) {
    newHeaders.append(name, appendHeaders[name]);
  });

  //Create new response
  if (event.request.method == "OPTIONS") {
    response = new Response(null, { status: 204, headers: appendHeaders });
  } else {
    response = new Response(response.body, { ...response, headers: newHeaders });
  }

  return response;
}

//Handle request
async function handleEvent(event) {
  const url = new URL(event.request.url);

  if (url.pathname == "/api/networks") {
    //Serve networks API
    return await serveAPI("networks", event, url);
  } else if (url.pathname == "/api/devices") {
    //Serve devices API
    return await serveAPI("devices", event, url);
  } else if (url.pathname == "/api/devices/wake") {
    //Handle and forward Wake-On-LAN requests
    return await wakeDevice(event, url);
  } else {
    //Serve site assets from Cloudflare KV
    return await serveKV(event, url);
  }
}