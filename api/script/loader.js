import { Buffer } from 'buffer'
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain')
  let stub
  try {
    if (req.method !== 'GET') throw '405'
    const { userid, username, placeId } = req.query
    if (!userid || !username || !placeId) throw 'MissingParams'

    const initResp = await fetch('https://makalhub.vercel.app/api/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid, username })
    })
    if (!initResp.ok) throw 'InitFailed'
    const { token } = await initResp.json()

    const map = { '537413528': 'babft', '109983668079237': 'stealabrainrot', '18687417158': 'forsaken' }
    const name = map[placeId]
    if (!name) throw 'UnsupportedPlace'

    const scriptResp = await fetch(`https://makalhub.vercel.app/api/script/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, token })
    })
    if (!scriptResp.ok) throw 'ScriptFetchFail'
    const raw = await scriptResp.text()

    const payload = (() => {
      const b64 = Buffer.from(raw).toString('base64')
      return [
        s => s.replace(/./g, c => String.fromCharCode((c.charCodeAt() + 5) % 256)),
        s => Buffer.from(s, 'base64').toString(),
        s => s.split('').reverse().join('')
      ].reduce((a, fn) => fn(a), b64)
    })()

    stub = `local H=game:GetService("HttpService")local e="${payload}"for i=1,3do e=(i==1 and function(x)return x:reverse()end or i==2 and function(x)return Buffer and Buffer.from and x or error())(e)end loadstring(H:Base64Decode(e))()`
  } catch (e) {
    const msg = typeof e === 'string' ? e : 'ServerError'
    stub = `error("${msg}")`
  }
  res.status(200).send(stub)
}
