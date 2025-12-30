// Role-Based Access Control Middleware

export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
};

// Specific role middlewares
export const requireAdmin = requireRole('admin');
export const requirePatient = requireRole('patient');
export const requireDoctor = requireRole('doctor');
export const requirePatientOrDoctor = requireRole('patient', 'doctor');
export const requireDoctorOrAdmin = requireRole('doctor', 'admin');

export default requireRole;
