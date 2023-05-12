const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const socketIO = require('./socket');
const {
    socketController
} = require('./controllers');



let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
    logger.info('Connected to MongoDB');
    server = app.listen(config.port, () => {
        logger.info(`Listening to port ${config.port}`);
    });

    socketIO.init(server);

    socketIO.getIO().on('connection', (socket) => {
        logger.info('a user connected');

        socketController.getParamsOfServer({
            socket: socket,
            io: socketIO.getIO()
        });

        socketController.disconnection({
            socket: socket,
            io: socketIO.getIO()
        });
        socketController.createRoom({
            socket: socket,
            io: socketIO.getIO()
        });
        socketController.joinRoom({
            socket: socket,
            io: socketIO.getIO()
        });
        socketController.respondToStepOfRoom({
            socket: socket,
            io: socketIO.getIO()
        });
        socketController.makeStepGameOfRoom({
            socket: socket,
            io: socketIO.getIO()
        });
        socketController.lauchGame({
            socket: socket,
            io: socketIO.getIO()
        });
        socketController.addNewConnectedGame({
            socket: socket,
            io: socketIO.getIO()
        });
    });

});