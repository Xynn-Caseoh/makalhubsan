const crypto = require('crypto');

module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  const { userid, username } = req.query || {};
  if (!userid || !username) return res.status(400).end();
  const exp = Date.now() + 20000;
  const payload = `${userid}:${username}:${exp}`;
  const sig = crypto.createHmac('sha256', process.env.HWID_SECRET).update(payload).digest('hex');
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ token: `${payload}:${sig}` }));
};
