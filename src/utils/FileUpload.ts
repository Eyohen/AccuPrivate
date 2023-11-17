import multer from 'multer';
import cloudinary from 'cloudinary'
import {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
} from './Constants';
import { randomUUID } from 'crypto';
import Partner from '../models/Entity/Profiles/PartnerProfile.model';
import Entity from '../models/Entity/Entity.model';

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

    private static async uploadToCloudinary(fileOptions: ICloudinaryFileOptions) {
        const {
            path, fileName, destinationPath
        } = fileOptions;

        if (!path || !fileName || !destinationPath) {
            throw new Error('Invalid file options');
        }

        cloudinary.v2.config({
            cloud_name: CLOUDINARY_CLOUD_NAME,
            api_key: CLOUDINARY_API_KEY,
            api_secret: CLOUDINARY_API_SECRET
        });

        const data = await cloudinary.v2.uploader.upload(path, {
            folder: destinationPath,
            public_id: fileName,
            resource_type: 'auto'
        });

        return data.secure_url
    }

    static async uploadProfilePicture({ filePath, entity }: { filePath: string, entity: Entity }): Promise<string> {
        const path = filePath,
            fileName = `${randomUUID()}.jpg`,
            destinationPath = `profilepictueres/${entity.id}`

        const secureUrl = await this.uploadToCloudinary({
            path,
            fileName,
            destinationPath
        })

        return secureUrl;
    }
}

export default FileUploadService;