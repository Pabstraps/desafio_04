import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import __dirname from '../utils.js'

const router = Router();

// Rutas a los archivos JSON
const productsFilePath = path.join(__dirname, './files/products.json');
const cartsFilePath = path.join(__dirname, './files/carts.json');

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Función para leer el contenido del archivo JSON
const readJSONFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error al leer el archivo JSON ${filePath}:`, error);
        return [];
    }
};

// Función para escribir el contenido en el archivo JSON
const writeJSONFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        console.log(`Datos escritos en el archivo JSON ${filePath} correctamente.`);
    } catch (error) {
        console.error(`Error al escribir en el archivo JSON ${filePath}:`, error);
    }
};

// Ruta para agregar un producto al carrito
router.post('/:cid', (req, res) => {
    const { cid } = req.params;
    
    let products = readJSONFile(productsFilePath);
    let carts = readJSONFile(cartsFilePath);

    const product = products.find(p => p.id === parseInt(cid));
    if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    const existingCartItemIndex = carts.findIndex(cart => cart.items.some(item => item.productId === product.id));
    if (existingCartItemIndex !== -1) {
        carts[existingCartItemIndex].items.find(item => item.productId === product.id).quantity++;
    } else {
        const cartId = generateUniqueId();
        const cart = { id: cartId, items: [{ productId: product.id, quantity: 1 }] };
        carts.push(cart);
    }

    writeJSONFile(cartsFilePath, carts);

    res.status(200).json({ status: "Success", message: "Producto agregado al carrito"});
});

// Ruta para mostrar los productos del carrito
router.get('/:cid', (req, res) => {
    const cartId = req.params.cid;
    
    const carts = readJSONFile(cartsFilePath);
    const cart = carts.find(cart => cart.id === cartId);
 
    if (!cart) {
        return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }
    const productsInCart = [];

    cart.items.forEach(item => {
        const product = readJSONFile(productsFilePath).find(product => product.id === item.productId);
        if (product) {
            productsInCart.push({ ...product, quantity: item.quantity });
        }
    });

    res.status(200).json({ status: "success", products: productsInCart });
});


router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;

    let carts = readJSONFile(cartsFilePath);

    const cartIndex = carts.findIndex(cart => cart.id === cid);
    if (cartIndex === -1) {
        return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }
    const productToAdd = {
        productId: pid,
        quantity: 1 
    };
    
    carts[cartIndex].items.push(productToAdd);
   
    writeJSONFile(cartsFilePath, carts);

    res.status(200).json({ status: "success", message: "Producto agregado al carrito" });
});





export default router;
