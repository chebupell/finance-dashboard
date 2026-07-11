import app from './src/app';
import 'dotenv/config';

const PORT = Number(process.env.PORT) || 3000;

// Git Bash / MINGW64 can close stdin and exit Node unless we keep it open.
process.stdin.resume();

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Waiting for requests...');
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT to another value.`);
  } else {
    console.error('Failed to start server:', error);
  }
  process.exit(1);
});
