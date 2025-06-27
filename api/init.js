const crypto = require('crypto');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return res.status(400).end();
  }

  const { userid, username } = parsed || {};
  if (!userid || !username) return res.status(400).end();

  const exp = Date.now() + 20000;
  const payload = `${userid}:${username}:${exp}`;
  const sig = crypto.createHmac('sha256', process.env.HWID_SECRET).update(payload).digest('hex');

  res.status(200).json({ token: `${payload}:${sig}` });
};
