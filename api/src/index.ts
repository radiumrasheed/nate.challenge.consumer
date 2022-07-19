import cors from 'cors';
import express, {Response} from 'express';
import bodyParser from 'body-parser';
import {PRODUCTS} from './products';
import {executePurchase} from './lib/purchase-api';

const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

// using GET so I test easily on the browser, ideally, should be a POST
app.get('/products/:productId/purchase', async (req, res: Response) => {
  // ideally user is got from `req.user` & payment method from POST body
  const purchase = await executePurchase('', +req.params.productId, '');
  res.send(purchase)
});

app.get('/products', (_, res: Response) => {
  res.send(PRODUCTS)
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`)
});
