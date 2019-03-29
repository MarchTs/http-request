const HttpOption = require("@march_ts/http-option");
const https = require("https");
const http = require("http");

const request = (url, httpOption = HttpOption, response) => {
    const httpProtocol =
        url.toString().split(":")[0] === "https" ? https : http;
    if (typeof url !== "string") {
        url = url.toString();
    }
    return httpProtocol.request(url, httpOption.option, res => {
        var chunks = [];

        res.on("data", function(chunk) {
            chunks.push(chunk);
        });

        res.on("end", chunk => {
            var body = Buffer.concat(chunks);
            try {
                body = JSON.parse(body.toString());
            } catch (error) {
                body = body.toString();
            }
            response({
                statusCode: res.statusCode,
                body: body
            });
        });

        res.on("error", error => {
            throw error;
        });
    });
};

// FIXME: using npm fetch to connect http request handle microservice?
module.exports = async (url, httpOption = HttpOption, requestBody) => {
    return new Promise((resolve, reject) => {
        let startTimer = new Date();
        try {
            process.on("uncaughtException", error => {
                let response = {
                    statusCode: 503,
                    body: {
                        message: "server " + url.hostname + " is ofline",
                        error: error
                    },
                    duration: new Date() - startTimer
                };
                console.log("uncaughtException log: ", response);
                reject(response);
            });

            const convertedBody = JSON.stringify(requestBody);

            if (httpOption.option.method != "GET")
                httpOption.addContent(convertedBody.length);

            // console.log("httpRequest:", convertedBody, httpOption.option);
            let req = request(url, httpOption, response => {
                response.duration = new Date() - startTimer;
                // console.log("response", response);

                resolve(response);
            });

            if (httpOption.option.method != "GET") req.write(convertedBody);

            req.end();
        } catch (ex) {
            let response = {
                statusCode: 500,
                body: { message: "unexpected cause", error: ex.message },
                duration: new Date() - startTimer
            };
            console.log(
                "\nerror response from " + url.toString() + " : \n",
                response
            );
            reject(response);
        }
    });
};
