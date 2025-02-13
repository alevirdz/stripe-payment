const app = require('./app.js');
const PORT = app.get('port');

app.listen(PORT, () => {
    console.log(`[server] listening to port: ${PORT}`);
});