import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';
import generateErrorPage from "./generateErrorPage";

export default async function serveKV(event, url) {
    try {
        //Get data from KV
        const page = await getAssetFromKV(event, {
            mapRequestToAsset: (request, options) => {
                request = mapRequestToAsset(request, options);
                const parsedUrl = new URL(request.url);

                //Serve index.html for all HTML requests
                if (parsedUrl.pathname.endsWith('.html')) {
                    return new Request(`${parsedUrl.origin}/index.html`, request);
                } else {
                    return request;
                }
            }
        });

        //Construct Response
        const response = new Response(page.body, page);
        return response;
    } catch (e) {
        //Return 404
        return generateErrorPage(404, "Not Found");
    }
}