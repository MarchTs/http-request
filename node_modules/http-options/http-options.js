const md5 = require("md5");
class HttpOptions {
    constructor(method) {
        this.option = {
            method: method,
            headers: { "Content-Type": "application/json" }
        };
    }
    addUserID(userID) {
        this.option.headers = {
            ...this.option.headers,
            UserID: userID
        };
        return this;
    }
    addLanguage(language) {
        this.option.headers = {
            ...this.option.headers,
            Language: language
        };
        return this;
    }

    addContent(contentSize) {
        this.option.headers = {
            ...this.option.headers,
            "Content-Length": contentSize
        };
        return this;
    }

    addUserAgent(userAgent) {
        this.option.headers = {
            ...this.option.headers,
            "User-Agent": userAgent
        };
        return this;
    }

    addHeader(headers) {
        this.option.headers = {
            ...this.option.headers,
            ...headers
        };
        return this;
    }

    addTokenBarrer(token) {
        this.option.headers = {
            ...this.option.headers,
            Authorization: "Bearer " + token
        };
        return this;
    }

    addDigestHeader(username, password, relarm, path) {
        let nonce = new Date().toISOString();
        let ha1 = md5(`${username}:${relarm}:${password}`);
        let ha2 = md5(`${this.option.method}:${path}`);
        let digestResponse = md5(`${ha1}:${nonce}:${ha2}`);
        let digest = `username=\"${username}\", realm=\"${relarm}\", nonce=\"${nonce}\", uri=\"${path}\", algorithm="MD5", response=\"${digestResponse}\"`;

        this.option.headers = {
            ...this.option.headers,
            Authorization: "Digest " + digest
        };
        return this;
    }
}

module.exports = HttpOptions;
