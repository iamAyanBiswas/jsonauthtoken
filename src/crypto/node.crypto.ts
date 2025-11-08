// src/crypto/node.crypto.ts
import crypto from 'crypto';
import { tokenFormatCreate } from '../lib/functions.lib';

export class NodeCrypto {
  
  private _encrypt(algorithm: 'aes-256-gcm', key: Buffer<ArrayBufferLike>, payload: any) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const data = JSON.stringify(payload);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const tag = cipher.getAuthTag().toString('base64');

    return {
      iv: iv.toString('base64'),
      encrypted,
      tag
    }
  }

  private _decrypt(algorithm: 'aes-256-gcm', key: Buffer<ArrayBufferLike>, encryptedData: { iv: string; encrypted: string; tag: string }
  ) {
    const { iv, encrypted, tag } = encryptedData;

    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(tag, 'base64'));

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);

  }



  private _rsaPublicKeyGeneration(privateKeyPem: string) {
    const privateKeyObject = crypto.createPrivateKey({
      key: privateKeyPem.replace(/\\n/g, '\n'),
      format: 'pem',
      type: 'pkcs8'
    });
    const publicKeyObject = crypto.createPublicKey(privateKeyObject)
    return publicKeyObject.export({ type: 'spki', format: 'pem' });
  }

  private _rsaPrivatePublicKeyGeneration() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
    return { privateKey, publicKey }
  }



  public encrypt(algo: 'aes-256-gcm', key: string, payload: any, exp: number): string {
    const keyHash = crypto.createHash('sha256').update(key).digest();
    const newPayload = { payload: payload, exp: exp }
    const { iv, encrypted, tag } = this._encrypt(algo, keyHash, newPayload)
    return tokenFormatCreate(
      {
        runtime: 'node',
        algo: 'AES-256-GCM',
        type: 'symmetric',
        v: '1',
        iv,
        tag
      },
      encrypted
    )
  }

  public decrypt<T>(algo: 'aes-256-gcm', key: string, encryptedData: { iv: string, encrypted: string, tag: string }) {
    const keyHash = crypto.createHash('sha256').update(key).digest();
    return this._decrypt(algo, keyHash, encryptedData) as { payload: T, exp: number }
  }



  // --- RSA-OAEP Hybrid ---
  public encryptRSA(payload: any, publicKey: string, exp: number): string {
    const symmetricKey = crypto.randomBytes(32);
    const newPayload = { payload: payload, exp: exp }
    const { iv, encrypted, tag } = this._encrypt('aes-256-gcm', symmetricKey, newPayload)
    const encryptedSymmetricKey = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      symmetricKey
    );
    return tokenFormatCreate(
      {
        runtime: 'node',
        algo: 'RSA+A256GCM',
        type: 'asymmetric',
        v: '1',
        iv,
        tag,
        encryptedKey: encryptedSymmetricKey.toString('base64')
      },
      encrypted
    )
  }

  public decryptRSA<T>(privateKey: string, encryptedKey: string, encryptedData: { iv: string, encrypted: string, tag: string }) {
    const decryptedSymmetricKey = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      Buffer.from(encryptedKey,'base64')
    );
    return this._decrypt('aes-256-gcm', decryptedSymmetricKey, encryptedData) as { payload: T, exp: number }
  }


  public rsaPrivatePublicKeyGeneration() {
    return this._rsaPrivatePublicKeyGeneration()
  }

  public rsaPublicKeyGeneration(privateKeyPem: string) {
    return this._rsaPublicKeyGeneration(privateKeyPem)
  }


}
