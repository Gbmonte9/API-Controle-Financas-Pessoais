const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
    res.render('dashboard', { title: 'Dashboard'});
});

module.exports = router;