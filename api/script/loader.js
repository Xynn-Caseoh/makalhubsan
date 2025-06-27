const { Buffer } = require('buffer');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  const { userid, username, placeId } = req.query;
  if (!userid || !username || !placeId) return res.status(400).send('Missing params');

  const initResp = await fetch('https://makalhub.vercel.app/api/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userid, username })
  });
  if (!initResp.ok) throw 'Init failed';
  const token = (await initResp.json()).token;

  const map = {
    537413528: 'babft',
    109983668079237: 'stealabrainrot',
    18687417158: 'forsaken'
  };
  const name = map[placeId];
  if (!name) return res.status(400).send('Unsupported placeId');

  const scriptResp = await fetch(`https://makalhub.vercel.app/api/script/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, token })
  });
  if (!scriptResp.ok) throw 'Script fetch failed';
  const raw = await scriptResp.text();

  const encode = s => Buffer.from(s).toString('base64');
  const dizzy = s => [
    x => x.split('').reverse().join(''),
    x => x.replace(/./g, c => String.fromCharCode((c.charCodeAt() + 3) % 256)),
    x => x.replace(/./g, c => String.fromCharCode((c.charCodeAt() - 1) % 256))
  ].reduce((a, f) => f(a), s);

  const payload = dizzy(encode(raw));

  const stub = `local H=game:GetService("HttpService")
local j={[1]=function(x)return x:reverse()end,[2]=function(x)return x:gsub('.',function(c)return string.char((c:byte()+3)%256)end)end,[3]=function(x)return x:gsub('.',function(c)return string.char((c:byte()-1)%256)end)end}
local e="${payload}"
for i=#j,1,-1 do e=j[i](e)end
loadstring(H:Base64Decode(e))()`;

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(stub.trim());
};
