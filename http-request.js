const HttpOption = require("http-options");
const https = require("https");
const http = require("http");

const request = (url, httpOption = HttpOption, response) => {
    if (typeof url !== "string") url = url.toString();
    const httpProtocol = url.split(":")[0] === "https" ? https : http;
    return httpProtocol.request(url, httpOption.option, res => {
        var chunks = [];

        res.on("data", function(chunk) {
            chunks.push(chunk);
        });

        res.on("end", chunk => {
            var body = Buffer.concat(chunks);
            try {
                body = JSON.parse(body.toString());
            } catch (ex) {}
            response({
                statusCode: res.statusCode,
                body: body
            });
        });

        res.on("error", error => {
            response({
                statusCode: 400,
                body: error
            });
        });
    });
};

// FIXME: using npm fetch to connect http request handle microservice?
module.exports = async (url, httpOption = HttpOption, requestBody) => {
    return new Promise((resolve, reject) => {
        try {
            process.on("uncaughtException", error => {
                resolve({
                    statusCode: 500,
                    body: {
                        message: "microservice server is ofline",
                        error: error
                    }
                });
            });

            const convertedBody = JSON.stringify({ ...requestBody });

            if (httpOption.option.method != "GET")
                httpOption.addContent(convertedBody.length);

            console.log("httpRequest", convertedBody);
            let req = request(url, httpOption, response => {
                //TODO: call third party log
                resolve(response);
            });

            if (httpOption.option.method != "GET") req.write(convertedBody);

            req.end();
        } catch (ex) {
            //TODO: call third party
            resolve({
                // TODO: log error : localhost:3001/
                statusCode: 500,
                body: { error: ex.message }
            });
        }
    });
};
