# jsonauthtoken

jsonauthtoken is a JavaScript library to secure authentication.

## Overview

This project demonstrates the usage of the `jsonauthtoken` package to create and verify secure encrypted authentication tokens and store sensitive datas. Tokens are used to sign and encrypt data for secure communication. The `jsonauthtoken` library provides methods to generate and verify tokens with configurable expiration times, hashing algorithms, and payload data.


## Node.js (Install)

Requirements:

- Node.js
- npm (Node.js package manager)

```bash
npm install jsonauthtoken
```

### Usage

To create jsonauthtoken:

```javascript
import jat from "jsonauthtoken";

// Create a token
let encToken = jat().create(
    {
        signKey: process.env.SIGN_KEY, // Signature key
        encKey: process.env.ENC_KEY   // Encryption key
    },
    {
        expiresAt: '4MIN',            // Token expiration time
        algorithm: 'sha256'           // Optional: Hash algorithms list ['sha256', 'sha384', 'sha512'] 
    },
    {
        data: {                       // Data payload
            status: true,
            name:'Arpan Biswas'
            dob: '15.11.2008'
        }
    }
);

console.log("encToken: ", encToken);

```

To decrypt and verify jsonauthtoken:

```javascript
import jat from "jsonauthtoken";

// Decrypt and verify jsonauthtoken

let token = 'your-token-here';  // Replace with your generated token
let datas = jat().verify(token, {
    signKey: process.env.SIGN_KEY, // Signature key
    encKey: process.env.ENC_KEY    // Encryption key
});

console.log("Enc Data: ", datas);

```
