import { NodeRuntime, JsonAuthTokenExpiry, RuntimeWiseAlgorithmMap, GenerateKeyPair } from '../types';

import { NODE_RUNTIME } from './config/name.config'
import { RUNTIME_DEFAULT_ALGORITHM, SUPPORTED_ALGORITHM } from './config/algo.config'
import { isExpired, print, tokenFormatVerify } from './lib/functions.lib'
import { jatTimeFormatter } from './lib/timeformat'
import { WebCrypto } from './runtime/web.runtime'
import { NodeCrypto } from './runtime/node.runtime'




export class NodeCryptoModule<R extends NodeRuntime> {
    private dev: boolean = false
    private runtime: R
    private web = new WebCrypto()
    private node = new NodeCrypto()

    constructor({ runtime, dev }: { dev?: boolean, runtime?: R } = {}) {
        try {
            if (dev) this.dev = true
            if (runtime) {
                if (runtime && !NODE_RUNTIME.includes(runtime)) {
                    throw new Error("Unsupported runtime")
                }
                this.runtime = runtime
            }
            else {
                this.runtime = 'web' as R
            }
            print({ dev: this.dev }, 'Current Runtime: ', this.runtime)

        } catch (error) {
            print({ dev: this.dev, color: 'red' }, error)
            throw error
        }
    }

    private async createToken(algo: string, key: string, payload: any, exp: number) {
        const algorithms = SUPPORTED_ALGORITHM[this.runtime]
        const algoData = algorithms.find(({ name }) => { return name == algo })
        6
        if (!algoData) {
            throw new Error(`Algorithm ${algo} is not supported for ${this.runtime}`)
        }

        //web runtime
        if (this.runtime === 'web') {

            //web asymmetric encryption
            if (algoData.type === 'asymmetric') {
                if (algoData.value !== 'RSA+AES-GCM') {
                    throw new Error(`Algorithm ${algoData.name} is not supported for asymmetric encryption`)
                }
                return await this.web.encryptRSA(payload, key, exp)
            }

            //web symmetric encryption
            else {
                if (algoData.value !== 'AES-GCM') {
                    throw new Error(`Algorithm ${algoData.name} is not supported for symmetric encryption`)
                }
                return await this.web.encrypt(algoData.value, key, payload, exp)
            }
        }
        else {
            //node asymmetric encryption
            if (algoData.type === 'asymmetric') {
                if (algoData.value !== 'rsa+a256gcm') {
                    throw new Error(`Algorithm ${algoData.name} is not supported for asymmetric encryption`)
                }
                return await this.node.encryptRSA(payload, key, exp)
            }

            //node symmetric encryption
            else {
                if (algoData.value !== 'aes-256-gcm') {
                    throw new Error(`Algorithm ${algoData.name} is not supported for symmetric encryption`)
                }
                return await this.node.encrypt(algoData.value, key, payload, exp)
            }
        }
    }

    private async verifyToken<T>(token: string, key: string) {
        const { meta, encrypted } = tokenFormatVerify(this.runtime, token)
        const { runtime, algo, type, v, iv, tag, encryptedKey } = meta

        if (this.runtime !== runtime) {
            throw new Error('Runtime not matching')
        }

        //web runtime
        if (runtime === 'web') {
            //web asymmetric encryption
            if (type === 'asymmetric') {
                if (algo !== 'RSA+AES-GCM') {
                    throw new Error(`Algorithm ${algo} is not supported for asymmetric encryption`)
                }
                return await this.web.decryptRSA<T>(key, encryptedKey, { iv, encrypted })
            }

            //web symmetric encryption
            else {
                if (algo !== 'AES-GCM') {
                    throw new Error(`Algorithm ${algo} is not supported for symmetric encryption`)
                }
                return await this.web.decrypt<T>('AES-GCM', key, { iv, encrypted })
            }
        }
        else {
            //node asymmetric encryption
            if (type === 'asymmetric') {
                if (algo !== 'RSA+A256GCM') {
                    throw new Error(`Algorithm ${algo} is not supported for asymmetric encryption`)
                }
                return await this.node.decryptRSA<T>(key, encryptedKey, { iv, encrypted, tag })
            }

            //node symmetric encryption
            else {
                if (algo !== 'AES-256-GCM') {
                    throw new Error(`Algorithm ${algo} is not supported for symmetric encryption`)
                }
                return await this.node.decrypt<T>('aes-256-gcm', key, { iv, encrypted, tag })
            }
        }

    }


