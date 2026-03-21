const multer = require('multer');
const multerS3 = require('multer-s3');
const s3Client = require('../config/s3');

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'image' && !file.mimetype.startsWith('image/')) {
        return cb(new Error('Invalid file type: Images must be format image/*'), false);
    }
    cb(null, true);
};

const upload = multer({
    fileFilter,
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_S3_BUCKET || 'dummy-plm-bucket',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const timestamp = Date.now().toString();
            const fileName = `${timestamp}-${file.originalname}`;
            cb(null, `products/${fileName}`);
        }
    })
});

module.exports = upload;
