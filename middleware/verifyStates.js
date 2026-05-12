const statesData = require('../data/statesData.json');

const verifyStates = (req, res, next) => {

    const stateCode = req.params.state.toUpperCase();

    const stateArray = statesData.map(state => state.code);

    if(!stateArray.includes(stateCode)) {
        return res.status(400).json({
            message: 'Invalid state abbreviation parameter'
        });
    }

    req.params.code = stateCode;

    next();
};

module.exports = verifyStates;