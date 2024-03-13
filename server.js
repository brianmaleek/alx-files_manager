import express from 'express';
import routes from './routes/index';

const app = express();

const PORT = process.env.PORT || 5000;

// load routes
app.use(express.json());
app.use(routes);

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
