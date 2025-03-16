import crypto from 'crypto'
import decoading from './decoading.lib.js';

const signature = () => {

    const createSign = (algorithm:string, key:string, header:string, payload:string) => {
        const signature = crypto
            .createHmac(algorithm, key)
            .update(header + '.' + payload)
            .digest('base64url');
        return signature
    }

    const verifySign = (tokens:DecryptedTokenParts,key:string):boolean => {
        const header= decoading(tokens.encodedHeader)

        let newSign=createSign(header.algorithm, key, tokens.encodedHeader, tokens.encodedPayload)

        if(newSign === tokens.sign) return true
        else return false
    }
    return { createSign, verifySign }
}

export default signature