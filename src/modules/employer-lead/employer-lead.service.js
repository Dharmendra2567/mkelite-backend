const EmployerLead = require('./employer-lead.model');

class EmployerLeadService {
    async createLead(leadData) {
        return await EmployerLead.create(leadData);
    }

    async getLeads(queryOptions = {}) {
        const { limit = 20, skip = 0, sort = '-createdAt', ...filters } = queryOptions;

        return await EmployerLead.find(filters)
            .sort(sort)
            .skip(Number(skip))
            .limit(Number(limit))
            .lean();
    }
}
module.exports = new EmployerLeadService();
