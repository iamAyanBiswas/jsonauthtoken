// src/crypto/web.crypto.ts
import { tokenFormatCreate } from '../lib/functions.lib';

export class WebCrypto {
  private textEncoder = new TextEncoder();
  private textDecoder = new TextDecoder();

  // Import AES key from password string
  private async __importAESKey(password: string): Promise<CryptoKey> {
    const passwordBuffer = this.textEncoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);

    return await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  //uint8Array to Base64
  private __uint8ArrayToBase64(uint8Array: Uint8Array<ArrayBuffer>): string {
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  //base64 to Uint8Array
  private __base64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // ArrayBuffer to Base64
  private __arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  //Base64 to ArrayBuffer
  private __base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  //PEM to ArrayBuffer
  private __pemToArrayBuffer(pem: string, type: 'PUBLIC' | 'PRIVATE'): ArrayBuffer {
    const pemHeader = `-----BEGIN ${type} KEY-----`;
    const pemFooter = `-----END ${type} KEY-----`;
    const pemContents = pem
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\\n/g, '')
      .replace(/\s/g, '');
    return this.__base64ToArrayBuffer(pemContents);
  }

  //ArrayBuffer to PEM
  private __arrayBufferToPem(buffer: ArrayBuffer, type: 'PUBLIC' | 'PRIVATE'): string {
    const base64 = this.__arrayBufferToBase64(buffer);
    const pemContents = base64.match(/.{1,64}/g)?.join('\n') || base64;
    return `-----BEGIN ${type} KEY-----\n${pemContents}\n-----END ${type} KEY-----`;
  }

  // Import RSA public key from PEM
  private async __importPublicKey(publicKeyPem: string): Promise<CryptoKey> {
    const keyData = this.__pemToArrayBuffer(publicKeyPem, 'PUBLIC');
    return await crypto.subtle.importKey(
      'spki',
      keyData,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['encrypt']
    );
  }

  // Import RSA private key from PEM
  private async __importPrivateKey(privateKeyPem: string): Promise<CryptoKey> {
    const keyData = this.__pemToArrayBuffer(privateKeyPem.replace(/\\n/g, '\n'), 'PRIVATE');
    return await crypto.subtle.importKey(
      'pkcs8',
      keyData,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['decrypt']
    );
  }










