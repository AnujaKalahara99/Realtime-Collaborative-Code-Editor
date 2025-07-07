const express = require('express');
const bodyParser = require('body-parser');
dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT | 3000;

app.use(bodyParser.json());

app.post('/run', (req, res) => {
  const { code, input } = req.body;

  try {
    const fn = new Function('input', code);
    const output = fn(input);
    res.json({ success: true, output: output.toString() });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
