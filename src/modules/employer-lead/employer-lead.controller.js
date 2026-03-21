const employerLeadService = require('./employer-lead.service');

exports.createLead = async (request, reply) => {
    const lead = await employerLeadService.createLead(request.body);
    reply.status(201).send({
        success: true,
        message: 'Your hiring request has been captured successfully',
        data: lead
    });
};

exports.getLeads = async (request, reply) => {
    const leads = await employerLeadService.getLeads(request.query);
    return {
        success: true,
        message: 'Employer leads retrieved successfully',
        count: leads.length,
        data: leads
    };
};