  // AES-256-GCM Encryption
  private async _encrypt(algo: 'AES-GCM', key: CryptoKey, payload: any): Promise<{ iv: string; encrypted: string; }> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = this.textEncoder.encode(JSON.stringify(payload));

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: algo,
        iv: iv,
        tagLength: 128
      },
      key,
      data
    );

    const encryptedBytes = new Uint8Array(encryptedBuffer);

    return {
      iv: this.__uint8ArrayToBase64(iv),
      encrypted: this.__uint8ArrayToBase64(encryptedBytes),
    };
  }

  // AES-256-GCM Decryption
  private async _decrypt(algo: 'AES-GCM', key: CryptoKey, encryptedData: { iv: string; encrypted: string; }) {
    const { iv, encrypted } = encryptedData;

    const ivBuffer = this.__base64ToUint8Array(iv);
    const encryptedBuffer = this.__base64ToUint8Array(encrypted);

    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: algo,
          iv: ivBuffer,
          tagLength: 128
        },
        key,
        encryptedBuffer
      );
      return JSON.parse(this.textDecoder.decode(decryptedBuffer));
    } catch (error) {
      throw new Error('Invalid Key')
    }
  }



  // Generate RSA public key from private key PEM
  private async _rsaPublicKeyGeneration(privateKeyPem: string): Promise<string> {
    const privateKey = await this.__importPrivateKey(privateKeyPem);

    // Export as JWK to get public key components
    const jwk = await crypto.subtle.exportKey('jwk', privateKey);

    // Remove private key components
    delete jwk.d;
    delete jwk.dp;
    delete jwk.dq;
    delete jwk.q;
    delete jwk.qi;
    jwk.key_ops = ['encrypt'];

    // Import as public key
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['encrypt']
    );

    // Export as SPKI (PEM format)
    const exportedPublicKey = await crypto.subtle.exportKey('spki', publicKey);
    return this.__arrayBufferToPem(exportedPublicKey, 'PUBLIC');
  }

  private async _rsaPrivatePublicKeyGeneration(): Promise<{ privateKey: string; publicKey: string; }> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );

    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);

    return {
      privateKey: this.__arrayBufferToPem(privateKeyBuffer, 'PRIVATE'),
      publicKey: this.__arrayBufferToPem(publicKeyBuffer, 'PUBLIC')
    };
  }



  public async encrypt(algo: 'AES-GCM', key: string, payload: any, exp: number): Promise<string> {
    const cryptoKey = await this.__importAESKey(key);
    const newPayload = { payload: payload, exp: exp };
    const { iv, encrypted } = await this._encrypt(algo, cryptoKey, newPayload);


    return tokenFormatCreate(
      {
        runtime: 'web',
        algo: 'AES-GCM',
        type: 'symmetric',
        v: '1',
        iv,
      },
      encrypted
    );
  }


  public async decrypt<T>(algo: 'AES-GCM', key: string, encryptedData: { iv: string; encrypted: string }): Promise<{ payload: T; exp: number }> {
    const cryptoKey = await this.__importAESKey(key);
    return await this._decrypt(algo, cryptoKey, encryptedData) as { payload: T; exp: number };
  }



  // Public method: Asymmetric encryption (RSA-OAEP + AES-256-GCM)
  public async encryptRSA(payload: any, publicKeyPem: string, exp: number): Promise<string> {
    // Generate random symmetric key
    const symmetricKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Encrypt payload with AES
    const newPayload = { payload: payload, exp: exp };
    const { iv, encrypted } = await this._encrypt('AES-GCM', symmetricKey, newPayload);

    // Export symmetric key
    const symmetricKeyBuffer = await crypto.subtle.exportKey('raw', symmetricKey);

    // Import RSA public key
    const publicKey = await this.__importPublicKey(publicKeyPem);

    // Encrypt symmetric key with RSA
    const encryptedSymmetricKey = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      publicKey,
      symmetricKeyBuffer
    );

    return tokenFormatCreate(
      {
        runtime: 'web',
        algo: 'RSA+AES-GCM',
        type: 'asymmetric',
        v: '1',
        iv,
        encryptedKey: this.__arrayBufferToBase64(encryptedSymmetricKey)
      },
      encrypted
    );
  }

  // Public method: Asymmetric decryption (RSA-OAEP + AES-256-GCM)
  public async decryptRSA<T>(privateKeyPem: string, encryptedKey: string, encryptedData: { iv: string; encrypted: string }
  ): Promise<{ payload: T; exp: number }> {
    // Import RSA private key
    const privateKey = await this.__importPrivateKey(privateKeyPem);

    // Decrypt symmetric key with RSA
    const encryptedKeyBuffer = this.__base64ToArrayBuffer(encryptedKey);
    const decryptedSymmetricKeyBuffer = await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP'
      },
      privateKey,
      encryptedKeyBuffer
    );

    // Import decrypted symmetric key
    const symmetricKey = await crypto.subtle.importKey(
      'raw',
      decryptedSymmetricKeyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    return await this._decrypt('AES-GCM', symmetricKey, encryptedData) as { payload: T; exp: number };
  }

  public async rsaPrivatePublicKeyGeneration(): Promise<{ privateKey: string; publicKey: string; }> {
    return await this._rsaPrivatePublicKeyGeneration();
  }
  public async rsaPublicKeyGeneration(privateKeyPem: string): Promise<string> {
    return await this._rsaPublicKeyGeneration(privateKeyPem);
  }
}
