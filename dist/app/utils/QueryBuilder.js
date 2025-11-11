"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
const constants_1 = require("../constants");
class QueryBuilder {
    constructor(queryModal, query) {
        this.queryModal = queryModal;
        this.query = query;
    }
    filter() {
        const queryObj = Object.assign({}, this.query);
        for (const field of constants_1.excludeFields) {
            delete queryObj[field];
        }
        this.queryModal = this.queryModal.find(queryObj);
        return this;
    }
    search(searchableField) {
        const searchTerm = this.query.searchTerm || '';
        if (!searchTerm)
            return this;
        const orQueries = [];
        const regexFields = searchableField.filter(f => f !== 'isActive');
        if (regexFields.length) {
            orQueries.push(...regexFields.map(field => ({
                [field]: { $regex: searchTerm, $options: 'i' }
            })));
        }
        if (searchableField.includes('isActive')) {
            const upperSearch = searchTerm.toUpperCase();
            if (['ACTIVE', 'INACTIVE', 'BLOCKED'].includes(upperSearch)) {
                orQueries.push({ isActive: upperSearch });
            }
            else if ('ACTIVE'.includes(upperSearch)) {
                orQueries.push({ isActive: 'ACTIVE' });
            }
            else if ('INACTIVE'.includes(upperSearch)) {
                orQueries.push({ isActive: 'INACTIVE' });
            }
            else if ('BLOCKED'.includes(upperSearch)) {
                orQueries.push({ isActive: 'BLOCKED' });
            }
        }
        if (orQueries.length > 0) {
            this.queryModal = this.queryModal.or(orQueries);
        }
        return this;
    }
    sort() {
        const sort = this.query.sort || '-createdAt';
        this.queryModal = this.queryModal.sort(sort);
        return this;
    }
    fields() {
        var _a;
        const fields = ((_a = this.query.fields) === null || _a === void 0 ? void 0 : _a.split(',').join(' ')) || '';
        this.queryModal = this.queryModal.select(fields);
        return this;
    }
    paginate() {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page - 1) * limit;
        this.queryModal = this.queryModal.skip(skip).limit(limit);
        return this;
    }
    build() {
        return this.queryModal;
    }
    getMeta() {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = this.queryModal.getFilter();
            const totalDocuments = yield this.queryModal.model.countDocuments(filter);
            const page = Number(this.query.page) || 1;
            const limit = Number(this.query.limit) || 10;
            const totalPage = Math.ceil(totalDocuments / limit);
            return { page, limit, totalPage, total: totalDocuments };
        });
    }
}
exports.QueryBuilder = QueryBuilder;
