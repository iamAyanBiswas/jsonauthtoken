import encoading from './lib/encoading.lib'
import decoading from './lib/decoading.lib'
import signature from './lib/signature.lib'
import encryption from './lib/encryption.lib'
import decryption from './lib/decryption.lib'
import { algoMatching, parseExpiration, isExpired } from './lib/functions.lib'

//global variable 
const algorithms: AlgorithmArray = ['sha256', 'sha384', 'sha512']

function jat() {



    /////////////////////---------------  create token  ---------------------/////////////////////////
    const create = (keys: KeysType, headers:HeaderForCreate = {}, payloads: any = {}):string => {

        let { signKey, encKey } = keys
        if (!signKey) throw new Error("please provide signkey");
        if (!encKey) throw new Error("please provide encKey");

        let exp: number
        if (headers.expiresAt) exp = parseExpiration(headers.expiresAt)
        else throw new Error("please provide token expire")

        let algo = algoMatching(algorithms, 'sha512', headers.algorithm)

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
    const verify = (encryptedToken:string, keys:KeysType):HeaderAndPlayload => {
        let token = ''
        let header:TokenHeaders
        let payload = ''

        let { signKey, encKey } = keys
        if (!signKey) throw new Error("please provide signkey");
        if (!encKey) throw new Error("please provide encKey");

        //decrypt token
        try {
            token = decryption(encryptedToken, encKey)
        } catch (error) {
            throw new Error('unable to decrypt token')
        }

        const [encodedHeader, encodedPayload, sign] = token.split('.');

        //verify token signature
        let isSignVerified = signature().verifySign({encodedHeader, encodedPayload, sign}, signKey)
        if (isSignVerified === false) {
            throw new Error('Invalid signature')
        }

        //
        header = decoading(encodedHeader)
        if (isExpired(header.expiresAt)) throw new Error('token is expired')

        payload = decoading(encodedPayload)

        return { header, payload }
    }
    return { create, verify }
}




export default jat
