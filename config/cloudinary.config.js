const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let folderName = 'gallery';
    let resourceType = 'auto';
    
    if (file.mimetype.startsWith('video/')) {
      folderName = 'video-gallery';
    } else if (file.mimetype.startsWith('image/')) {
      folderName = 'photo-gallery';
    } else if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      folderName = 'documents';
      resourceType = 'raw';
    }

    return {
      folder: folderName,
      resource_type: resourceType,
    };
  },
});


module.exports = multer({ storage });