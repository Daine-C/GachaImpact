export const storageLocal = {
	getData() {
		const data = localStorage.getItem('WishSimulator.App');
		if (!data) return { data: {} };
		const parsed = JSON.parse(data);
		return parsed;
	},

	get(key) {
		const { data } = this.getData();
		return data[key] || {};
	},

	set(key, value) {
		const { data } = this.getData();
		data[key] = value;
		localStorage.setItem('WishSimulator.App', JSON.stringify({ data }));
	},

	initEvent() {
		const localStore = localStorage.setItem;
		localStorage.setItem = function (key) {
			if (key === 'WishSimulator.App') {
				const event = new Event('storageUpdate');
				document.dispatchEvent(event);
			}

			localStore.apply(this, arguments);
		};
	}
};

export const localPity = {
	get(pityBanner) {
		const pity = storageLocal.get('pity');
		return pity[pityBanner] || 0;
	},

	set(pityBanner, value) {
		const pity = storageLocal.get('pity');
		pity[pityBanner] = value;
		storageLocal.set('pity', pity);
	}
};

export const localBalance = {
	all() {
		const balance = storageLocal.get('balance');
		return balance;
	},
	get(currency) {
		const balance = storageLocal.get('balance');
		return balance[currency] || 0;
	},

	set(currency, value) {
		const balance = storageLocal.get('balance');
		balance[currency] = value;
		storageLocal.set('balance', balance);
	}
};

export const purchases = {
	get(bannerName, currency) {
		const balance = storageLocal.get('purchases');
		if (!balance[bannerName]) balance[bannerName] = {};
		return balance[bannerName][currency] || 0;
	},
	set(bannerName, value, currency) {
		const balance = storageLocal.get('purchases') || {};
		if (bannerName){
			if (!balance[bannerName]) balance[bannerName] = {};
			if (!balance[bannerName][currency]) balance[bannerName][currency] = 0;
			balance[bannerName][currency] += value;
		} 
		storageLocal.set('purchases', balance);
	}
};
export const buttons = {
	get(bannerName, type) {
		const count = storageLocal.get('buttons');
		if (!count[bannerName]) count[bannerName] = {};
		return count[bannerName][type] || 0;
	},
	set(bannerName, type) {
		const count = storageLocal.get('buttons') || {};
		if (bannerName) {
			if (!count[bannerName]) count[bannerName] = {};
			if (!count[bannerName][type]) count[bannerName][type] = 0;
			count[bannerName][type] += 1;
		}
		storageLocal.set('buttons', count);
		// for (const banner of bannerList) {
		// 	if (!count[banner.bannerName]) count[banner.bannerName] = {};

		// 	Object.entries(object).forEach(([type, value]) => {
		// 		count[banner.bannerName][type] = value;
		// 	});
		// }
		// storageLocal.set('buttons', count);
	}
};

export const startBalance = {
	get(bannerName) {
		const balance = storageLocal.get('startBalance') || {};
		return balance[bannerName] || null;
	},
	set(bannerName, primos, fates) {
		const balance = storageLocal.get('startBalance') || {};
		balance[bannerName] = { primos, fates }; // Overwrite unconditionally
		storageLocal.set('startBalance', balance);
	}
};

export const endBalance = {
	get(bannerName) {
		const balance = storageLocal.get('endBalance');
		return balance[bannerName] || null;
	},
	set(bannerName, primos, fates, genesis) {
		const balance = storageLocal.get('endBalance') || {};
		const pulls = ((primos + genesis) / 160 | 0) + fates;
		balance[bannerName] = pulls;
		storageLocal.set('endBalance', balance);
	}
}

export const topExp = {
	get(bannerName) {
		const balance = storageLocal.get('topExp');
		return balance[bannerName] || null;
	},
	set(bannerName) {
		const balance = storageLocal.get('topExp') || {};
		if (bannerName) balance[bannerName] = parseFloat(storageLocal.get('expenses')) || 0;
		storageLocal.set('topExp', balance);
	}
}

export const topUp = {
	get(bannerName) {
		const balance = storageLocal.get('topUp') || {};
		if(!balance[bannerName]) {
			balance[bannerName] = {
				"0.99": 0, "4.99": 0, "14.99": 0, "29.99": 0, "49.99": 0, "99.99": 0	
			};
		}
		return balance[bannerName] || null;
	},
	set(bannerName, price) {
		price = price.replace(/[^0-9.]/g, '');
		const balance = storageLocal.get('topUp') || {};
		if (bannerName && !balance[bannerName]) {
			balance[bannerName] = {
				"0.99": 0, "4.99": 0, "14.99": 0, "29.99": 0, "49.99": 0, "99.99": 0	
			};
		} if (bannerName && balance[bannerName].hasOwnProperty(price)) balance[bannerName][price] += 1;
		storageLocal.set('topUp', balance);
	}
}

export const rollCounter = {
	get(banner) {
		const rollCount = storageLocal.get('rollCounter');
		return rollCount[banner] || 0;
	},
	set(banner, rollNumber) {
		if (!banner) return;
		const rollCount = storageLocal.get('rollCounter');
		rollCount[banner] = rollNumber;
		storageLocal.set('rollCounter', rollCount);
	},
	put(banner) {
		if (!banner) return;
		const rollCount = storageLocal.get('rollCounter');
		const before = rollCount[banner] || 0;
		rollCount[banner] = before + 1;
		storageLocal.set('rollCounter', rollCount);
	}
};

export const guaranteedStatus = {
	get(banner) {
		const guaranteedStatus = storageLocal.get('guaranteedStatus');
		return guaranteedStatus[banner] || false;
	},
	set(banner, value) {
		const guaranteedStatus = storageLocal.get('guaranteedStatus');
		guaranteedStatus[banner] = value;
		storageLocal.set('guaranteedStatus', guaranteedStatus);
	}
};

