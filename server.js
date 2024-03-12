import express from 'express';
import routes from './routes/index';

const PORT = process.env.PORT || 5000;

const app = express();

// load routes
app.use(express.json());
app.use('/', routes);

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
