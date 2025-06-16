function validatePassword(password) {

    if (password.length < 8) {
        return ("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
        return ("Password must contain at least one uppercase letter.");
    }
    if (!/\d/.test(password)) {
        return ("Password must contain at least one number.");
    }

    return false;
}

module.exports = validatePassword