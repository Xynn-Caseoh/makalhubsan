const micro = require('micro');
const { send } = micro;

const handler = async (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  send(res, 200, `print("Hello")`);
};

const server = micro(handler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Micro server running on port ${PORT}`);
});
