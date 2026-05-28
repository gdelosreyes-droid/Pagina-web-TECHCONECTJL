const express = require('express');
const app = express();
// Inicializa Stripe con tu clave secreta de prueba
const stripe = require('stripe')('TU_CLAVE_SECRETA_SK_TEST_AQUÍ');

app.use(express.json());

app.post('/api/create-checkout-session', async (req, res) => {
    try {
        // Aquí recibirás los productos que el usuario tiene en el carrito
        const { productos } = req.body;

        // Mapeamos tus productos al formato que exige Stripe
        const line_items = productos.map(item => ({
            price_data: {
                currency: 'eur', // Moneda (ej: eur, usd)
                product_data: {
                    name: item.nombre, // Nombre del producto o "Total Carrito"
                },
                unit_amount: item.precio * 100, // Stripe trabaja en céntimos (ej: 10€ = 1000)
            },
            quantity: item.cantidad,
        }));

        // Creamos la sesión de Stripe Checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            // Direcciones a las que volverá el cliente tras pagar o cancelar
            success_url: 'http://localhost:3001/exito.html',
            cancel_url: 'http://localhost:3001/carrito.html',
        });

        // Devolvemos la URL generada por Stripe al frontend
        res.json({ url: session.url });
    } catch (error) {
        console.error("Error al crear la sesión de Stripe:", error);
        res.status(500).json({ error: error.message });
    }
});