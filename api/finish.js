const fetch = require('node-fetch')
module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end()
  const { session, api_token } = req.query
  if (!session || !api_token) return res.status(400).end()
  const lootRes = await fetch(
    `https://creators.lootlabs.gg/api/public/content_locker?api_token=${api_token}`
  )
  if (!lootRes.ok) return res.status(403).end()
  const data = await lootRes.json()
  if (!data.completed) return res.status(403).end()
  const exp = Date.now() + 50 * 3600 * 1000
  const keyPayload = `${session}:${exp}`
  const sig = require('crypto')
    .createHmac('sha256', process.env.HWID_SECRET)
    .update(keyPayload)
    .digest('hex')
  await fetch(`${process.env.UPSTASH_URL}/set/${session}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_TOKEN}` },
    body: JSON.stringify({ validKey: `${keyPayload}:${sig}` })
  })
  res.status(200).json({ key: `${keyPayload}:${sig}` })
}
