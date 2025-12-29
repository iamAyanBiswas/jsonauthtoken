declare global {
    interface WebCryptoModuleType {
        create: ({ key, exp, algo }: { key: string, exp: JsonAuthTokenExpiry, algo: RuntimeWiseAlgorithmMap['web'] }, payload: any) => Promise<string>
        verify: <T>(token: string, key: string) => Promise<T>
    }

    interface JsonAuthToken {
        create({ key, exp, algo }: { key: string, exp: JsonAuthTokenExpiry, algo: RuntimeWiseAlgorithmMap[Runtime] }, payload: any): string
    }

    //timeformat type
    type TimeUnit = 'S' | 'MIN' | 'H' | 'D' | 'M' | 'Y';
    type ExpirationString = `${number}${TimeUnit}` | `${number}${Lowercase<TimeUnit>}`;
    type JsonAuthTokenExpiry = number | ExpirationString;



    interface GenerateKeyPair {
        privateKey: string
        publicKey: string
    }

    type Runtimes = 'node' | 'web';
    type EncryptionAlgorithmType = 'symmetric' | 'asymmetric';

    type WebRuntime = 'web'
    type NodeRuntime = 'node' | 'web'

    interface AlgorithmDetails {
        name: string;
        value: string
        type: EncryptionAlgorithmType;
    }

    interface RuntimeWiseAlgorithmMap {
        node: 'AES-256-GCM' | 'RSA+A256GCM'
        web: 'AES-GCM' | 'RSA+AES-GCM'
    }

    type RuntimeWiseAlgorithm<R extends Runtimes> = RuntimeWiseAlgorithmMap[R];

    // interface JATConfig<R extends Runtime = Runtime> {
    //     runtime?: R
    //     dev?: boolean
    // }

    // interface CreateTokenConfig<R extends Runtime> {
    //     key: string
    //     exp?: JATTime
    //     algo?: RuntimeWiseAlgorithm<R>
    // }

    interface BaseTokenMetaData<R extends Runtimes> {
        runtime: Runtimes;
        algo: RuntimeWiseAlgorithm<R>;
        v: string;
        iv: string;
    }

    type TokenMetaData<R extends Runtimes> =
        | (BaseTokenMetaData<R> & {
            runtime: 'node';
            tag: string;
        } & (
                | { type: 'symmetric'; encryptedKey?: never }
                | { type: 'asymmetric'; encryptedKey: string }
            ))
        | (BaseTokenMetaData<R> & {
            runtime: 'web';
            tag?: never;
        } & (
                | { type: 'symmetric'; encryptedKey?: never }
                | { type: 'asymmetric'; encryptedKey: string }
            ));

}



export { };

