const authService = require('../services/authService');

exports.register = async (req, res) => {
    try {
        const token = await authService.register(req.body);
        res.json({ token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const token = await authService.login(req.body.email, req.body.password);
        res.json({ token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
