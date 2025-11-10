const createProxyMiddleware = require('http-proxy-middleware');
const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:5145';

const context = [
    "/weatherforecast",
    "/api/rol",
    "/api/categoria",
    "/api/usuario",
    "/api/producto",
    "/api/venta",
    "/api/utilidad",
    "/api/session",
    "/api/session/Login",
    "/api/session/crear",
    "/api/cliente",
    "/api/cliente/lista",
    "/api/cliente/guardar",
    "/api/cliente/editar",
    "/api/cliente/eliminar",
    "/api/cliente/obtener"
];

module.exports = function (app) {
    const appProxy = createProxyMiddleware(context, {
        target: target,
        secure: false
    });

    app.use(appProxy);
};