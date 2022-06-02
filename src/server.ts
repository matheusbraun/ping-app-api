import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.send('Running!').sendStatus(200);
});

app.post('/api/v1/url/ping', async (req, res) => {
  const { url, assertion } = req.body;

  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url);

  try {
    await page.waitForXPath(`//*[contains(text(), "${assertion}")]`, {
      timeout: 1500,
    });
  } catch (err) {
    await browser.close();
    res.sendStatus(500);
    return;
  }

  await browser.close();

  res.sendStatus(200);
});

app.listen(process.env.PORT || 4000, () => console.log('Server running!'));
