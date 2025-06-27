const crypto = require('crypto');

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let raw = '';
  req.on('data', chunk => {
    raw += chunk;
  });

  req.on('end', () => {
    let body = {};
    try {
      body = JSON.parse(raw);
    } catch {
      return res.status(400).send('Invalid JSON');
    }

    const { userid, username } = body;
    if (!userid || !username) return res.status(400).end();

    const exp = Date.now() + 20000;
    const payload = `${userid}:${username}:${exp}`;
    const sig = crypto.createHmac('sha256', process.env.HWID_SECRET).update(payload).digest('hex');

    res.status(200).json({ token: `${payload}:${sig}` });
  });
};
