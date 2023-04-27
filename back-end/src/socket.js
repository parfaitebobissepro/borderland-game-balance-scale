// //Initialisation socket
// class Socket {
//     constructor(server) {
//         this.server = server;
//         this.io = require('socket.io')(server, {
//             cors: {
//                 origins: ['http://localhost:4200']
//             }
//         });
//     }

//     ioOnConnect = (callback) => this.io.on('connection', (socket) => callback(socket));
//     socketOnConnect = (callback) => this.ioOnConnect((socket) => socket.on('connection', callback));
// }

// // const socketOnConnect = (callback) => io.on('connection', callback);

// module.exports = Socket;