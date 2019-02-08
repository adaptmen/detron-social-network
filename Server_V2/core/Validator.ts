import AppTypes from './AppTypes';


export default class Validator {

	public validate(str, params): (AppTypes.SUCCESS) 
	| (AppTypes.ERROR_MIN_LENGTH)
	| (AppTypes.ERROR_MAX_LENGTH)
	| (AppTypes.ERROR_MATCH) {
		let result;
		if (params.min) {
			this.minLength(str, params.min) == AppTypes.SUCCESS
			? result = AppTypes.SUCCESS
			: result = AppTypes.ERROR_MIN_LENGTH
		}
		if (params.max) {
			this.maxLength(str, params.max) == AppTypes.SUCCESS
			? result = AppTypes.SUCCESS
			: result = AppTypes.ERROR_MAX_LENGTH
		}
		if (params.match) {
			this.match(str, params.match) == AppTypes.SUCCESS
			? result = AppTypes.SUCCESS
			: result = AppTypes.ERROR_MATCH
		}
		return result;
	}

	public minLength(str, len) {
		if (str.length >= len) {
			return AppTypes.SUCCESS;
		}
		else {
			return AppTypes.ERROR;
		}
	}

	public maxLength(str, len) {
		if (str.length <= len) {
			return AppTypes.SUCCESS;
		}
		else {
			return AppTypes.ERROR;
		}
	}

	public match(str, regex) {
		if (str.match(regex)) {
			return AppTypes.SUCCESS;
		}
		else {
			return AppTypes.ERROR;
		}
	}

}