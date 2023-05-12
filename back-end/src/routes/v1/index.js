const express = require('express');
const config = require('../../config/config');
const roomsRoute = require('./rooms.route');
const usersRoute = require('./users.route');

const router = express.Router();

const defaultRoutes = [{
    path: '/rooms',
    route: roomsRoute
}, {
    path: '/users',
    route: usersRoute
}];

const devRoutes = [
    //     {
    //   path: '/docs',
    //   route: express.Router()
    //   // route: docsRoute,
    // }, 
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
    devRoutes.forEach((route) => {
        router.use(route.path, route.route);
    });
}

module.exports = router;