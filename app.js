const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// API REST
const indexCliente = require('./routes/cliente');
const indexTransacao = require('./routes/transacao');
const indexRelatorio = require('./routes/relatorio');
//

// WEB URL
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const indexDashboard = require('./routes/app/dashboard');
const indexLogin = require('./routes/app/login');
const indexPerfil = require('./routes/app/perfil');
const indexRegistrar = require('./routes/app/registrar');
const indexRelatorios = require('./routes/app/relatorios');
const indexTransacoes = require('./routes/app/transacoes');
//

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//api
app.use('/', indexRouter);
app.use('/cliente', indexCliente);
app.use('/transacao', indexTransacao);
app.use('/relatorio', indexRelatorio);
app.use('/users', usersRouter);

//web
app.use('/dashboard', indexDashboard);
app.use('/login', indexLogin);
app.use('/perfil', indexPerfil);
app.use('/registrar', indexRegistrar);
app.use('/relatorios', indexRelatorios);
app.use('/transacoes', indexTransacoes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
