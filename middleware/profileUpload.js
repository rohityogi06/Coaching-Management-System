const multer = require("multer");
const path = require("path");

// Storage
const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, "public/uploads/profile");

    },

    filename: function (req, file, cb) {

        const uniqueName = Date.now() + path.extname(file.originalname);

        cb(null, uniqueName);

    }

});

// File Filter
const fileFilter = (req, file, cb) => {

    const allowedTypes = /jpg|jpeg|png/;

    const ext = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) {

        cb(null, true);

    } else {

        cb(new Error("Only JPG, JPEG and PNG images are allowed"));

    }

};

// Multer Upload
const upload = multer({

    storage: storage,

    limits: {

        fileSize: 2 * 1024 * 1024

    },

    fileFilter: fileFilter

});

module.exports = upload;