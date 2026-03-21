const contactService = require('./contact.service');

exports.createInquiry = async (request, reply) => {
    const inquiry = await contactService.createInquiry(request.body);
    reply.status(201).send({
        success: true,
        message: 'Your inquiry has been submitted successfully',
        data: inquiry
    });
};

exports.getInquiries = async (request, reply) => {
    const inquiries = await contactService.getInquiries(request.query);
    return {
        success: true,
        message: 'Contact inquiries retrieved successfully',
        count: inquiries.length,
        data: inquiries
    };
};

exports.updateStatus = async (request, reply) => {
    const inquiry = await contactService.updateInquiryStatus(request.params.id, request.body.status);
    return {
        success: true,
        message: `Inquiry status updated to ${request.body.status}`,
        data: inquiry
    };
};
