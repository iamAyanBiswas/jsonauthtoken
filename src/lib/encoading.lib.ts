
function encoading(data:any):string {
    const json = JSON.stringify(data);
    const base64 = Buffer.from(json).toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

export default encoading