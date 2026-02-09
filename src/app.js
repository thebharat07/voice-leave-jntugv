const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');



dotenv.config();


const app = express();

/* ------------------ Global Middlewares ------------------ */

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: {policy: 'cross-origin'}
}));

// Logging (dev = colorful, prod = concise)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS
app.use(cors());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ------------------ Routes ------------------ */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


const { requireAdmin, requireAuth } = require('./middleware/middleware');
const adminRoutes = require('./routes/adminroutes');
const userRoutes = require('./routes/userRoutes');

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// Node.js / Express
app.get('/auth/reset-password', (req, res) => {
    // Supabase sends tokens as a fragment (#) or query params (?)
    // We want to pass everything forward to the app
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>VoiceLeave Password Reset</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #F6F7FB; margin: 0; }
                .card { background: white; padding: 2rem; border-radius: 20px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 90%; }
                .button { background: #3f51b5; color: white; padding: 15px 25px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: bold; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>VoiceLeave JNTUGV</h2>
                <p>Click the button below to open the app and reset your password.</p>
                <a id="reset-button" class="button" href="#">Open VoiceLeave App</a>
            </div>

            <script>
                // Get the current URL parameters and fragments
                const currentUrl = window.location.href;
                const urlParts = currentUrl.split('/auth/reset-password');
                const params = urlParts[1]; // This captures everything after the route

                // Construct the Deep Link
                const deepLink = "voiceleave://reset-password" + params;
                
                // Set the button link
                document.getElementById('reset-button').href = deepLink;

                // Optional: Automatically try to redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = deepLink;
                }, 2000);
            </script>
        </body>
        </html>
    `);
});


/* ------------------ Server ------------------ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
