const multer = require("multer");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const dateNow = new Date().toLocaleString().replace(/[/,:\s]/g, "-"); // Format the date and replace invalid characters
    cb(null, `${dateNow}-${file.originalname}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
