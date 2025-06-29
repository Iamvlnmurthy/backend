// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001; // Backend will run on port 3001

// MongoDB URI from the user
const mongoURI = 'mongodb+srv://iamvlnmurthy:trijesta123@vlncontacts.1fhew3l.mongodb.net/';

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process if MongoDB connection fails
    });

// Middleware
app.use(cors({
    origin: 'https://frontend-git-master-vlnmurthys-projects.vercel.app' // Allow requests from your React frontend (default Vite port)
    // In a production environment, replace with your frontend's actual domain
}));
app.use(bodyParser.json()); // To parse JSON request bodies

// --- MongoDB Schemas and Models ---

// Contact Schema
const contactSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true }, // Custom ID, mimic frontend generation for consistency
    name: { type: String, required: function() { return this.purpose !== 'teaStall'; } }, // Name not required for tea stall contacts directly
    phone: { type: String, required: function() { return this.purpose === 'teaStall'; } }, // Phone required for tea stall contacts
    email: String,
    company: String,
    address: String,
    city: String,
    state: String,
    district: String,
    location: String,
    nativeLanguage: String,
    purpose: { type: String, enum: ['general', 'distributor', 'influencer', 'political', 'celebrity', 'serviceProvider', 'customer', 'teaStall', 'shops'], default: 'general' },
    remarks: String,
    notes: String,
    x_twitter: String,
    xTwitterProfileName: String,
    xTwitterFollowers: Number,
    facebook: String,
    facebookProfileName: String,
    facebookFollowers: Number,
    youtube: String,
    youtubeChannelName: String,
    youtubeFollowers: Number,
    instagram: String,
    instagramProfileName: String,
    instagramFollowers: Number,
    paMobileNumber: String,
    constituency: String,
    politicalPartyName: String,
    managerMobileNumber: String,
    profession: String,
    serviceType: String,
    serviceContactPerson: String,
    lastInteractionDate: String, // Stored as ISO string
    contractDetails: String,
    teaStallCode: { type: String, required: function() { return this.purpose === 'teaStall'; } },
    teaStallName: { type: String, required: function() { return this.purpose === 'teaStall'; } },
    teaStallOwnerName: { type: String, required: function() { return this.purpose === 'teaStall'; } },
    teaStallMobileNumber: { type: String, required: function() { return this.purpose === 'teaStall'; } },
    teaStallArea: String,
    teaStallMandal: String,
    teaStallTeaPowderPrice: Number,
    teaStallOtherSellingItems: String,
    shopName: { type: String, required: function() { return this.purpose === 'shops'; } },
    shopOwnerName: { type: String, required: function() { return this.purpose === 'shops'; } },
    shopContactNumber: { type: String, required: function() { return this.purpose === 'shops'; } },
    shopCategory: { type: String, required: function() { return this.purpose === 'shops'; } },
    shopAddress: { type: String, required: function() { return this.purpose === 'shops'; } },
    shopVillage: { type: String },
    shopMandal: { type: String },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

const Contact = mongoose.model('Contact', contactSchema);

// Product Schema
const productSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true }, // Custom ID
    productName: { type: String, required: true },
    category: { type: String, required: true },
    supplierName: { type: String, required: true },
    supplierAddress: String,
    supplierContactNumber: String,
    supplierLocation: String,
    wholesalePrice: { type: Number, required: true },
    wholesalePriceUnit: { type: String, enum: ['unit', 'kg', 'litre'], default: 'unit' },
    retailPrice: { type: Number, required: true },
    retailPriceUnit: { type: String, enum: ['unit', 'kg', 'litre'], default: 'unit' },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

// Backup Schema - stores stringified JSON of collections
const backupSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true }, // Custom ID
    timestamp: { type: Date, default: Date.now },
    contacts: { type: String, required: true }, // Stringified JSON array of contacts
    products: { type: String, required: true }, // Stringified JSON array of products
    contactCount: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 }
});

const Backup = mongoose.model('Backup', backupSchema);

// MyLinks Schema
const myLinkSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true }, // Custom ID
    name: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String },
    username: { type: String }, // Optional username
    password: { type: String }, // Optional password
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const MyLink = mongoose.model('MyLink', myLinkSchema);

// --- API Routes ---

// Contacts API
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ name: 1 }); // Sort by name
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/contacts', async (req, res) => {
    try {
        const newContactData = req.body;
        // Generate a new unique ID for the document
        newContactData.id = newContactData.id || `contact_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const newContact = new Contact(newContactData);
        await newContact.save();
        res.status(201).json(newContact);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/contacts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedContact = await Contact.findOneAndUpdate({ id: id }, req.body, { new: true });
        if (!updatedContact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.json(updatedContact);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/contacts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Contact.deleteOne({ id: id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.json({ message: 'Contact deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Products API
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ productName: 1 }); // Sort by product name
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProductData = req.body;
        // Generate a new unique ID for the document
        newProductData.id = newProductData.id || `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const newProduct = new Product(newProductData);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findOneAndUpdate({ id: id }, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Product.deleteOne({ id: id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Backups API
app.get('/api/backups', async (req, res) => {
    try {
        // Fetch and sort backups by timestamp descending
        const backups = await Backup.find().sort({ timestamp: -1 });
        res.json(backups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/backups', async (req, res) => {
    try {
        // Frontend will send stringified JSON for contacts and products
        const backupData = req.body;
        backupData.id = backupData.id || `backup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`; // Generate unique ID
        const newBackup = new Backup(backupData);
        await newBackup.save();
        res.status(201).json(newBackup);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// MyLinks API
app.get('/api/mylinks', async (req, res) => {
    try {
        const links = await MyLink.find().sort({ name: 1 });
        res.json(links);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/mylinks', async (req, res) => {
    try {
        const newLinkData = req.body;
        newLinkData.id = newLinkData.id || `link_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const newLink = new MyLink(newLinkData);
        await newLink.save();
        res.status(201).json(newLink);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/mylinks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedLink = await MyLink.findOneAndUpdate({ id: id }, req.body, { new: true });
        if (!updatedLink) {
            return res.status(404).json({ message: 'Link not found' });
        }
        res.json(updatedLink);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/mylinks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await MyLink.deleteOne({ id: id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Link not found' });
        }
        res.json({ message: 'Link deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`To access API: http://localhost:${PORT}/api/contacts`);
});

/*
To set up and run this Node.js/Express backend:

1.  **Create a new directory** for your backend project (e.g., `vln-crm-backend`).
2.  **Navigate into this directory** in your terminal: `cd vln-crm-backend`
3.  **Initialize a Node.js project:** `npm init -y`
4.  **Install necessary packages:** `npm install express mongoose cors body-parser`
5.  **Create a file named `server.js`** inside your `vln-crm-backend` directory and copy the code above into it.
6.  **Run the server:** `node server.js`

You should see "MongoDB connected successfully!" and "Server running on port 3001" in your terminal. This means your backend is ready to accept requests from the frontend.

*/