    public async create({ key, exp, algo }: { key: string, exp: JsonAuthTokenExpiry, algo: RuntimeWiseAlgorithmMap[R] }, payload: any) {

        try {
            if (!key) {
                throw new Error('key is required to create token')
            }

            exp = exp ? jatTimeFormatter(exp) : jatTimeFormatter('5MIN')
            const algorithm = algo || RUNTIME_DEFAULT_ALGORITHM('web').name

            return await this.createToken(algo, key, payload, exp)

        } catch (error) {
            print({ dev: this.dev, color: 'red' }, error)
            throw error
        }

    }

    public async verify<T>(token: string, key: string): Promise<T> {
        try {
            if (!token) {
                throw new Error('Token is required to verify token')
            }
            if (!key) {
                throw new Error('key is required to verify token')
            }
            const unfilterPayload = await this.verifyToken<T>(token, key)
            if (isExpired(unfilterPayload.exp)) {
                throw new Error('Token expired')
            }
            return unfilterPayload.payload
        } catch (error) {
            print({ dev: this.dev, color: 'red' }, error)
            throw error
        }
    }


}

class PrivatePublicKeyGeneration {
    private web = new WebCrypto()
    private node = new NodeCrypto()

    public async generateKeyPair(runtime?: 'web' | 'node', dev?: boolean): Promise<GenerateKeyPair> {
        let finalRuntime: 'web' | 'node' = 'web'
        const development = dev === true ? true : false
        try {
            if (runtime) {
                if (!NODE_RUNTIME.includes(runtime)) {
                    throw new Error("Unsupported runtime")
                }
                finalRuntime = runtime
            }

            print({ dev: development, color: 'green' }, 'Current Runtime for Key Generation: ', finalRuntime)

            if (runtime === 'node') {
                const { privateKey, publicKey } = await this.node.rsaPrivatePublicKeyGeneration()
                print({ dev: development, color: 'green' }, { privateKey, publicKey })
                return { privateKey, publicKey }
            }
            else {
                const { privateKey, publicKey } = await this.web.rsaPrivatePublicKeyGeneration()
                print({ dev: development, color: 'green' }, { privateKey, publicKey })
                return { privateKey, publicKey }
            }

        } catch (error) {
            print({ dev: development, color: 'red' }, error)
            throw error
        }
    }

    public async generatePublicKey(privateKeyPem: string, runtime?: 'web' | 'node', dev?: boolean): Promise<string> {
        let finalRuntime: 'web' | 'node' = 'web'
        const development = dev === true ? true : false
        try {
            if (runtime) {
                if (!NODE_RUNTIME.includes(runtime)) {
                    throw new Error("Unsupported runtime (please select runtime 'web' or 'node')")
                }
                finalRuntime = runtime
            }
            print({ dev: development, color: 'green' }, 'Current Runtime for Key Generation: ', finalRuntime)
            if (runtime === 'node') {
                const publicKey = await this.node.rsaPublicKeyGeneration(privateKeyPem)
                print({ dev: development, color: 'green' }, publicKey)
                return publicKey
            }
            else {
                const publicKey = await this.web.rsaPublicKeyGeneration(privateKeyPem)
                print({ dev: development, color: 'green' }, publicKey)
                return publicKey
            }

        } catch (error) {
            print({ dev: development, color: 'red' }, error)
            throw error
        }
    }
}

const p2kgObject = new PrivatePublicKeyGeneration()
const generateKeyPair = (options?: { runtime?: 'web' | 'node'; dev?: boolean }) => {
    const { runtime, dev } = options || {};
    return p2kgObject.generateKeyPair(runtime, dev);
};
const generatePublicKey = (privateKeyPem: string, options?: { runtime?: 'web' | 'node'; dev?: boolean }) => {
    const { runtime, dev } = options || {};
    return p2kgObject.generatePublicKey(privateKeyPem, runtime, dev);
};

export const JAT = <R extends NodeRuntime>({ runtime, dev }: { runtime?: R, dev?: boolean } = {}) => new NodeCryptoModule({ runtime: runtime, dev: dev })



export const P2KG = {
    generateKeyPair: generateKeyPair,
    generatePublicKey: generatePublicKey
}

const jsonauthtoken = {
    JAT: JAT,
    P2KG: P2KG
}
export default jsonauthtoken