import fetch from 'node-fetch'
import crypto from 'crypto'
import { buffer } from 'micro'

export const config = { api: { bodyParser: false } }

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  const raw = await buffer(req)
  let body
  try { body = JSON.parse(raw.toString()) } catch { return res.status(400).end() }
  const { name, token } = body
  if (!name || !token) return res.status(400).end()
  const [uid, usr, exp, sig] = token.split(':')
  if (!uid || !usr || !exp || !sig || Date.now() > +exp) return res.status(403).end()
  const expected = crypto
    .createHmac('sha256', process.env.HWID_SECRET)
    .update(`${uid}:${usr}:${exp}`)
    .digest('hex')
  if (sig !== expected) return res.status(403).end()
  const sr = await fetch(`https://makalhub.vercel.app/scripts/${name}.lua`)
  if (!sr.ok) return res.status(404).end()
  const script = await sr.text()
  res.setHeader('Content-Type','text/plain')
  res.status(200).send(script)
}
