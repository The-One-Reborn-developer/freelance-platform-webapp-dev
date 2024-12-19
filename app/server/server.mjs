import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import { servicesRoutes } from "./routes/services.mjs";
import { commonRoutes } from "./routes/common.mjs";
import { deliveryRoutes } from "./routes/delivery.mjs";

// Import websocket server
import { setupWebsocketServer } from "./modules/common_index.mjs";


dotenv.config({ path: '/app/.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static('app/public'));
const attachmentPath = path.join(__dirname, '../chats/attachments');
app.use('/attachments', express.static(attachmentPath));
console.log(`Serving attachments from ${attachmentPath}`);
console.log('Express app created');

app.use('/common', commonRoutes);
app.use('/services', servicesRoutes);
app.use('/delivery', deliveryRoutes);

const httpServer = createServer(app);
const { sendMessageToUser } = setupWebsocketServer(httpServer);
const PORT = process.env.PORT || 3000;

createUsersTable(db);
createBidsTable(db);
createResponsesTable(db);


app.get('/', (req, res) => {
    res.sendFile('app/public/views/index.html', { root: './' });    
});


// 404 Route
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found.' });
});


// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Unexpected server error.' });
});


httpServer.listen(PORT, () => {
    console.log(`HTTPS server started on port ${PORT}`);
});