import multer from "multer";

// Multer config 
const storage = multer.memoryStorage();
const upload = multer({
  storage,
});

export default upload;
