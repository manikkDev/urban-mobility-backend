require('dotenv').config();
const app = require('./app');
const { initializeFirebase } = require('./config/firebase');

const PORT = process.env.PORT || 5000;

initializeFirebase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
