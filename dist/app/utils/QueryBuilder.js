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
        constants_1.excludeFields.forEach(field => delete queryObj[field]);
        this.queryModal = this.queryModal.find(queryObj);
        return this;
    }
    paginate() {
        const page = parseInt(this.query.page || '1');
        const limit = parseInt(this.query.limit || '8');
        const skip = (page - 1) * limit;
        this.queryModal = this.queryModal.skip(skip).limit(limit);
        return this;
    }
    build() {
        return this.queryModal;
    }
    getMeta() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalDocuments = yield this.queryModal.model.countDocuments({
                role: { $ne: 'ADMIN' },
            });
            const page = parseInt(this.query.page || '1');
            const limit = parseInt(this.query.limit || '8');
            const totalPage = Math.ceil(totalDocuments / limit);
            return { page, limit, totalPage, totalDocuments };
        });
    }
}
exports.QueryBuilder = QueryBuilder;
