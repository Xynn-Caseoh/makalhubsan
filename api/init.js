const crypto = require('crypto');

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).end('Invalid JSON');
    }
  }
  const { userid, username } = body || {};
  if (!userid || !username) return res.status(400).end();

  const exp = Date.now() + 20_000;
  const payload = `${userid}:${username}:${exp}`;
  const sig = crypto
    .createHmac('sha256', process.env.HWID_SECRET)
    .update(payload)
    .digest('hex');

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ token: `${payload}:${sig}` }));
};