export const localConfig = {
	get(key) {
		const config = storageLocal.get('config');
		const isValue = config[key] !== null;
		return isValue ? config[key] : null;
	},
	set(key, value) {
		const config = storageLocal.get('config');
		config[key] = value;
		storageLocal.set('config', config);
	}
};

export const owneditem = {
	getAll() {
		const items = storageLocal.get('ownedItem');
		return items;
	},

	get(itemID) {
		const db = this.getAll();
		const selected = db[itemID];
		if (!selected) return { qty: 0, itemID };

		const { manual, wish } = selected;
		return { itemID, qty: manual + wish };
	},

	put({ itemID, source = 'wish', qty = 1 }) {
		const allItems = storageLocal.get('ownedItem');
		const { manual = 0, wish = 0 } = allItems[itemID] || {};
		allItems[itemID] = {
			manual: source === 'wish' ? manual : qty + manual,
			wish: source === 'wish' ? qty + wish : wish
		};

		storageLocal.set('ownedItem', allItems);
		return allItems[itemID];
	}
};

export const fatepointManager = {
	getAll() {
		const storedData = storageLocal.get('fatepoint');
		const allPoint = Array.isArray(storedData) ? storedData : [];
		return allPoint;
	},

	restore(data) {
		const localData = this.getAll();
		localData.push(data);
		storageLocal.set('fatepoint', localData);
	},

	init({ version, phase, banner = 'weapon-event' } = {}) {
		this._version = version;
		this._phase = phase;
		this._banner = banner;
		const storedData = storageLocal.get('fatepoint');
		this._db = Array.isArray(storedData) ? storedData : [];
		this._recordIndex = this._db.findIndex(({ phase: p, version: v, banner: b }) => {
			return p === phase && v === version && b === banner;
		});
		return this;
	},

	set(point, selectedIndex, type = 'weapon') {
		const { _recordIndex: i, _version: version, _phase: phase, _db: db, _banner: banner } = this;
		const newData = { version, phase, banner, point, type, selected: selectedIndex };

		if (i < 0) db.push(newData);
		else db[i] = newData;

		storageLocal.set('fatepoint', db);
		return;
	},

	getInfo() {
		const { _recordIndex: i, _db: db } = this;
		if (i < 0) return { selected: null, point: null, banner: null, type: null };
		const { selected, point, type = 'weapon', banner = 'weapon-event' } = db[i];
		return { selected, point, banner, type };
	},

	remove() {
		const { _recordIndex: i, _db: db } = this;
		const afterRemoved = db.filter((d, index) => index !== i);
		storageLocal.set('fatepoint', afterRemoved);
	}
};

export const dailyWelkin = {
	getData() {
		const welkin = storageLocal.get('welkin');
		if (!welkin) return { remaining: 0, diff: 0 };

		const utc = new Date().getTime() - 3 * 3600 * 1000;
		const today = new Date(utc).toDateString();
		const counter = Math.abs(new Date(today) - new Date(welkin.latestCheckIn));
		welkin.diff = Math.ceil(counter / (1000 * 60 * 60 * 24));
		return welkin;
	},

	checkin(action = 'checkin') {
		let { remaining, latestCheckIn } = this.getData();
		const time = new Date().getTime() - 3 * 3600 * 1000;
		const today = new Date(time).toDateString();

		// Initial Purchase
		if (!latestCheckIn && action !== 'checkin') {
			const object = { remaining: 29, latestCheckIn: today };
			storageLocal.set('welkin', object);
			return object;
		}

		// Buying More Welkin
		if (action !== 'checkin') {
			const days = remaining < 1 ? 29 : 30;
			const object = { remaining: days + remaining, latestCheckIn: today };
			storageLocal.set('welkin', object);
			return object;
		}

		// Daily Checkin
		const counter = Math.abs(new Date(today) - new Date(latestCheckIn));
		const diffDays = Math.ceil(counter / (1000 * 60 * 60 * 24));

		remaining = remaining - diffDays;
		remaining = remaining < 0 ? 0 : remaining;
		latestCheckIn = today;
		const object = { remaining, latestCheckIn };
		storageLocal.set('welkin', object);
		return object;
	}
};

export const ownedOutfits = {
	getAll() {
		const items = storageLocal.get('ownedOutfits');
		return Array.isArray(items) ? items : [];
	},

	get(outfitName) {
		const outfits = this.getAll();
		return outfits.find(({ name }) => name === outfitName);
	},

	getByChar(charName) {
		const outfits = this.getAll();
		return outfits.filter(({ characterName }) => characterName === charName);
	},

	set({ outfitName, isSet = true, characterName = null } = {}) {
		const outfits = this.getAll().map((outfit) => {
			if (outfit.characterName !== characterName) return outfit;
			outfit.isSet = false;
			return outfit;
		});

		if (this.get(outfitName)) {
			const index = outfits.findIndex(({ name }) => name === outfitName);
			outfits[index].isSet = isSet;
		} else {
			outfits.push({ name: outfitName, characterName, isSet });
		}
		storageLocal.set('ownedOutfits', outfits);
	}
};

export const localrate = {
	get(key) {
		const rates = storageLocal.get('probabilityRates');
		const isValue = rates[key] && rates[key] !== null && rates[key] !== undefined;
		return isValue ? rates[key] : {};
	},
	set(key, value) {
		const rates = storageLocal.get('probabilityRates');
		rates[key] = value;
		storageLocal.set('probabilityRates', rates);
	},
	reset(key) {
		const rates = storageLocal.get('probabilityRates');
		delete rates[key];
		storageLocal.set('probabilityRates', rates);
	}
};