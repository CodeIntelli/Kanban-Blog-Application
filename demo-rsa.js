// const NodeRSA = require("node-rsa");
// const key = new NodeRSA({ b: 512 });

// const text = [
//   {
//     image: {
//       public_id: 'userProfileImage/tzsmxrevyes1xsuyujlk',
//       url: 'https://res.cloudinary.com/dm3gs2s0h/image/upload/v1650136405/userProfileImage/tzsmxrevyes1xsuyujlk.png'
//     },
//     _id: new ObjectId("62780b156711cd94477177cf"),
//     name: 'demo title',
//     description: 'Mahadev',
//     status: true,
//     publish: true,
//     publishAt: "2022-05-08T18:25:25.850Z",
//     createdBy: new ObjectId("625b213b496e092403732d2e"),
//     createdAt: "2022-05-08T18:25:25.867Z",
//     updatedAt: "2022-05-08T18:25:25.867Z",
//     __v: 0
//   }
// ];
// const encrypted = key.encrypt(text, "base64");
// console.log("encrypted: ", encrypted);
// const decrypted = key.decrypt(encrypted, "utf8");
// console.log("decrypted: ", decrypted);

// crypto module
const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const initVector = crypto.randomBytes(16);
const message = "This is a secret message";
const Securitykey = crypto.randomBytes(32);
const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
let encryptedData = cipher.update(message, "utf-8", "hex");
encryptedData += cipher.final("hex");
console.log("Encrypted message: " + encryptedData);
const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
decryptedData += decipher.final("utf8");
console.log("Decrypted message: " + decryptedData);
