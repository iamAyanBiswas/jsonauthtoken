import { RUNTIME } from './config/name.config'
import { detectRuntime } from './config/runtime.config'
import { DEFAULT_ALGORITHM, SUPPORTED_ALGORITHM } from './config/algo.config'
import { isExpired, print } from './lib/functions.lib'
import { jatTimeFormatter } from './lib/timeformat'
import { RuntimeCrypto } from './runtime/runtime'




class JATClass<R extends Runtime = Runtime> {
    private runtime: R
    private dev: boolean = false
    private crypto = new RuntimeCrypto()

    constructor(config?: JATConfig<R>) {
        try {
            if (config && config.dev == true) this.dev = true
            if (config && config.runtime) {
                if (!RUNTIME.includes(config.runtime)) {
                    throw new Error("Unsupported runtime")
                }
                this.runtime = config.runtime
            }
            else {
                this.runtime = detectRuntime() as R
            }
            
            print({ dev: this.dev }, 'Current Runtime: ', this.runtime)

        } catch (error) {
            print({ dev: this.dev, color: 'red' }, error)
            throw error
        }

    }

 
    public async create(header: CreateTokenConfig<R>, payload: any) {

        try {
            if (!header.key) {
                throw new Error('key is required to create token')
            }

            const key = header.key
            const exp = header.exp ? jatTimeFormatter(header.exp) : jatTimeFormatter('5MIN')
            const algo = header.algo || (DEFAULT_ALGORITHM[this.runtime][0].name)

            return await this.crypto.createToken(this.runtime, algo, key, payload, exp)

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
            const unfilterPayload = await this.crypto.verifyToken<T>(this.runtime, token, key)
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
    private crypto = new RuntimeCrypto()
    public async generateKeyPair(runtime?: Runtime, dev?: boolean): Promise<GenerateKeyPair> {
        let finalRuntime: Runtime = detectRuntime()
        const development = dev === true ? true : false
        try {
            if (runtime) {
                if (!RUNTIME.includes(runtime)) {
                    throw new Error("Unsupported runtime")
                }
                finalRuntime = runtime
            }
            const { privateKey, publicKey } = await this.crypto.rsaKeyDrivation(finalRuntime, 'keyPair')
            print({ dev: development, color: 'green' }, 'Current Runtime: ', finalRuntime)
            print({ dev: development, color: 'green' }, { privateKey, publicKey })
            return { privateKey, publicKey }
        } catch (error) {
            print({ dev: development, color: 'red' }, error)
            throw error
        }
    }

    public async generatePublicKey(privateKeyPem: string, runtime?: Runtime, dev?: boolean): Promise<string> {
        let finalRuntime: Runtime = detectRuntime()
        const development = dev === true ? true : false
        try {
            if (runtime) {
                if (!RUNTIME.includes(runtime)) {
                    throw new Error("Unsupported runtime")
                }
                finalRuntime = runtime
            }

            const publicKey = await this.crypto.rsaKeyDrivation(finalRuntime, 'publickey', privateKeyPem)
            print({ dev: development, color: 'green' }, 'Current Runtime: ', finalRuntime)
            print({ dev: development, color: 'green' }, publicKey)
            return publicKey
        } catch (error) {
            print({ dev: development, color: 'red' }, error)
            throw error
        }
    }
}

const p2kgObject = new PrivatePublicKeyGeneration()
const generateKeyPair = (options?: { runtime?: Runtime; dev?: boolean }) => {
    const { runtime, dev } = options || {};
    return p2kgObject.generateKeyPair(runtime, dev);
};
const generatePublicKey = (privateKeyPem: string, options?: { runtime?: Runtime; dev?: boolean }) => {
    const { runtime, dev } = options || {};
    return p2kgObject.generatePublicKey(privateKeyPem, runtime, dev);
};

export const JAT = <R extends Runtime = Runtime>(config?: JATConfig<R>) => new JATClass(config)
export const getSupportedAlgorithm = () => SUPPORTED_ALGORITHM

export const P2KG = {
    generateKeyPair: generateKeyPair,
    generatePublicKey: generatePublicKey
}

const jsonauthtoken = {
    JAT: JAT,
    P2KG: P2KG
}
export default jsonauthtoken