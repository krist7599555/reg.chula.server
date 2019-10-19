import SimpleCrypto from "simple-crypto-js";
export default new SimpleCrypto(process.env.CRYPTO);
// var crypto = require("crypto");

// class Crypto {
//   // key = "sdfgh";
//   key;
//   constructor(key) {
//     this.key = key;
//   }
//   encrypt(data) {
//     var cipher = crypto.createCipher("aes-256-cbc", this.key);
//     var crypted = cipher.update(data, "utf-8", "hex");
//     crypted += cipher.final("hex");
//     return crypted;
//   }
//   decrypt(data) {
//     var decipher = crypto.createDecipher("aes-256-cbc", this.key);
//     var decrypted = decipher.update(data, "hex", "utf-8");
//     decrypted += decipher.final("utf-8");
//     return decrypted;
//   }
// }

// export default new Crypto(process.env.CRYPTO);
