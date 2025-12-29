// import type { NodeCrypto } from "./node.runtime";
// import type { WebCrypto } from "./web.runtime";
// import { SUPPORTED_ALGORITHM } from "../config/algo.config";
// import { tokenFormatVerify } from "../lib/functions.lib";


// export class RuntimeCrypto {

//   private node: NodeCrypto | undefined
//   private web: WebCrypto | undefined

//   private async getModule(runtime: Runtime): Promise<void> {
//     if (runtime === 'node' && this.node === undefined) {
//       const { NodeCrypto } = await import('./node.runtime')
//       this.node = new NodeCrypto()
//     }
//     else if (runtime === 'web' && this.web === undefined) {
//       const { WebCrypto } = await import('./web.runtime')
//       this.web = new WebCrypto()
//     }
//   }


//   public async createToken(runtime: Runtime, algo: string, key: string, payload: any, exp: number) {
//     return "IT is Random String"
//     //     const algorithms = SUPPORTED_ALGORITHM[runtime]
//     //     const algoData = algorithms.find(({ name }) => { return name == algo })

//     //     if (!algoData) {
//     //       throw new Error(`Algorithm ${algo} is not supported for ${runtime}`)
//     //     }

//     //     await this.getModule(runtime)

//     //     //node runtime
//     //     if (runtime === 'node') {
//     //   // node asymmetric encryption
//     //   if(algoData.type === 'asymmetric') {
//     //   if (algoData.value !== 'ras+a256gcm') {
//     //     throw new Error(`Algorithm ${algoData.name} is not supported for asymmetric encryption`)
//     //   }
//     //   return await this.node.encryptRSA(payload, key, exp)
//     // }

//     //       //node symmetric encryption
//     //       else {
//     //   if (algoData.value !== 'aes-256-gcm') {
//     //     throw new Error(`Algorithm ${algoData.name} is not supported for symmetric encryption`)
//     //   }
//     //   return await this.node.encrypt(algoData.value, key, payload, exp)
//     // }
//     //     }

//     //     //web and edge runtime
//     //     else {

//     //   //web asymmetric encryption
//     //   if (algoData.type === 'asymmetric') {
//     //     if (algoData.value !== 'RSA+AES-GCM') {
//     //       throw new Error(`Algorithm ${algoData.name} is not supported for asymmetric encryption`)
//     //     }
//     //     return await this.web.encryptRSA(payload, key, exp)
//     //   }

//     //   //web symmetric encryption
//     //   else {
//     //     if (algoData.value !== 'AES-GCM') {
//     //       throw new Error(`Algorithm ${algoData.name} is not supported for symmetric encryption`)
//     //     }
//     //     return await this.web.encrypt(algoData.value, key, payload, exp)
//     //   }
//     // }
//   }


//   public async verifyToken<T>(currentRuntime: Runtime, token: string, key: string) {
//     const { meta, encrypted } = tokenFormatVerify(token)
//     const { runtime, algo, type, v, iv, tag, encryptedKey } = meta

//     if (currentRuntime !== runtime) {
//       throw new Error('Runtime not matching')
//     }

//     await this.getModule(runtime)

//     //node runtime
//     if (runtime === 'node') {

//       //node asymmetric encryption
//       if (type === 'asymmetric') {
//         if (algo !== 'RSA+A256GCM') {
//           throw new Error(`Algorithm ${algo} is not supported for asymmetric encryption`)
//         }
//         return await this.node.decryptRSA<T>(key, encryptedKey, { iv, encrypted, tag })
//       }

//       //node symmetric encryption
//       else {
//         if (algo !== 'AES-256-GCM') {
//           throw new Error(`Algorithm ${algo} is not supported for symmetric encryption`)
//         }
//         return await this.node.decrypt<T>("aes-256-gcm", key, { iv, encrypted, tag })
//       }
//     }

//     //web and edge runtime
//     else {

//       //web asymmetric encryption
//       if (type === 'asymmetric') {
//         if (algo !== 'RSA+AES-GCM') {
//           throw new Error(`Algorithm ${algo} is not supported for asymmetric encryption`)
//         }
//         return await this.web.decryptRSA<T>(key, encryptedKey, { iv, encrypted })
//       }

//       //web symmetric encryption
//       else {
//         if (algo !== 'AES-GCM') {
//           throw new Error(`Algorithm ${algo} is not supported for symmetric encryption`)
//         }
//         return await this.web.decrypt<T>('AES-GCM', key, { iv, encrypted })
//       }
//     }
//   }

//   public async rsaKeyDrivation(runtime: Runtime, type: 'keyPair'): Promise<GenerateKeyPair>;
//   public async rsaKeyDrivation(runtime: Runtime, type: 'publickey', privateKeyPem: string): Promise<string>;
//   public async rsaKeyDrivation(runtime: Runtime, type: 'keyPair' | 'publickey', privateKeyPem?: string) {

//     await this.getModule(runtime)

//     //node runtime
//     if (runtime === 'node') {
//       if (type === 'keyPair') {
//         return await this.node.rsaPrivatePublicKeyGeneration(); // returns GenerateKeyPair
//       } else {
//         if (!privateKeyPem) throw new Error('privateKeyPem is required');
//         return await this.node.rsaPublicKeyGeneration(privateKeyPem); // returns string
//       }
//     }

//     //web and edge runtime
//     else {
//       if (type === 'keyPair') {
//         return await this.web.rsaPrivatePublicKeyGeneration() // returns GenerateKeyPair
//       } else {
//         if (!privateKeyPem) throw new Error('privateKeyPem is required');
//         return await this.web.rsaPublicKeyGeneration(privateKeyPem)
//       }
//     }
//   }


// }
