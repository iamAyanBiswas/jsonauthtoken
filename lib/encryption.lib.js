import crypto from 'crypto'

function encryption(password,token){
    const iv = crypto.randomBytes(16); // Initialization vector
    const key = crypto.scryptSync(password, 'salt', 32); // Key derivation
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return the IV and encrypted text
    return iv.toString('hex') + ':' + encrypted;
}

export default encryption