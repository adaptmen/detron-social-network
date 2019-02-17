import DbContext from '../core/DbContext';
import AppTypes from '../core/AppTypes';


export default class AccessHelper {

	public dbContext: DbContext;

	constructor(dbContext: DbContext) {
		this.dbContext = dbContext;
	}

	public parseObjType(obj_fid: string): any {
		var parseFun = (object_fid, regex) => String(object_fid).match(regex);
		if (parseFun(obj_fid, /(wall)_([^.]+)/)) {
			return { 
				type: AppTypes.WALL,
				id: parseFun(obj_fid, /(wall)_([^.]+)/)[2]
			}
		}
		else if (parseFun(obj_fid, /(chat)_([^.]+)/)) {
			return { 
				type: AppTypes.CHAT,
				id: parseFun(obj_fid, /(chat)_([^.]+)/)[2]
			}
		}
		else if (parseFun(obj_fid, /(user)_([^.]+)/)) {
			return { 
				type: AppTypes.USER,
				id: parseFun(obj_fid, /(user)_([^.]+)/)[2]
			}
		}
		else {
			return AppTypes.ERROR;
		}
	}

	public checkFileExt(ext: string) {
		let ACCESS_LIST = [
			'png', 'jpeg', 'jpg',
			'pdf', 'gif', 'mp3',
			'3gp', 'avi', 'mkv',
			'doc', 'docx', 'rar',
			'zip', 'odf', 'ods',
			'odp', 'blend', 'mp4',
			'tar', 'gzip', 'webp',
			'psd', 'gz', '7z',
			'ogg', 'exe', 'ico',
			'rpm', 'deb', 'cab',
			'pptx', 'ics', 'xml',
			'eot', 'ttf', 'otf'];
		return ACCESS_LIST.includes(ext)
		? AppTypes.ACCESS
		: AppTypes.DENIED;
	}

	public checkExist(obj_fid) {
		var p_obj = this.parseObjType(obj_fid);
		return new Promise((resolve, reject) => {
			if (p_obj == AppTypes.ERROR) resolve(AppTypes.ERROR);
			else if (p_obj == AppTypes.USER) {
				this
				.dbContext
				.userProvider
				.checkExistById(p_obj.id)
				.then((res) => {
					if (res == AppTypes.EXIST) return resolve(AppTypes.EXIST);
					else resolve(AppTypes.NOT_EXIST);
				});
			}
			else if (p_obj == AppTypes.WALL) {
				this
				.dbContext
				.wallProvider
				.checkExist(p_obj.id)
				.then((res) => {
					if (res) return resolve(AppTypes.EXIST);
					else resolve(AppTypes.NOT_EXIST);
				});
			}
			else if (p_obj == AppTypes.CHAT) {
				this
				.dbContext
				.messageProvider
				.checkChatExist(p_obj.id)
				.then((res) => {
					if (res == AppTypes.EXIST) return resolve(AppTypes.EXIST);
					else resolve(AppTypes.NOT_EXIST);
				});
			}
		});
	}

	public checkOwner(obj_fid, user_id): Promise<AppTypes.ERROR | AppTypes.ACCESS | AppTypes.DENIED> {
		let p_obj = this.parseObjType(obj_fid);
		return new Promise((resolve, reject) => {
			if (p_obj == AppTypes.ERROR) return AppTypes.ERROR;
			else if (p_obj == AppTypes.USER) {
				if (p_obj.id == user_id) return AppTypes.SUCCESS;
				else return AppTypes.DENIED;
			}
			else if (p_obj == AppTypes.WALL) {
				this
				.dbContext
				.wallProvider
				.checkAttacher(p_obj.id, `users:user_${user_id}`)
				.then((res) => {
					res ? resolve(AppTypes.ACCESS) : resolve(AppTypes.DENIED);
				});
			}
		});
	}

}