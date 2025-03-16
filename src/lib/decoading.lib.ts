const decoading = (str: string):any => {
   // Replace URL-safe characters with standard Base64 characters
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if necessary
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  
  // Decode the Base64 string
  const decoded = Buffer.from(base64 + padding, 'base64').toString('utf8');
  
  return JSON.parse(decoded);
  };

export default decoading