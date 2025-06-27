const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let raw = '';
  for await (const chunk of req) raw += chunk;

  let data;
  try { data = JSON.parse(raw); }
  catch { return res.status(400).end(); }

  const { userid, username } = data || {};
  if (!userid || !username) return res.status(400).end();

  const exp = Date.now() + 20000;
  const payload = `${userid}:${username}:${exp}`;
  const sig = crypto.createHmac('sha256', process.env.HWID_SECRET).update(payload).digest('hex');

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ token: `${payload}:${sig}` }));
};
