const State = require('../models/States');
const statesData = require('../data/statesData.json');

const mergeFunFacts = async (state) => {
    
    const funFactsData = await State.findOne({
        code: state.code.toUpperCase()
    });
   
    return {
        ...state,
        ...(funFactsData?.funfacts.length && {
            funfacts: funFactsData.funfacts
        })
    };
};

const getAllStates = async (req, res) => {
    let filteredStates = [...statesData];

    if (req.query.contig === 'true') {
        filteredStates = filteredStates.filter(
            state => state.code !== 'AK' && state.code !== 'HI'
        );
    }

    if (req.query.contig === 'false') {
        filteredStates = filteredStates.filter(
            state => state.code === 'AK' || state.code === 'HI'
        );
    }

    const statesWithFacts = await Promise.all(
        filteredStates.map(state => mergeFunFacts(state))
    );

    res.json(statesWithFacts);
};

const getState = async (req, res) => {

    const state = statesData.find(
        state => state.code === req.params.state
    );
    const mergedState = await mergeFunFacts(state);

    res.json(mergedState);
};

const getFunFact = async (req, res) => {

    const stateFacts = await State.findOne({
        code: req.params.state
    });

    if (!stateFacts || !stateFacts.funfacts.length) {

        const state = statesData.find(
            state => state.code === req.params.state
        );

        return res.json({
            message: `No Fun Facts found for ${state.state}`
        });
    }

    const randomFact =
        stateFacts.funfacts[
            Math.floor(Math.random() * stateFacts.funfacts.length)
        ];

    res.json({
        funfact: randomFact
    });
};

const getCapital = (req, res) => {

    const state = statesData.find(
        state => state.code === req.params.state
    );

    res.json({
        state: state.state,
        capital: state.capital_city
    });
};

const getNickname = (req, res) => {
    const state = statesData.find(
        state => state.code === req.params.state
    );

    res.json({
        state: state.state,
        nickname: state.nickname
    });
};

const getPopulation = (req, res) => {
    const state = statesData.find(
        state => state.code === req.params.state
    );

    res.json({
        state: state.state,
        population: state.population
    });
};

const getAdmission = (req, res) => {
    const state = statesData.find(
        state => state.code === req.params.state
    );

    res.json({
        state: state.state,
        admitted: state.admission_date
    });
};

const createFunFact = async (req, res) => {

    if (
        !req?.body?.funfacts ||
        !req.body.funfacts.length
    ) {
        return res.status(400).json({
            message: 'State fun facts value required'
        });
    }
    if (
        !Array.isArray(req.body.funfacts)
    ) {
        return res.status(400).json({
            message: 'State fun facts value must be an array'
        });
    }

    try {
        const stateCode = req.params.state.toUpperCase();

        let state = await State.findOne({ code: stateCode});

        if(!state) {
            const result = await State.create({
                code: stateCode,
                funfacts: req.body.funfacts
            });
            return res.status(201).json(result);
        } 

        state.funfacts.push(...req.body.funfacts);

        const result = await state.save();

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
};

const updateFunFact = async (req, res) => {
    if(!req?.body?.index){
        return res.status(400).json({
            message: 'State fun fact index value required'
        });
    }
    if(!req?.body?.funfact){
        return res.status(400).json({
            message: 'State fun fact value required'
        });
    }

    try {

        const stateCode = req.params.state.toUpperCase();

        let state = await State.findOne({ code: stateCode});

        if (!state) {
            return res.status(404).json({
                message: `No Fun Facts found for ${stateCode}`
            });
        }

        const factIndex = req.body.index - 1;

        if(factIndex < 0 || factIndex >= state.funfacts.length) {
            return res.status(400).json({
                message: `No Fun Fact found at that index for ${state.state}`
            });
        }

        state.funfacts[factIndex] = req.body.funfact;

        const result = await state.save();

        res.json(result);
    } catch (err) {
        console.error(err);
    }
};

const deleteFunFact = async (req, res) => {
    if(!req?.body?.index) {
        return res.status(400).json({
            message: 'State fun fact index value required'
        });
    }

    try {
        const stateCode = req.params.state.toUpperCase();

        let state = await State.findOne({ code: stateCode});

        if(!state || !state.funfacts.length) {
            return res.status(404).json({
                message: `No Fun Facts found for ${req.state.state}`
            });
        }

        const factIndex = req.body.index - 1;

        if(factIndex < 0 || factIndex >= state.funfacts.length) {
            return res.status(400).json({
                message: `No Fun Fact found at that index for ${statesData.state}`
            });
        }

        state.funfacts.splice(factIndex, 1);

        const result = await state.save();

        res.json(result);
    } catch(err) {
        console.error(err);
    }
};
module.exports = {
    getAllStates,
    getState,
    getFunFact,
    getCapital,
    getNickname,
    getPopulation,
    getAdmission,
    createFunFact,
    updateFunFact,
    deleteFunFact
};