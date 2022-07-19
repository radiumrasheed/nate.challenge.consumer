import cors from 'cors';
import express, {Response} from 'express';
import bodyParser from 'body-parser';
import {PRODUCTS} from './products';
import {executePurchase} from './lib/purchase-api';

const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

app.get('/products', (_, res: Response) => {
  res.send(PRODUCTS)
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`)
});
