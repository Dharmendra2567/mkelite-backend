const ContactInquiry = require('./contact.model');
const ErrorResponse = require('../../utils/errorResponse');
const User = require('../user/user.model');
const JobseekerProfile = require('../jobseeker/jobseeker.model');
const EmployerProfile = require('../employer/employer.model');

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

    async convertToUser(id) {
        const inquiry = await ContactInquiry.findById(id);
        if (!inquiry) throw new ErrorResponse('Inquiry not found', 404);

        // Check if user already exists
        let user = await User.findOne({ email: inquiry.email.toLowerCase() });
        if (user) {
            throw new ErrorResponse('User already exists with this email. Cannot convert.', 400);
        }

        // 1. Prepare User Data
        const nameParts = inquiry.name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '---';

        // Extract 10-digit phone for password (default fallback)
        const cleanPhone = inquiry.phone.replace(/\D/g, '');
        const password = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : '123456';

        // 2. Create User (Hasing is handled by Pre-save hook)
        user = await User.create({
            firstName,
            lastName,
            email: inquiry.email.toLowerCase(),
            phoneNumber: inquiry.phone,
            password: password,
            role: inquiry.userRole === 'guest' ? 'jobseeker' : inquiry.userRole
        });

        // 3. Create Profile
        if (user.role === 'jobseeker') {
            await JobseekerProfile.create({
                user: user._id,
                name: inquiry.name,
                phone: inquiry.phone,
                location: { city: inquiry.location || '---', state: '---', country: 'India' },
                resumes: inquiry.resumeUrl ? [{ url: inquiry.resumeUrl, fileName: 'Resume_from_Contact', isDefault: true }] : [],
                headline: `Candidate from ${inquiry.subject}`,
                isActivelyLooking: true
            });
        } else if (user.role === 'employer') {
            await EmployerProfile.create({
                userId: user._id,
                companyName: inquiry.companyName || `${inquiry.name}'s Enterprise`,
                description: inquiry.message || 'Company created from contact inquiry.',
                industry: inquiry.professionalCategory || 'Other',
                location: { city: inquiry.location || '---', state: '---', country: 'India' },
                contactInfo: { email: inquiry.email, phone: inquiry.phone }
            });
        }

        // 4. Update Inquiry Status
        inquiry.status = 'replied';
        await inquiry.save();

        return user;
    }
}

module.exports = new ContactService();
