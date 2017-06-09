import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

let CategorySchema = new Schema({
	alias: {
		type: String
	},
	title: {
		type: String
	},
	end : {
		type : Boolean,
		default : true
	}
});

module.exports = mongoose.model('Category', CategorySchema);
