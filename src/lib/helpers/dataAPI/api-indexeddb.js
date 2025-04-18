import { browser } from '$app/environment';
import { openDB } from 'idb';
import { storageLocal, startBalance, endBalance, topUp, topExp, purchases, buttons } from './api-localstore';
import { genesis } from '$lib/store/app-stores';


const version = 5;
const DBName = 'WishSimulator';

let IndexedDB;

if (browser) {
	IndexedDB = openDB(DBName, version, {
		async upgrade(db, oldVer, newVer, transaction) {
			if (!db.objectStoreNames.contains('history')) {
				const historyStore = db.createObjectStore('history', {
					keyPath: 'id',
					autoIncrement: true
				});
				historyStore.createIndex('bannerName', 'bannerName', { unique: false });
				historyStore.createIndex('itemID', 'itemID', { unique: false });
				historyStore.createIndex('name', 'name', { unique: false });

			} else {
				const historyStore = transaction.objectStore('history');
				
				const hasBanner = historyStore.indexNames.contains('bannerName');
				if (!hasBanner) historyStore.createIndex('bannerName', 'bannerName', { unique: false });

				const hasID = historyStore.indexNames.contains('itemID');
				if (!hasID) historyStore.createIndex('itemID', 'itemID', { unique: false });
				
				const hasName = historyStore.indexNames.contains('name');
				if (!hasName) historyStore.createIndex('name', 'name', { unique: false });

			}

			if (!db.objectStoreNames.contains('assets')) {
				db.createObjectStore('assets', { keyPath: 'key', autoIncrement: false });
			}

			if (!db.objectStoreNames.contains('custombanner')) {
				const bnStore = db.createObjectStore('custombanner', {
					keyPath: 'itemID',
					autoIncrement: false
				});
				bnStore.createIndex('status', 'status', { unique: false });
			}
		}
	});
}

const createEvent = () => {
	const event = new Event('storageUpdate');
	document.dispatchEvent(event);
};

export const HistoryManager = {
	async historyCount() {
		return (await IndexedDB).count('history');
	},

	async getListByBanner(banner) {
		return (await IndexedDB).getAllFromIndex('history', 'banner', banner);
	},

	async getListBannerNames(bannerName) {
		return (await IndexedDB).getAllFromIndex('history', 'bannerName', bannerName);
	},

	async filterHistory(filters = {}) {
		let entries = [];

		// Sort bannerNames
		const sortedBanners = filters.bannerName.sort();
		
		// Use IDBKeyRange.bound to retrieve entries  for multiple bannerNames
		const range = IDBKeyRange.bound(sortedBanners[0], sortedBanners[sortedBanners.length - 1]);
		entries = await this.getListBannerNames(range);
		
		// Initialize groupedEntries
		const groupedEntries = Object.fromEntries(
			sortedBanners.map((bannerName) => {
				const pullsSpent = entries.filter(entry => entry.bannerName === bannerName).length;
				const hasEntry = pullsSpent > 0;
				
				return [
					bannerName, { 
						item: [], 
						action: hasEntry ? "pulled": "skipped",
						expenses: {
							startBalance: startBalance.get(bannerName),
							pullsSpent: pullsSpent,
							pullsLeft: endBalance.get(bannerName),
							purchases: {
								topUp: topUp.get(bannerName),
								dollars: topExp.get(bannerName) || 0,
								genesis: purchases.get(bannerName, "genesis"),
								fates: purchases.get(bannerName, "fates"),
								primogems: purchases.get(bannerName, "primogems")
							}
						},
						defeat: getBoss(bannerName),
						buttons: {
							history: buttons.get(bannerName, "history"),
							shop: buttons.get(bannerName, "shop"),
							inventory: buttons.get(bannerName, "inventory"),
							pull_roll: buttons.get(bannerName, "pull_roll"),
							details: buttons.get(bannerName, "details")
						} 
					}];
			})
		);
		
		if (filters.rarity) {
			entries = entries.filter((entry) => entry.rarity === filters.rarity);
		}

		if (filters.type) { //To be deleted
			entries = entries.filter((entry) => entry.type === filters.type);
		}

		entries.forEach((entry) => {
			const { bannerName } = entry;
			if (groupedEntries[bannerName]) {
				groupedEntries[bannerName].item.push({
					itemID: entry.itemID,
					name: entry.name,
					gender: entry.gender,
					category: entry.category,
					class: entry.class,
					tier: entry.tier,
					pity: entry.pity,
					extraPity: entry.extraPity,
					totalPulls: entry.totalPulls,
					status: entry.status
				});
			}
		});

		return groupedEntries;
	},	

	async countItem(name) {
		return (await IndexedDB).countFromIndex('history', 'name', name);
	},

	async getByID(itemID) {
		return (await IndexedDB).getAllFromIndex('history', 'itemID', itemID);
	},

	async getByName(name) {
		return (await IndexedDB).getAllFromIndex('history', 'name', name);
	},	

	async clearHistory(banner) {
		try {
			const idb = await IndexedDB;
			const keys = await idb.getAllKeysFromIndex('history', 'banner', banner);
			for (let i = 0; i < keys.length; i++) {
				await idb.delete('history', keys[i]);
			}
			return 'success';
		} catch (e) {
			return 'failed';
		}
	},

	async clearIDB() {
		const idb = await IndexedDB;
		const clear = await idb.clear('history');
		createEvent();
		return clear;
	},

	async getAllHistories() {
		return (await IndexedDB).getAll('history');
	},

	async addHistory(data) {
		// eslint-disable-next-line no-prototype-builtins
		if (!data.hasOwnProperty('banner')) return;
		const idb = await IndexedDB;
		const put = await idb.put('history', data);
		return put;
	},

	async delete(id) {
		if (!id) return;
		const idb = await IndexedDB;
		const remove = await idb.delete('history', id);
		return remove;
	}
};

