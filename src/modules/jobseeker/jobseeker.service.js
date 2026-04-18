const JobseekerProfile = require('./jobseeker.model');
const ErrorResponse = require('../../utils/errorResponse');

class JobseekerService {
    async createProfile(userId, profileData) {
        // Ensure user doesn't already have a profile
        const existingProfile = await JobseekerProfile.findOne({ user: userId }).lean();

        if (existingProfile) {
            throw new ErrorResponse('Profile already exists for this user', 400);
        }

        profileData.user = userId;
        const profile = await JobseekerProfile.create(profileData);
        
        // Initial completion calculation
        await this.updateProfileCompletion(userId);
        
        return profile;
    }

    async getProfileByUserId(userId) {
        const profile = await JobseekerProfile.findOne({ user: userId })
            .populate('user', 'firstName lastName email phoneNumber')
            .populate('savedJobs.job', 'title companyInfo location type')
            .populate({
                path: 'applications.application',
                select: 'status createdAt jobId name email phone resume coverLetter',
                populate: {
                    path: 'jobId',
                    select: 'title company logo employerProfileId'
                }
            })
            .lean();

        if (!profile) {
            return null;
        }

        return profile;
    }

    async getProfileById(id) {
        const profile = await JobseekerProfile.findById(id)
            .populate('user', 'firstName lastName email')
            .lean();

        if (!profile) {
            throw new ErrorResponse('Jobseeker profile not found', 404);
        }

        return profile;
    }

    async updateProfile(userId, updateData) {
        let profile = await JobseekerProfile.findOne({ user: userId });

        if (!profile) {
            throw new ErrorResponse('Jobseeker profile not found', 404);
        }

        // Handle nested object updates using dot notation to avoid wiping out other fields
        const flattenedUpdate = this._flattenObject(updateData);

        profile = await JobseekerProfile.findOneAndUpdate(
            { user: userId },
            { $set: flattenedUpdate },
            { new: true, runValidators: true }
        ).lean();

        // Recalculate completion
        await this.updateProfileCompletion(userId);

        return profile;
    }

    async toggleSaveJob(userId, jobId) {
        let profile = await JobseekerProfile.findOne({ user: userId });
        if (!profile) {
            // Auto-create basic profile if it doesn't exist
            const User = require('../user/user.model');
            const user = await User.findById(userId);
            profile = await JobseekerProfile.create({
                user: userId,
                name: user ? `${user.firstName} ${user.lastName}` : 'Jobseeker',
                phone: user?.phoneNumber
            });
        }

        const jobIndex = profile.savedJobs.findIndex(sj => sj.job && sj.job.toString() === jobId.toString());

        if (jobIndex > -1) {
            // Already saved, remove it
            profile.savedJobs.splice(jobIndex, 1);
        } else {
            // Not saved, add it
            profile.savedJobs.push({ job: jobId });
        }

        await profile.save();
        return profile.savedJobs;
    }

    async addApplicationRecord(userId, applicationId) {
        // Use updateOne with $push for atomic and more reliable linking
        const result = await JobseekerProfile.updateOne(
            { user: userId },
            { 
                $push: { 
                    applications: { 
                        application: applicationId,
                        appliedAt: new Date()
                    } 
                } 
            }
        );

        // If no profile updated, it might not exist (though rare for logged in users)
        if (result.matchedCount === 0) {
            const User = require('../user/user.model');
            const user = await User.findById(userId);
            await JobseekerProfile.create({
                user: userId,
                name: user ? `${user.firstName} ${user.lastName}` : 'Jobseeker',
                phone: user?.phoneNumber,
                applications: [{ application: applicationId }]
            });
        }
    }

    async removeApplicationRecord(userId, applicationId) {
        let profile = await JobseekerProfile.findOne({ user: userId });
        if (!profile) return;

        profile.applications = profile.applications.filter(a => a.application && a.application.toString() !== applicationId.toString());
        await profile.save();
    }

    // --- RESUME MANAGEMENT ---
    async addResume(userId, resumeData) {
        const profile = await JobseekerProfile.findOne({ user: userId });
        if (!profile) throw new ErrorResponse('Profile not found', 404);

        // If it's the first resume, make it default
        if (profile.resumes.length === 0) {
            resumeData.isDefault = true;
        } else if (resumeData.isDefault) {
            // Unset other defaults
            profile.resumes.forEach(r => r.isDefault = false);
        }

        profile.resumes.push(resumeData);
        await profile.save();
        await this.updateProfileCompletion(userId);
        return profile.resumes;
    }

    async deleteResume(userId, resumeId) {
        const profile = await JobseekerProfile.findOne({ user: userId });
        if (!profile) throw new ErrorResponse('Profile not found', 404);

        const resumeIndex = profile.resumes.findIndex(r => r._id.toString() === resumeId.toString());
        if (resumeIndex === -1) throw new ErrorResponse('Resume not found', 404);

        const wasDefault = profile.resumes[resumeIndex].isDefault;
        profile.resumes.splice(resumeIndex, 1);

        // If we deleted the default, set first remaining as default
        if (wasDefault && profile.resumes.length > 0) {
            profile.resumes[0].isDefault = true;
        }

        await profile.save();
        await this.updateProfileCompletion(userId);
        return profile.resumes;
    }

