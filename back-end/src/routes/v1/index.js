const express = require('express');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [{
    path: '/',
    route: express.Router()
        // route: authRoute,
}, {
    path: '/auth',
    route: express.Router()
        // route: authRoute,
}, ];

const devRoutes = [{
    path: '/docs',
    route: express.Router()
        // route: docsRoute,
}, ];

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