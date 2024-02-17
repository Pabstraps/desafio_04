import express from 'express';
import __dirname from './utils.js';
import productsRoutes, { products } from './routes/products.routes.js';
import cartsRoutes from './routes/carts.routes.js';
import handlebars from 'express-handlebars';
import {Server} from 'socket.io';


const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get('/ping', (req, res) => {
    console.log(__dirname);
    res.send({ status: "ok" })
});

app.get('/', (req, res) => {
    // Aquí puedes pasar los productos a la vista
    res.render('home', { products });
});


app.use(express.static(__dirname + '/public/'));

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);



const httpServer = app.listen(PORT, () => {
    console.log(`Server run on port ${PORT}`);
});

const socketServer = new Server(httpServer);

socketServer.on('connection', socket => {
    console.log ('nuevo cliente conectado');
})
