import { JsonAuthTokenExpiry, RuntimeWiseAlgorithmMap, GenerateKeyPair } from '../types';
import { WEB_RUNTIME } from './config/name.config'
import { RUNTIME_DEFAULT_ALGORITHM, SUPPORTED_ALGORITHM } from './config/algo.config'
import { isExpired, print, tokenFormatVerify } from './lib/functions.lib'
import { jatTimeFormatter } from './lib/timeformat'
import { WebCrypto } from './runtime/web.runtime'




class WebCryptoModule {
    private dev: boolean = false
    private runtime: 'web'
    private web = new WebCrypto()

    constructor({ runtime, dev }: { dev?: boolean, runtime?: 'web' } = {}) {
        try {
            if (dev) this.dev = true
            if (runtime && !WEB_RUNTIME.includes(runtime)) {
                throw new Error("Unsupported runtime (please select runtime 'web')")
            }
            this.runtime = 'web'
            print({ dev: this.dev }, 'Current Runtime: ', this.runtime)

        } catch (error) {
            print({ dev: this.dev, color: 'red' }, error)
            throw error
        }
    }

    private async createToken(algo: string, key: string, payload: any, exp: number) {
        const algorithms = SUPPORTED_ALGORITHM[this.runtime]
        const algoData = algorithms.find(({ name }) => { return name == algo })

        if (!algoData) {
            throw new Error(`Algorithm ${algo} is not supported for ${this.runtime}`)
        }

        //web runtime
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

    private async verifyToken<T>(token: string, key: string) {
        const { meta, encrypted } = tokenFormatVerify(this.runtime, token)
        const { runtime, algo, type, v, iv, tag, encryptedKey } = meta

        if (this.runtime !== runtime) {
            throw new Error('Runtime not matching')
        }

        //web runtime
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


    public async create({ key, exp, algo }: { key: string, exp: JsonAuthTokenExpiry, algo: RuntimeWiseAlgorithmMap['web'] }, payload: any) {

        try {
            if (!key) {
                throw new Error('key is required to create token')
            }

            exp = exp ? jatTimeFormatter(exp) : jatTimeFormatter('5MIN')
            algo = algo || RUNTIME_DEFAULT_ALGORITHM('web').name

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

    public async generateKeyPair(runtime?: 'web', dev?: boolean): Promise<GenerateKeyPair> {
        let finalRuntime: 'web' = 'web'
        const development = dev === true ? true : false
        try {
            if (runtime) {
                if (!WEB_RUNTIME.includes(runtime)) {
                    throw new Error("Unsupported runtime")
                }
                finalRuntime = runtime
            }
            const { privateKey, publicKey } = await this.web.rsaPrivatePublicKeyGeneration()
            print({ dev: development, color: 'green' }, 'Current Runtime for Key Generation: ', finalRuntime)
            print({ dev: development, color: 'green' }, { privateKey, publicKey })
            return { privateKey, publicKey }
        } catch (error) {
            print({ dev: development, color: 'red' }, error)
            throw error
        }
    }

    public async generatePublicKey(privateKeyPem: string, runtime?: 'web', dev?: boolean): Promise<string> {
        let finalRuntime: 'web' = 'web'
        const development = dev === true ? true : false
        try {
            if (runtime) {
                if (!WEB_RUNTIME.includes(runtime)) {
                    throw new Error("Unsupported runtime")
                }
                finalRuntime = runtime
            }

            const publicKey = await this.web.rsaPublicKeyGeneration(privateKeyPem)
            print({ dev: development, color: 'green' }, 'Current Runtime for Key Generation: ', finalRuntime)
            print({ dev: development, color: 'green' }, publicKey)
            return publicKey
        } catch (error) {
            print({ dev: development, color: 'red' }, error)
            throw error
        }
    }
}

const p2kgObject = new PrivatePublicKeyGeneration()
const generateKeyPair = (options?: { runtime?: 'web'; dev?: boolean }) => {
    const { runtime, dev } = options || {};
    return p2kgObject.generateKeyPair(runtime, dev);
};
const generatePublicKey = (privateKeyPem: string, options?: { runtime?: 'web'; dev?: boolean }) => {
    const { runtime, dev } = options || {};
    return p2kgObject.generatePublicKey(privateKeyPem, runtime, dev);
};

export const JAT = ({ runtime, dev }: { runtime?: 'web', dev?: boolean } = {}) => new WebCryptoModule({ runtime: runtime, dev: dev })

export const P2KG = {
    generateKeyPair: generateKeyPair,
    generatePublicKey: generatePublicKey
}

const jsonauthtoken = {
    JAT: JAT,
    P2KG: P2KG
}

export default jsonauthtoken