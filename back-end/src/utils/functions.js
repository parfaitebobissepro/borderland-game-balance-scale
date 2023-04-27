const CryptoJS = require("crypto-js");

class UtilFunctions {
    static generateUniqueString(sel) {
        const timestamp = new Date().getTime();
        const hash = CryptoJS.MD5(timestamp.toString() + sel).toString();
        return hash.substr(0, 16);
    }
}

module.exports = UtilFunctions;