function getBoss(banner) {
	const boss = storageLocal.get('boss');
	return boss[banner] !== undefined ? boss[banner] : false;;
};

// Assets Manager
export const AssetManager = {
	async put(data) {
		// eslint-disable-next-line no-prototype-builtins
		if (!data.hasOwnProperty('key')) return;
		return (await IndexedDB).put('assets', data);
	},

	async get(key) {
		if (!key) return null;
		return (await IndexedDB).get('assets', key);
	},

	async delete(key) {
		if (!key) return;
		return (await IndexedDB).delete('assets', key);
	}
};

// Custom Banner
export const BannerManager = {
	async getAll() {
		return (await IndexedDB).getAll('custombanner');
	},

	async put(data = {}) {
		if (!('itemID' in data)) return;
		const lastModified = new Date().toISOString();
		const idb = await IndexedDB;
		const put = await idb.put('custombanner', { lastModified, ...data });
		createEvent();
		return put;
	},

	async get(itemID) {
		if (!itemID) return null;
		return (await IndexedDB).get('custombanner', itemID);
	},

	async getListByStatus(status) {
		return (await IndexedDB).getAllFromIndex('custombanner', 'status', status);
	},

	async delete(key) {
		if (!key) return;
		const idb = await IndexedDB;
		const remove = idb.delete('custombanner', key);
		createEvent();
		return remove;
	},

	async clear() {
		const idb = await IndexedDB;
		const remove = idb.clear('custombanner');
		createEvent();
		return remove;
	}
};


async function printDatabase() {
    try {
        // Open the database
        const db = await IndexedDB;
        
        // Get all object stores
        const objectStores = Array.from(db.objectStoreNames);
        
        // Print each object store's data
        for (const storeName of objectStores) {
            // Get all records from the store
            const records = await db.getAll(storeName);
            
            // Get all indexes for this store
            const indexes = Array.from(db.transaction(storeName).objectStore(storeName).indexNames);

        }
    } catch (error) {
        console.error('Error printing database:', error);
    }
}

// Call the function
printDatabase();