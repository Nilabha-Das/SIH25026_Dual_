const User = require("../models/User");

const validateRole = (req, res, next) => {
    const { role } = req.body;
    const validRoles = ["doctor", "patient", "curator", "admin"];

    if (!role) {
        return res.status(400).json({ message: "Role is required" });
    }

    if (!validRoles.includes(role)) {
        return res.status(400).json({ 
            message: "Invalid role. Must be one of: " + validRoles.join(", "),
            receivedRole: role
        });
    }

    next();
};

module.exports = validateRole;