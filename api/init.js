const crypto = require('crypto')
const fetch = require('node-fetch')
module.exports = async (req, res) => {
  const { userid, username, key } = req.query
  if (!userid || !username || !key) return res.status(400).end()
  const [session, exp, sig] = key.split(':')
  if (!session || !exp || !sig || Date.now() > +exp) return res.status(403).end()
  if (
    crypto
      .createHmac('sha256', process.env.HWID_SECRET)
      .update(`${session}:${exp}`)
      .digest('hex') !== sig
  ) return res.status(403).end()
  const lookup = await fetch(`${process.env.UPSTASH_URL}/get/${session}`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_TOKEN}` }
  })
  const { result } = await lookup.json()
  if (!result) return res.status(403).end()
  const { validKey } = JSON.parse(result)
  if (validKey !== key) return res.status(403).end()
  const clientHwid = req.headers['x-hwid'] || ''
  const payload = `${userid}:${username}:${Date.now() + 3600 * 1000}`
  const tok = crypto
    .createHmac('sha256', process.env.HWID_SECRET)
    .update(payload + ':' + clientHwid)
    .digest('hex')
  res.setHeader('Content-Type', 'application/json')
  res.status(200).end(JSON.stringify({ token: `${payload}:${clientHwid}:${tok}` }))
}
