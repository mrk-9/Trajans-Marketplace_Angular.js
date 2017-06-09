import * as mongoose from 'mongoose';

let Upload = mongoose.model('Upload');

export default {
    getImageById,
    makeImagePrimary,
    updateImageLocalPath
};

async function getImageById(id) {
    return await Upload.findById(id);
}

async function makeImagePrimary(imageId) {
    let image = await getImageById(imageId);

    image.primaryImage = true;

    return await image.save();
}

async function updateImageLocalPath(path, localPath) {
    let query = {
        path: path
    };

    return await Upload.findOneAndUpdate(query, {
        localPath: localPath
    });
}