import helper from './_controllerHelper';
import categoryRepository from '../repositories/categoryRepository';

export default {
    getAllCategories,
    getPrimaryCategory,
    getSecondaryCategory,
    getTertiaryCategory
};

async function getAllCategories(req, res) {
	try {
		let categories = await categoryRepository.getList();

		helper.sendData(categories, res);
	} catch (err) {
		helper.sendFailureMessage(err, res);
	}
}

async function getPrimaryCategory(req, res, next, primaryCategory) {
    try {
        let category = await categoryRepository.getPrimaryCategoryByAlias(primaryCategory);

        helper.sendData(category, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

async function getSecondaryCategory(req, res, next, secondaryCategory){
    try {
        let category = await categoryRepository.getSecondaryCategoryByAlias(secondaryCategory);

        helper.sendData(category, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

async function getTertiaryCategory(req, res, next, tertiaryCategory){
    try {
        let category = await categoryRepository.getTertiaryCategoryByAlias(tertiaryCategory);

        helper.sendData(category, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}