    async setDefaultResume(userId, resumeId) {
        const profile = await JobseekerProfile.findOne({ user: userId });
        if (!profile) throw new ErrorResponse('Profile not found', 404);

        let found = false;
        profile.resumes.forEach(r => {
            if (r._id.toString() === resumeId.toString()) {
                r.isDefault = true;
                found = true;
            } else {
                r.isDefault = false;
            }
        });

        if (!found) throw new ErrorResponse('Resume not found', 404);

        await profile.save();
        return profile.resumes;
    }

    // --- SECTION MANAGEMENT ---
    async addExperience(userId, expData) {
        const profile = await JobseekerProfile.findOne({ user: userId });
        if (!profile) throw new ErrorResponse('Profile not found', 404);

        profile.experience.push(expData);
        await profile.save();
        await this.updateProfileCompletion(userId);
        return profile.experience;
    }

    async removeExperience(userId, expId) {
        const profile = await JobseekerProfile.findOne({ user: userId });
        if (!profile) throw new ErrorResponse('Profile not found', 404);

        profile.experience = profile.experience.filter(e => e._id.toString() !== expId.toString());
        await profile.save();
        await this.updateProfileCompletion(userId);
        return profile.experience;
    }

    async updateExperience(userId, expId, expData) {
        const profile = await JobseekerProfile.findOne({ user: userId });
        if (!profile) throw new ErrorResponse('Profile not found', 404);

        const experience = profile.experience.id(expId);
        if (!experience) throw new ErrorResponse('Experience not found', 404);

        // Update fields
        Object.assign(experience, expData);
        
        await profile.save();
        await this.updateProfileCompletion(userId);
        return profile.experience;
    }

    async addEducation(userId, eduData) {
        const profile = await JobseekerProfile.findOne({ user: userId });
        if (!profile) throw new ErrorResponse('Profile not found', 404);

        profile.education.push(eduData);
        await profile.save();
        await this.updateProfileCompletion(userId);
        return profile.education;
    }

    async removeEducation(userId, eduId) {
        const profile = await JobseekerProfile.findOne({ user: userId });
        if (!profile) throw new ErrorResponse('Profile not found', 404);

        profile.education = profile.education.filter(e => e._id.toString() !== eduId.toString());
        await profile.save();
        await this.updateProfileCompletion(userId);
        return profile.education;
    }

    async updateEducation(userId, eduId, eduData) {
        const profile = await JobseekerProfile.findOne({ user: userId });
        if (!profile) throw new ErrorResponse('Profile not found', 404);

        const education = profile.education.id(eduId);
        if (!education) throw new ErrorResponse('Education not found', 404);

        // Update fields
        Object.assign(education, eduData);
        
        await profile.save();
        await this.updateProfileCompletion(userId);
        return profile.education;
    }

    async updateProfileCompletion(userId) {
        const profile = await JobseekerProfile.findOne({ user: userId });
        if (!profile) return;

        let filledFields = 0;
        const totalFields = 8; // core sections

        if (profile.name) filledFields++;
        if (profile.headline) filledFields++;
        if (profile.bio) filledFields++;
        if (profile.phone) filledFields++;
        if (profile.skills && profile.skills.length > 0) filledFields++;
        if (profile.languages && profile.languages.length > 0) filledFields++;
        if (profile.experience && profile.experience.length > 0) filledFields++;
        if (profile.education && profile.education.length > 0) filledFields++;
        if (profile.resumes && profile.resumes.length > 0) filledFields++;

        profile.profileCompletion = Math.round((filledFields / (totalFields + 1)) * 100);
        profile.lastActiveAt = new Date();
        await profile.save();
    }

    async getAllProfiles(queryOps) {
        const { limit = 20, skip = 0, sort = '-createdAt', ...filters } = queryOps;

        // Map old query fields if passed from frontend
        if (filters.specialization) {
            filters.headline = new RegExp(filters.specialization, 'i');
            delete filters.specialization;
        }

        const profiles = await JobseekerProfile.find(filters)
            .populate('user', 'firstName lastName email')
            .sort(sort)
            .skip(Number(skip))
            .limit(Number(limit))
            .lean();

        return profiles;
    }

    // Helper to flatten nested objects for $set updates
    _flattenObject(obj, prefix = '') {
        return Object.keys(obj).reduce((acc, k) => {
            const pre = prefix.length ? prefix + '.' : '';
            if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k]) && !(obj[k] instanceof Date)) {
                Object.assign(acc, this._flattenObject(obj[k], pre + k));
            } else {
                acc[pre + k] = obj[k];
            }
            return acc;
        }, {});
    }
}

module.exports = new JobseekerService();
