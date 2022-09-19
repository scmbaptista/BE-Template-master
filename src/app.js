const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model');
const {getProfile} = require('./middleware/getProfile');
const app = express();
const {ContractService} = require('./business/service');
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);


/*
* Requested - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.
* Created:
* 1 - New file Service to be able to read better code and to use design pattern
* 2 - Api call class ContractService method findAll
* 3 - Added error handler with try catch
*/
app.get('/contracts', async(req, res) =>{
    const {Contract} = req.app.get('models');
    try {
        const response =  await new ContractService().findAll(Contract);
        res.json(response);
    } catch (error) {
        res.status(error.status).json(error.message).end();
    }
    
})

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile ,async (req, res) =>{
    const {Contract} = req.app.get('models')
    const {id} = req.params
    const contract = await Contract.findOne({where: {id}})
    if(!contract) return res.status(404).end()
    res.json(contract)
})



app.get('/jobs/unpaid', async(req, res) =>{
    const {Contract} = req.app.get('models');
    const list = await Contract.findAll({where: {
        status: {
            [Op.or]: [Contract.statusTypes.values[0], Contract.statusTypes.values[1]]
        }
      }});
    if(!list) return res.status(404).end()
    res.json(list);
})

app.get('/jobs/unpaid', async(req, res) =>{
    const {Contract} = req.app.get('models');
    const list = await Contract.findAll({where: {
        status: {
            [Op.or]: [Contract.statusTypes.values[0], Contract.statusTypes.values[1]]
        }
      }});
    if(!list) return res.status(404).end()
    res.json(list);
})


module.exports = app;
