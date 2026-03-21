const ContactInquiry = require('./contact.model');
const ErrorResponse = require('../../utils/errorResponse');

class ContactService {
    async createInquiry(inquiryData) {
        return await ContactInquiry.create(inquiryData);
    }

    async getInquiries(queryOptions = {}) {
        const { limit = 20, skip = 0, sort = '-createdAt', ...filters } = queryOptions;

        return await ContactInquiry.find(filters)
            .sort(sort)
            .skip(Number(skip))
            .limit(Number(limit))
            .lean();
    }

    async updateInquiryStatus(id, status) {
        const inquiry = await ContactInquiry.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean();
        if (!inquiry) {
            throw new ErrorResponse('Inquiry not found', 404);
        }
        return inquiry;
    }
}

module.exports = new ContactService();
