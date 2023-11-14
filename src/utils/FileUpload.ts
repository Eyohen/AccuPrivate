import multer from 'multer';
import cloudinary from 'cloudinary'
import {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
} from './Constants';
import { randomUUID } from 'crypto';
import Partner from '../models/Partner.model';

interface ICloudinaryFileOptions {
    path: string;
    fileName: string;
    destinationPath: string;
}

class FileUploadService {
    static multerUpload = multer({
        storage: multer.diskStorage({
            destination: 'src/uploads',
            filename: (req, file, cb) => {
                cb(null, randomUUID() + file.originalname);
            }
        })
    });

    private static cloudinary = cloudinary.v2.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET
    });

    private static async uploadToCloudinary(fileOptions: ICloudinaryFileOptions) {
        const {
            path, fileName, destinationPath
        } = fileOptions;

        if (!path || !fileName || !destinationPath) {
            throw new Error('Invalid file options');
        }

        const data = await this.cloudinary.upload(path, {
            folder: destinationPath,
            public_id: fileName,
            resource_type: 'auto'
        });

        return data.secure_url
    }

    static async uploadProfilePicture({ filePath, partner }: { filePath: string, partner: Partner }): Promise<string> {
        const path = filePath,
            fileName = `${randomUUID()}.jpg`,
            destinationPath = `profilepictueres/${partner.id}`

        const secureUrl = await this.uploadToCloudinary({
            path,
            fileName,
            destinationPath
        })

        return secureUrl;
    }
}

export default FileUploadService;