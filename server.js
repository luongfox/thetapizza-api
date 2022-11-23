import './boostrap.js';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

const PORT = 3000;
const HOST = '0.0.0.0';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: '*' }));
app.use('/v1', apiRoutes);
app.use(express.static('public'));

app.listen(PORT, HOST, () => {
  console.log(`ThetaPizza-API serving on http://${HOST}:${PORT}`);
});