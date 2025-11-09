# jsonauthtoken

jsonauthtoken is a JavaScript library to secure authentication.

## Overview

This project demonstrates the usage of the `jsonauthtoken` package to create and verify secure encrypted authentication tokens and store sensitive datas. Tokens are used to encrypt data for secure communication. The `jsonauthtoken` library provides methods to generate and verify tokens with configurable expiration times, encryption algorithms, payload data and also offer key generation.


## Node.js (Install)

Requirements:

- Node.js
- npm (Node.js package manager)

```bash
npm install jsonauthtoken
```

### Usage


```javascript
import { JAT } from "jsonauthtoken";

(async () => {
    
    const jat = JAT()

    const payload = {
        name: 'jsonauthtoken'
    } as const

    //to create token
    const token = await jat.create({ key: process.env.KEY }, payload)

    //to verify token
    const verify =await jat.verify<typeof payload>(token, process.env.KEY)

    console.log(verify)

})()

```
