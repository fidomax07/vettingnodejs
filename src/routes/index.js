const router = require('express').Router();
const authRoutes = require('./auth.route');
const homeRoutes = require('./home.route');
const userRoutes = require('./user.route');

const routeGroups = [
  { prefix: '/', routes: authRoutes },
  { prefix: '/', routes: homeRoutes },
  { prefix: '/user', routes: userRoutes }
];

routeGroups.forEach((group) => router.use(group.prefix, group.routes));

module.exports = router;
