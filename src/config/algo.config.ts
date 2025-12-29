
export const SUPPORTED_ALGORITHM: Record<Runtimes, AlgorithmDetails[]> = {
  node: [
    { name: 'AES-256-GCM', value: 'aes-256-gcm', type: 'symmetric' },
    { name: 'RSA+A256GCM', value: 'rsa+a256gcm', type: 'asymmetric' },
  ],
  web: [
    { name: 'AES-GCM', value: 'AES-GCM', type: 'symmetric' },
    { name: 'RSA+AES-GCM', value: 'RSA+AES-GCM', type: 'asymmetric' }
  ]
};



export const DEFAULT_ALGORITHM: Record<Runtimes, AlgorithmDetails[]> = {
  node: [
    { name: 'AES-256-GCM', value: 'aes-256-gcm', type: 'symmetric' },
  ],
  web: [
    { name: 'AES-GCM', value: 'AES-GCM', type: 'symmetric' },
  ],

}



// ✅ Generic function, now works properly
export function RUNTIME_DEFAULT_ALGORITHM<R extends Runtimes>(runtime: R) {
  const algos: {
    [R in Runtimes]: {
      name: RuntimeWiseAlgorithmMap[R];
      value: string;
      type: EncryptionAlgorithmType;
    };
  } = {
    node: { name: 'AES-256-GCM', value: 'aes-256-gcm', type: 'symmetric' },
    web: { name: 'AES-GCM', value: 'AES-GCM', type: 'symmetric' },
  };
  return algos[runtime];
}

