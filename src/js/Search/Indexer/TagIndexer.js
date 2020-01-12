import AbstractIndexer from '@js/Search/Indexer/AbstractIndexer';

export default class TagIndexer extends AbstractIndexer {

    /**
     *
     * @param {Tag} tag
     * @return {Object}
     */
    indexItem(tag) {
        return this._createIndex(tag);
    }

    /**
     *
     * @param {Tag} tag
     * @return {Object}
     */
    _createIndex(tag) {
        let index = {
            id    : tag.getId(),
            type  : 'tag',
            text  : [],
            server: [],
            fields: []
        };

        this._indexServer(tag, index);
        this._indexTextFields(tag, index);

        return index;
    }
}