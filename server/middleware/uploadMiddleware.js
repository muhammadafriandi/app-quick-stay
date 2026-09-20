import multer from "multer"


const storage = multer.diskStorage({})
const upload = multer({ storage, limits: { files: 4, fileSize: 5 * 1024 * 1024 } })

export default upload
