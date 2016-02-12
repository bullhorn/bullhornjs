export class Cache {
	static put(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
		return value;
	}

    static get(key){
		let value = localStorage.getItem(key);
		if(value){
			return JSON.parse(value);
		}
		return null;
	}

    static has(key){
		let value = localStorage.getItem(key);
		if(value){
			return JSON.parse(value);
		}
		return false;
	}
}
