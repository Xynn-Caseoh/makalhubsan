const crypto = require('crypto');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let raw = '';
  req.on('data', chunk => {
    raw += chunk;
  });
  req.on('end', () => {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(400).end();
    }
    const { userid, username } = parsed || {};
    if (!userid || !username) return res.status(400).end();

    const exp = Date.now() + 20000;
    const payload = `${userid}:${username}:${exp}`;
    const sig = crypto.createHmac('sha256', process.env.HWID_SECRET).update(payload).digest('hex');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(JSON.stringify({ token: `${payload}:${sig}` }));
  });
};
