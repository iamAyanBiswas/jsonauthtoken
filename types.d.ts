import { RUNTIME } from "./src/config/name.config";

declare global {

    type TimeUnit = 'S' | 'MIN' | 'H' | 'D' | 'M' | 'Y';
    type ExpirationString = `${number}${TimeUnit}` | `${number}${Lowercase<TimeUnit>}`;
    type JATTime = number | ExpirationString;

    interface GenerateKeyPair {
        privateKey: string
        publicKey: string
    }

    type Runtime = 'node' | 'web' | 'edge';
    type EncryptionAlgorithmType = 'symmetric' | 'asymmetric';

    interface AlgorithmDetails {
        name: string;
        value: string
        type: EncryptionAlgorithmType;
    }

    interface RuntimeWiseAlgorithmMap {
        node: 'AES-256-GCM' | 'RSA+A256GCM'
        edge: 'AES-GCM' | 'RSA+AES-GCM'
        web: 'AES-GCM' | 'RSA+AES-GCM'
    }

    type RuntimeWiseAlgorithm<R extends Runtime> = RuntimeWiseAlgorithmMap[R];

    interface JATConfig<R extends Runtime = Runtime> {
        runtime?: R
        dev?: boolean
    }

    interface CreateTokenConfig<R extends Runtime> {
        key: string
        exp?: JATTime
        algo?: RuntimeWiseAlgorithm<R>
    }

    interface BaseTokenMetaData<R extends Runtime> {
        runtime: Runtime;
        algo: RuntimeWiseAlgorithm<R>;
        v: string;
        iv: string;
    }

 type TokenMetaData<R extends Runtime> =
  | (BaseTokenMetaData<R> & {
      runtime: 'node';
      tag: string;
    } & (
      | { type: 'symmetric'; encryptedKey?: never }
      | { type: 'asymmetric'; encryptedKey: string }
    ))
  | (BaseTokenMetaData<R> & {
      runtime: 'web' | 'edge';
      tag?: never;
    } & (
      | { type: 'symmetric'; encryptedKey?: never }
      | { type: 'asymmetric'; encryptedKey: string }
    ));

}

export { };