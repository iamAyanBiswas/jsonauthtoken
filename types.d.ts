
export declare function JAT<T extends { runtime: 'web' | 'node'; dev?: boolean }>({ runtime, dev }?: T): T extends { runtime: 'node' } ? NodeJATInstance : WebJATInstance;

export interface WebJATInstance {
    create: ({ key, exp, algo }: { key: string, exp?: JsonAuthTokenExpiry, algo?: RuntimeWiseAlgorithmMap['web'] }, payload: any) => Promise<string>
    verify: <T>(token: string, key: string) => Promise<T>
}

export interface NodeJATInstance {
    create: ({ key, exp, algo }: { key: string, exp?: JsonAuthTokenExpiry, algo?: RuntimeWiseAlgorithmMap['node'] }, payload: any) => Promise<string>
    verify: <T>(token: string, key: string) => Promise<T>
}

export declare const P2KG: {
    generateKeyPair: typeof generateKeyPair;
    generatePublicKey: typeof generatePublicKey;
};

declare const jsonauthtoken: {
    JAT: typeof JAT;
    P2KG: typeof P2KG;
};
export default jsonauthtoken

declare function generateKeyPair({ runtime, dev }?: { runtime?: 'web' | 'node'; dev?: boolean }): Promise<GenerateKeyPair>
declare function generatePublicKey(privateKeyPem: string, { runtime, dev }?: { runtime?: 'web' | 'node'; dev?: boolean }): Promise<string>







//timeformat type
export type TimeUnit = 'S' | 'MIN' | 'H' | 'D' | 'M' | 'Y';
export type ExpirationString = `${number}${TimeUnit}` | `${number}${Lowercase<TimeUnit>}`;
export type JsonAuthTokenExpiry = number | ExpirationString;



export interface GenerateKeyPair {
    privateKey: string
    publicKey: string
}

export type Runtimes = 'node' | 'web';
export type EncryptionAlgorithmType = 'symmetric' | 'asymmetric';

export type WebRuntime = 'web'
export type NodeRuntime = 'node' | 'web'

export interface AlgorithmDetails {
    name: string;
    value: string
    type: EncryptionAlgorithmType;
}

export interface RuntimeWiseAlgorithmMap {
    node: 'AES-256-GCM' | 'RSA+A256GCM'
    web: 'AES-GCM' | 'RSA+AES-GCM'
}

export type RuntimeWiseAlgorithm<R extends Runtimes> = RuntimeWiseAlgorithmMap[R];

export interface BaseTokenMetaData<R extends Runtimes> {
    runtime: Runtimes;
    algo: RuntimeWiseAlgorithm<R>;
    v: string;
    iv: string;
}

export type TokenMetaData<R extends Runtimes> =
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
