
export const notAllowedStatus = ['IN_TRANSIT', 'DELIVERED', 'CONFIRMED', 'APPROVED'];
export const excludeFields = ['page', 'limit', 'sort', 'fields','searchTerm'];
export const userSearchableFields = ['name','email','role','isActive'];
export const parcelFilterableFields = ['status', 'senderEmail','receiverEmail','origin','destination'];
export const userFilterableFields = ['role','status'];
export const parcelSearchableFields = [
    'trackingId',
    'receiverEmail',
    'parcelDetails.address',
    'parcelDetails.phone',
    'parcelDetails.note',
    'currentStatus',
    'senderId' 
];