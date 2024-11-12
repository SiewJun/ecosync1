const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import socket.io
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./models'); // Assuming you have a sequelize instance

const app = express();
const server = http.createServer(app); // Create an HTTP server

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true
  }
});

const authRoutes = require('./routes/auth');
const companyAuthRoutes = require('./routes/companyAuth');
const companyDetailsProfile = require('./routes/companyDetailsProfile');
const consumerProfile = require('./routes/consumerProfile');
const companyServices = require('./routes/companyServices');
const communicationRoutes = require('./routes/communication')(io); // Pass io to the router
const companyPublicProfile = require('./routes/companyPublicProfile');
const quotation = require('./routes/quotation');
const getEstimate = require('./routes/getEstimate');
const project = require('./routes/project');
const projectStep = require('./routes/projectStep');
const stripe = require('./routes/stripe');
const adminModeration = require('./routes/adminModeration');
const superAdminModeration = require('./routes/superAdminModeration');
const maintenance = require('./routes/maintenance');

dotenv.config();

// Session store configuration
const sessionStore = new SequelizeStore({
  db: sequelize,
});

app.use(session({
  secret: process.env.SESSION_SECRET, // Use a strong secret
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

sessionStore.sync(); // Sync the session store with the database

// Stripe webhook route should be defined before any middleware that parses the request body
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), stripe);

// Apply other middleware for all other routes
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to EcoSync API');
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/auth', companyAuthRoutes);
app.use('/api/company', companyDetailsProfile);
app.use('/api/consumer', consumerProfile);
app.use('/api/company-services', companyServices);
app.use('/api/communication', communicationRoutes); // Use the communication routes
app.use('/api/companypublic', companyPublicProfile);
app.use('/api/quotation', quotation);
app.use('/api/get-estimate', getEstimate);
app.use('/api/project', project);
app.use('/api/project-step', projectStep);
app.use('/api/stripe', stripe);
app.use('/api/admin-moderation', adminModeration);
app.use('/api/superadmin-moderation', superAdminModeration);
app.use('/api/maintenance', maintenance); 

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('sendMessage', (message) => {
    io.emit('receiveMessage', message); // Broadcast the message to all connected clients
  });
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});