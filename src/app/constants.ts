
export const notAllowedStatus = ['IN_TRANSIT', 'DELIVERED', 'CONFIRMED', 'APPROVED'];
export const excludeFields = ['page', 'limit', 'sort', 'fields','searchTerm'];
export const parcelSearchableFields =['trackingId', 'senderEmail','receiverEmail','origin','destination', 'currentLocation', 'status'];
export const userSearchableFields = ['name','email','role','isActive'];
export const parcelFilterableFields = ['status', 'senderEmail','receiverEmail','origin','destination'];
export const userFilterableFields = ['role','status'];