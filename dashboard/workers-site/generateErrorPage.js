export default function generateErrorPage(status, description, type = "fail") {
    //Generates an error page response
    return new Response(status + " " + description, { status });
}