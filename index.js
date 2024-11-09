import encoading from './lib/encoading.lib.js'
import decoading from './lib/decoading.lib.js'
import signature from './lib/signature.lib.js'
import encryption from './lib/encryption.lib.js'
import decryption from './lib/decryption.lib.js'
import { algoMatching, parseExpiration, isExpired } from './lib/functions.lib.js'

function jat() {


    const algorithms = ['sha256', 'sha384', 'sha512']

    /////////////////////---------------  create token  ---------------------/////////////////////////
    const create = (keys, headers = {}, payloads = {}) => {

        let {signKey, encKey} = keys
        if(!signKey) throw new Error("please provide signkey");
        if(!encKey) throw new Error("please provide encKey");
        

        let exp = ''
        if (headers.expiresAt) exp = parseExpiration(headers.expiresAt)
        else throw new Error("please provide token expire")

        let algo = algoMatching(algorithms, 'sha512', headers.algo)

        let header = encoading({
            token: 'JAT',
            algorithm: algo,
            createAt: Math.floor(Date.now() / 1000),
            expiresAt: exp,
        })

        if (typeof (payloads) != 'object') throw new Error("payload should be Object");
        let payload = encoading(payloads)

        let sign = signature().createSign(algo, signKey, header, payload)

        let token = header + '.' + payload + '.' + sign
        let encryptedToken = encryption(encKey, token)
        return encryptedToken
    }


    /////////////////////---------------  verify token  ---------------------/////////////////////////
    const verify = (encryptedToken, keys) => {
        let token = ''
        let header = ''
        let payload = ''

        let {signKey, encKey} = keys
        if(!signKey) throw new Error("please provide signkey");
        if(!encKey) throw new Error("please provide encKey");

        //decrypt token
        try {
            token = decryption(encryptedToken, encKey)
        } catch (error) {
            throw new Error('unable to decrypt token')
        }

        //verify token signature
        let isSignVerified = signature().verifySign(token, signKey)
        if (isSignVerified === false) {
            throw new Error('Invalid signature')
        }

        //
        const [encodedHeader, encodedPayload, sign] = token.split('.');

        header = decoading(encodedHeader)
        if(isExpired(header.expiresAt)) throw new Error('token is expired')

        payload = decoading(encodedPayload)

        return {header,payload}
    }
    return { create, verify }
}




export default jat
