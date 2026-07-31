/**
 * Complaint Category to Faculty Department Routing Configuration
 * 
 * Maps Complaint Categories to eligible Faculty Departments.
 */
const CATEGORY_DEPARTMENT_ROUTING = {
    'IT Support': [
        'Computer Engineering',
        'Information Technology',
        'Artificial Intelligence & Data Science',
        'Artificial Intelligence & Machine Learning'
    ]
    // Additional category mappings (e.g. Facilities, Hostel) can be extended here
};

/**
 * Returns array of faculty departments that are routed for a given category
 * @param {string} category 
 * @returns {Array<string>}
 */
const getRoutedDepartmentsForCategory = (category) => {
    return CATEGORY_DEPARTMENT_ROUTING[category] || [];
};

/**
 * Checks if a faculty member's department is eligible for a given issue category
 * @param {string} facultyDepartment 
 * @param {string} category 
 * @returns {boolean}
 */
const isFacultyDepartmentRoutedForCategory = (facultyDepartment, category) => {
    if (!facultyDepartment || !category) return false;
    const routedDepts = getRoutedDepartmentsForCategory(category);
    return routedDepts.includes(facultyDepartment);
};

/**
 * Checks if a user has permission to view/modify an issue based on role, assignment, and category routing rules.
 * @param {Object} user - The req.user object (id, role, department)
 * @param {Object} issue - The Issue Mongoose document or plain object
 * @returns {boolean}
 */
const canUserAccessIssue = (user, issue) => {
    if (!user || !issue) return false;

    // Admin has access to all issues
    if (user.role === 'admin') return true;

    // Student can only access their own issues
    if (user.role === 'student') {
        const studentId = issue.student?._id
            ? issue.student._id.toString()
            : issue.student?.toString();
        const userId = user.id ? user.id.toString() : user._id?.toString();
        return studentId === userId;
    }

    // Faculty authorization logic
    if (user.role === 'faculty') {
        const userIdStr = (user.id || user._id).toString();

        // Rule 1: Explicit faculty assignment ALWAYS grants access (overrides department routing)
        if (issue.assignedFaculty) {
            const assignedIdStr = issue.assignedFaculty._id
                ? issue.assignedFaculty._id.toString()
                : issue.assignedFaculty.toString();
            if (assignedIdStr === userIdStr) {
                return true;
            }
        }

        // Rule 2: Issue department matches faculty department
        if (issue.department && issue.department === user.department) {
            return true;
        }

        // Rule 3: Complaint category routing (e.g. IT Support -> CE, IT, AD, AM)
        if (isFacultyDepartmentRoutedForCategory(user.department, issue.category)) {
            return true;
        }

        // Rule 4: Legacy issue records (where department was saved with category name e.g. 'IT Support')
        if (isFacultyDepartmentRoutedForCategory(user.department, issue.department)) {
            return true;
        }

        return false;
    }

    return false;
};

/**
 * Generates MongoDB query filter for a faculty member to fetch their assigned / department-routed issues.
 * @param {Object} user - The req.user object (id, role, department)
 * @returns {Object} MongoDB query object
 */
const getFacultyQuery = (user) => {
    if (!user || user.role !== 'faculty') return {};

    const userId = user.id || user._id;

    const conditions = [
        { assignedFaculty: userId },
        { department: user.department }
    ];

    // Find all categories that route to this faculty member's department
    for (const [categoryName, targetDepts] of Object.entries(CATEGORY_DEPARTMENT_ROUTING)) {
        if (targetDepts.includes(user.department)) {
            conditions.push({ category: categoryName });
            conditions.push({ department: categoryName }); // For legacy record compatibility
        }
    }

    return { $or: conditions };
};

module.exports = {
    CATEGORY_DEPARTMENT_ROUTING,
    getRoutedDepartmentsForCategory,
    isFacultyDepartmentRoutedForCategory,
    canUserAccessIssue,
    getFacultyQuery
};
