/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { Query } from "mongoose";
import { excludeFields } from "../constants";



export class QueryBuilder<T> {
    public queryModal: Query<T[], T>
    public readonly query: Record<string, string>

    constructor(queryModal: Query<T[], T>, query:Record<string, string>){
        this.queryModal = queryModal;
        this.query = query;
    }
    filter():this{
        const queryObj = {...this.query};
        for (const field of excludeFields){
            delete queryObj[field];
        }
        
        this.queryModal = this.queryModal.find(queryObj)

        return this;
    }

    search(searchableField:string[]):this {
        const searchTerm = this.query.searchTerm || '';
        const searchQuery = {
            $or: searchableField.map(field => ({
                [field]: {$regex:searchTerm, $options:'i'},
            })),
        };
        this.queryModal = this.queryModal.find(searchQuery);
        return this;
    }

    sort():this{
        const sort = this.query.sort || '-createdAt';
        this.queryModal = this.queryModal.sort(sort);
        return this;
    }

    fields():this{
        const fields = this.query.fields?.split(',').join(' ') || '';
        this.queryModal = this.queryModal.select(fields);
        return this;
    }

    paginate(): this{
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page-1) * limit;

        this.queryModal = this.queryModal.skip(skip).limit(limit);
        return this
    }

    build() {
        return this.queryModal;
    }

    async getMeta() {
        const filter = this.queryModal.getFilter();
        const totalDocuments = await this.queryModal.model.countDocuments(filter);

        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const totalPage = Math.ceil(totalDocuments / limit);

        return {page, limit, totalPage, total:totalDocuments};
    }
}