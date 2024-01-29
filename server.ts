import app from './app';
import { connectDB } from './db/db';

const port = Bun.env.PORT || 5000;
const url = Bun.env.URL || 'http://127.0.0.1';

const startServer = async () => {
  try {
    await connectDB(Bun.env.MONGO_URI as string);
    app.listen(port, () =>
      console.log(`The server is running on: ${url}:${port}`)
    );
  } catch (error) {
    console.log(error);
  }
};

await startServer();
