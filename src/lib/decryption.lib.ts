import crypto from 'crypto'

function decryption(encryptedToken:string, password:string):string {
    const parts = encryptedToken.split(':');
    const iv = Buffer.from(parts.shift(), 'hex'); // Get the IV
    const encryptedTokenBuffer = Buffer.from(parts.join(':'), 'hex');
    const key = crypto.scryptSync(password, 'salt', 32);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encryptedTokenBuffer, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
}
export default decryption