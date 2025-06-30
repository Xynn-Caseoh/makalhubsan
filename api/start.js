const fetch = require('node-fetch')
const { v4: uuid } = require('uuid')
module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end()
  const { userid, username } = req.query
  if (!userid || !username) return res.status(400).end()
  await fetch(`${process.env.UPSTASH_URL}/set/${userid}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_TOKEN}` },
    body: JSON.stringify({ username, session: true })
  })
  res.status(200).json({ session: uuid() })
}
