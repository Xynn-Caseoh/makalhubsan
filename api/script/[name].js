const fetch = require('node-fetch')
const crypto = require('crypto')
const { buffer } = require('micro')
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  const raw = await buffer(req)
  const { name, token } = JSON.parse(raw.toString())
  if (!name || !token) return res.status(400).end()
  const [uid, usr, exp, hwid, sig] = token.split(':')
  if (!uid||!usr||!exp||!hwid||!sig||Date.now()>+exp) return res.status(403).end()
  if (
    crypto
      .createHmac('sha256', process.env.HWID_SECRET)
      .update(`${uid}:${usr}:${exp}:${hwid}`)
      .digest('hex') !== sig
  ) return res.status(403).end()
  const scriptRes = await fetch(`https://makalhub.vercel.app/scripts/${name}.lua`)
  if (!scriptRes.ok) return res.status(404).end()
  const code = await scriptRes.text()
  res.setHeader('Content-Type', 'text/plain')
  res.send(code)
}
export const config = { api: { bodyParser: false } }
