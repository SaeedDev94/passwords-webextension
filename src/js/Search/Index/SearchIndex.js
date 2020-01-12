import PasswordIndexer from '@js/Search/Indexer/PasswordIndexer';
import Password from 'passwords-client/src/Model/Password';
import Server from '@js/Models/Server/Server';
import Folder from 'passwords-client/src/Model/Folder';
import Tag from 'passwords-client/src/Model/Tag';
import EventQueue from '@js/Event/EventQueue';
import ErrorManager from '@js/Manager/ErrorManager';
import FolderIndexer from '@js/Search/Indexer/FolderIndexer';
import TagIndexer from '@js/Search/Indexer/TagIndexer';

class SearchIndex {

    get listen() {
        return this._onUpdate;
    }

    constructor() {
        this._indexers = {
            password: new PasswordIndexer(),
            folder  : new FolderIndexer(),
            tag     : new TagIndexer()
        };
        this._indexes = {
            password: [],
            folder  : [],
            tag     : []
        };
        this._items = {};
        this._onUpdate = new EventQueue();
    }

    /**
     *
     * @param {(string|string[]|null)} [indexes=[]]
     * @return {Object[]}
     */
    getIndexItems(indexes) {
        if(!Array.isArray(indexes)) {
            if(!indexes) {
                indexes = Object.keys(this._indexes);
            } else {
                indexes = [indexes];
            }
        }

        let items = [];
        for(let index of indexes) {
            items.push(...this._indexes[index]);
        }

        return items;
    }

    /**
     *
     * @param {string[]} ids
     * @return {AbstractModel[]}
     */
    getItems(ids) {
        let items = [];
        for(let id of ids) {
            if(this._items.hasOwnProperty(id)) {
                items.push(this._items[id]);
            }
        }

        return items;
    }

    /**
     *
     * @param {string} id
     * @returns {null|AbstractModel}
     */
    getItem(id) {
        if(this._items.hasOwnProperty(id)) {
            return this._items[id];
        }

        return null;
    }

    /**
     *
     * @param {AbstractModel[]} items
     */
    addItems(items) {
        for(let item of items) {
            this.addItem(item, false);
        }
        this._onUpdate.emit(this._items);
    }

    /**
     *
     * @param {AbstractModel} item
     * @param {boolean} [update=true]
     */
    addItem(item, update = true) {
        if(this._items.hasOwnProperty(item.getId())) return;

        let type = this._getItemType(item);

        try {
            let index = this._indexers[type].indexItem(item);
            this._indexes[type].push(index);
            this._items[item.getId()] = item;

            if(update) this._onUpdate.emit(this._items);
        } catch(e) {
            ErrorManager.logError(e);
        }
    }

    /**
     *
     * @param {AbstractModel[]} items
     */
    removeItems(items) {
        for(let item of items) {
            this.removeItem(item, false);
        }
        this._onUpdate.emit(this._items);
    }

    /**
     *
     * @param {AbstractModel} item
     * @param {boolean} [update=true]
     */
    removeItem(item, update = true) {
        if(!this._items.hasOwnProperty(item.getId())) return;
        let type = this._getItemType(item);

        for(let i = 0; i < this._indexes[type].length; i++) {
            if(this._indexes[type][i].id === item.getId()) {
                this._indexes[type].splice(i, 1);
                break;
            }
        }

        delete this._items[item.getId()];
        if(update) this._onUpdate.emit(this._items);
    }

    /**
     *
     * @param {AbstractModel} item
     * @return {string}
     * @private
     */
    _getItemType(item) {
        if(item instanceof Password) {
            return 'password';
        }
        if(item instanceof Folder) {
            return 'folder';
        }
        if(item instanceof Tag) {
            return 'tag';
        }
        if(item instanceof Server) {
            return 'server';
        }
    }
}

export default new SearchIndex();