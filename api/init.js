const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let userid, username;

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8');
    const data = JSON.parse(raw);
    userid = data.userid;
    username = data.username;
  } catch {
    return res.status(400).end();
  }

  if (!userid || !username) return res.status(400).end();

  const exp = Date.now() + 20000;
  const payload = `${userid}:${username}:${exp}`;
  const sig = crypto.createHmac('sha256', process.env.HWID_SECRET).update(payload).digest('hex');

  res.setHeader('Content-Type', 'application/json');
  res.status(200).end(JSON.stringify({ token: `${payload}:${sig}` }));
};
