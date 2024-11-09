import crypto from 'crypto'
import decoading from './decoading.lib.js';

const signature = () => {

    const createSign = (algorithm, key, header, payload) => {
        const signature = crypto
            .createHmac(algorithm, key)
            .update(header + '.' + payload)
            .digest('base64url');
        return signature
    }

    const verifySign = (token,key) => {
        const [encodedHeader, encodedPayload, signature] = token.split('.');
        const header= decoading(encodedHeader)

        let newSign=createSign(header.algorithm, key, encodedHeader, encodedPayload)

        if(newSign == signature) return true
        else return false
    }
    return { createSign, verifySign }
}

export default signature