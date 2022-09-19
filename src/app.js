const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model');
const {getProfile} = require('./middleware/getProfile');
const app = express();
const {ContractService, JobsService} = require('./business/service');
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);


/**
* Requested - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.
* Created:
* 1 - New file Service to be able to read better code and to use design pattern
* 2 - Api call class ContractService method findAll
* 3 - Added error handler with try catch
* 
* @returns list of contracts or error
*/
app.get('/contracts', async(req, res) =>{    
    try {
        const {Contract} = req.app.get('models');

        const response =  await new ContractService(Contract).findAllNotTerminated();
        res.json(response);
    } catch (error) {
        error.status ? res.status(error.status).json(error.message).end() : res.status(500).json(error.message).end();        
    }    
})

/**
 * Requested - This API is broken 😵! it should return the contract only if it belongs to the profile calling. better fix that!
 * 
 * FIX ME!
 * @returns contract by id
 */
app.get('/:profile_id/contracts/:id', getProfile ,async (req, res) =>{       
    try {
        const {Contract} = req.app.get('models');
        const {id} = req.params;

        const response =  await new ContractService(Contract).findByIdAndProfile(id, req.profile.id);
        res.json(response);
    } catch (error) {
        error.status ? res.status(error.status).json(error.message).end() : res.status(500).json(error.message).end();        
    }
})

/**
 * Requested - Get all unpaid jobs for a user (either a client or contractor), for active contracts only.
 */
app.get('/jobs/unpaid', async(req, res) =>{
    try {
        const {Job} = req.app.get('models');

        const response =  await new JobsService(Job).findAllUnpaid();
        res.json(response);
    } catch (error) {
        error.status ? res.status(error.status).json(error.message).end() : res.status(500).json(error.message).end();        
    }
})

/**
 * Requested - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.
 */
app.get('/admin/best-profession', async(req, res) =>{
    try {
        const {Job} = req.app.get('models');
        const response =  await new JobsService(Job).findByTime(req.query.start, req.query.end);
        res.json(response);
    } catch (error) {
        error.status ? res.status(error.status).json(error.message).end() : res.status(500).json(error.message).end();        
    }
})

/**
 * Requested - Returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
 */
app.get('/admin/best-clients', async(req, res) =>{
    try {
        const {Job} = req.app.get('models');
        const response =  await new JobsService(Job).findAllByTime(req.query.start, req.query.end, req.query.limit);
        res.json(response);
    } catch (error) {
        error.status ? res.status(error.status).json(error.message).end() : res.status(500).json(error.message).end();        
    }
})

/**
 * Requested - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.
 */
app.post('/jobs/:jobId/pay', async(req, res) =>{
    try {
        const {Job, Profile} = req.app.get('models');
        const response =  await new JobsService(Job, Profile).handlerPay(req.params.jobId);
        res.json(response);
    } catch (error) {
        error.status ? res.status(error.status).json(error.message).end() : res.status(500).json(error.message).end();        
    }
})

/**
 * Requested -  Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
 */
app.post('/balances/deposit/:userId', async(req, res) =>{
    try {
        const {Job, Profile} = req.app.get('models');
        const response =  await new JobsService(Job, Profile).handlerDeposits(req.params.userId, req.body.amount);
        res.json(response);
    } catch (error) {
        error.status ? res.status(error.status).json(error.message).end() : res.status(500).json(error.message).end();        
    }
})


module.exports = app;
