declare global {
    export type Algorithm = 'sha256' | 'sha384' | 'sha512';
    export type AlgorithmArray = ['sha256', 'sha384', 'sha512']

    //type for keys input 
    interface KeysType {
        signKey: string;
        encKey: string;
    }

    //type for header at create fn  
    interface HeaderForCreate {
        expiresAt?: string;
        algorithm?: Algorithm;
    }

    //type for header at create fn 
    interface HeaderForVerify {
        expiresAt?: string;
        algorithm?: Algorithm;
    }

    //
    interface DecryptedTokenParts {
        encodedHeader: string;
        encodedPayload: string;
        sign: string
    }

    interface TokenHeaders {
        token: 'JAT';
        algorithm: string;
        createAt: number;
        expiresAt: number;
    }

    interface HeaderAndPlayload{
        header:TokenHeaders;
        payload:any
    }
}

export { };