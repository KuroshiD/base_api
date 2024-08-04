import cluster from 'cluster';
import app from './api/app';
import env from './env';

const { port, nginx_port, clusters } = env;


const logServerStatus = (port: number, nginxPort: number) => {

    type uMap = { [key: number]: string }

    const urlMap: uMap = {
        80: 'http://localhost',
        443: 'https://localhost'
    };

    const baseURL = urlMap[nginxPort] || `http://localhost:${port}`;

    console.log(`Server is running on ${baseURL}`);
};

const startWorker = () => {
    app.listen(port, () => console.log('starting worker...'));
}

const startMaster = () => {
    logServerStatus(port, nginx_port)
    Array.from({ length: clusters }).forEach(() => cluster.fork());

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with exit code ${code} and signal ${signal}`);
        console.log('Starting a new worker');
        cluster.fork(); 
    });
}

const isPrimary = cluster.isPrimary;

if(isPrimary) startMaster();

if(!isPrimary) startWorker();