const { Buffer } = require('buffer');

module.exports = async function (req, res) {
  res.setHeader('Content-Type', 'text/plain');
  let stub;
  try {
    if (req.method !== 'GET') throw new Error('405');
    const { userid, username, placeId } = req.query;
    if (!userid || !username || !placeId) throw new Error('MissingParams');

    const initResp = await fetch('https://makalhub.vercel.app/api/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid, username })
    });
    if (!initResp.ok) throw new Error('InitFailed');
    const { token } = await initResp.json();

    const map = { '537413528': 'babft', '109983668079237': 'stealabrainrot', '18687417158': 'forsaken' };
    const name = map[placeId];
    if (!name) throw new Error('UnsupportedPlace');

    const scriptResp = await fetch(`https://makalhub.vercel.app/api/script/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, token })
    });
    if (!scriptResp.ok) throw new Error('ScriptFetchFail');
    const raw = await scriptResp.text();

    const b64 = Buffer.from(raw).toString('base64');
    const payload = [
      s => s.replace(/./g, c => String.fromCharCode((c.charCodeAt() + 5) % 256)),
      s => Buffer.from(s, 'base64').toString(),
      s => s.split('').reverse().join('')
    ].reduce((a, fn) => fn(a), b64);

    stub = `local H=game:GetService("HttpService") local e="${payload}" for i=1,3 do e=(i==1 and function(x) return x:reverse() end or i==2 and function(x) return x:gsub('.',function(c) return string.char((c:byte()-5)%256) end) end or i==3 and function(x) return x end)(e) end loadstring(H:Base64Decode(e))()`;
  } catch (e) {
    stub = `error("${e.message || 'ServerError'}")`;
  }
  res.status(200).send(stub);
};
