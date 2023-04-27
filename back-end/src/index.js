const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const {
    gameController
} = require('./controllers');



let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
    logger.info('Connected to MongoDB');
    server = app.listen(config.port, () => {
        logger.info(`Listening to port ${config.port}`);
    });



    const io = require('socket.io')(server, {
        cors: {
            origins: ['http://localhost:4200']
        }
    });

    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
        socket.on('emit_test', (msg) => {
            io.emit('receive_test', `server: ${msg}`);
        });

        gameController.createRoom({
            io: io,
            socket: socket
        });
    });

});