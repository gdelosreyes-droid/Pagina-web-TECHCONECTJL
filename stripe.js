const express = require('express');
const router = express.Router();
const stripe = require('stripe')('TU_CLAVE_SECRETA_DE_STRIPE_AQUÍ');

// Ruta para crear la sesión de pago con tus productos reales
router.post('/create-checkout-session', async (req, res) => {
    try {
        // Recibimos los productos que el usuario tiene en el carrito desde el frontend
        const { productos } = req.body;

        // Mapeamos el array con las columnas exactas de tu base de datos
        const line_items = productos.map(item => {
            // Fusionamos marca y modelo para el título de Stripe
            const nombreProducto = `${item.marca} ${item.modelo}`;

            // Creamos la descripción con los detalles adicionales
            const descripcionProducto = `Color: ${item.color} | Estado: ${item.estado_grade}`;

            return {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: nombreProducto,
                        description: descripcionProducto,
                    },
                    // Stripe requiere el precio en céntimos enteros (ej: 15.99€ -> 1599)
                    unit_amount: Math.round(item.precio_euro * 100),
                },
                quantity: item.cantidad, // La cantidad de unidades de este producto
            };
        });

        // Creamos la sesión de Stripe con tus artículos
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            // Redirecciones cuando termine el proceso
            success_url: 'http://localhost:8080/exito.html', // Cambia el puerto si tu frontend usa otro
            cancel_url: 'http://localhost:8080/carrito.html',
        });

        // Devolvemos la URL real de Stripe al frontend
        res.json({ url: session.url });

    } catch (error) {
        console.error("Error en la pasarela de Stripe:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;