const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (userData) => {
    const { name, email, password, role } = userData;
    let user = await User.findOne({ email });
    if (user) throw new Error('User already exists');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    return this.generateToken(user);
};

exports.login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid Credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid Credentials');

    return this.generateToken(user);
};

exports.generateToken = (user) => {
    const payload = { user: { id: user.id, role: user.role } };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
};
