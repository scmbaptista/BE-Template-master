const { Op } = require('sequelize');
const { Contract, typesStatus, sequelize, Profile } = require('../model');

/*
* Created:
* 1 - New file Service to be able to read better code and to use design pattern
* 3 - Added error handler with throw
*/


/**
 * ContractService - class that contains all method need to gest contracts
 */
class ContractService{
    constructor(models){
        this.typeStatus = typesStatus;
        this.models = models;
    }

    async findAll(){
        const result = await this.models.findAll();

        if(!result) throw {
            status: 404,
            message: 'The requested operation failed because a resource associated with the request could not be found.'
        }
        return result;
    }
    async findById(id){
        const result = await this.models.findOne({
            include: [{
                model: Profile,
                as: 'Contractor'
            }],
            where: {id}
        });

        if(!result) throw {
            status: 404,
            message: 'The requested operation failed because a resource associated with the request could not be found.'
        }
        return result;
    }
    async findByIdAndProfile(id, idProfile){
        const result = await this.models.findOne({
            include: [{
                model: Profile,
                as: 'Contractor',
                where: {id: idProfile}
            }],
            where: {id}
        });

        if(!result) throw {
            status: 404,
            message: 'The requested operation failed because a resource associated with the request could not be found.'
        }
        return result;
    }
    async findAllNotTerminated(){
        const list = await this.findAll();
        const result = list.filter((c)=>{return c.status != this.typeStatus.terminated})

        if(!result) throw {
            status: 404,
            message: 'The requested operation failed because a resource associated with the request could not be found.'
        }
        return result;
    }
}

/**
 * JobsService - class that contains all method need to gest jobs
 */
class JobsService{
    constructor(modelJobs, modelProfile){
        this.typeStatus = typesStatus;
        this.modelJobs = modelJobs;
        this.modelProfile = modelProfile;
    }

    async findAll(){
        const result = await this.modelJobs.findAll({
            include: [
                Contract
            ]
          });

        if(!result) throw {
            status: 404,
            message: 'The requested operation failed because a resource associated with the request could not be found.'
        }
        return result;
    }
    async findById(id){
        const result = await this.modelJobs.findAll({
            include: [
                {
                    model: Contract,
                    include: [{
                        model: Profile,
                        as: 'Contractor'
                    }]                    
                }
            ],
            where: {
                "id" : id
            }
          });

        if(!result) throw {
            status: 404,
            message: 'The requested operation failed because a resource associated with the request could not be found.'
        }
        return result[0];
    }
    async findByUserId(id){
        const result = await this.modelJobs.findAll({
            include: [
                {
                    model: Contract,
                    where: { ContractorId: id },
                    include: [{
                        model: Profile,
                        as: 'Contractor'
                    }]
                                      
                }
            ]
          });

        if(!result) throw {
            status: 404,
            message: 'The requested operation failed because a resource associated with the request could not be found.'
        }
        return result;
    }
    async findAllUnpaid(){
        const list = await this.findAll();

        const result = list.filter((j)=>{return ( j.paid && j.Contract.status != this.typeStatus.terminated)})

        if(!result) throw {
            status: 404,
            message: 'The requested operation failed because a resource associated with the request could not be found.'
        }
        return result;
    }
    async findByTime(startedDate, endDate){
        const list = await this.modelJobs.findAll({
            include: [
                Contract
            ],
            attributes: [
                "description",
                "paid",
                "paymentDate",
                [sequelize.fn("max", sequelize.col("price")), "price"],
            ],
            where:{
                "paymentDate" : {[Op.between] : [startedDate , endDate ]}
            }
          });

        if(!list) throw {
            status: 404,
            message: 'The requested operation failed because a resource associated with the request could not be found.'
        }

       const result = list.filter((j)=>{return ( j. paid && j.Contract.status != this.typeStatus.terminated)})

        if(!result) throw {
            status: 404,
            message: 'The requested operation failed because a resource associated with the request could not be found.'
        }
        return result;
    }
    async findAllByTime(startedDate, endDate, limit){
        const list = await this.modelJobs.findAndCountAll({
            limit: limit,
            include: [
                Contract
            ],
            where:{
                "paymentDate" : {[Op.between] : [startedDate , endDate ]}
            }
          });

        if(!list) throw {
            status: 404,
            message: 'The requested operation failed because a resource associated with the request could not be found.'
        }

       const result = list.rows.filter((j)=>{return ( j. paid && j.Contract.status != this.typeStatus.terminated)})

        if(!result) throw {
            status: 404,
            message: 'The requested operation failed because a resource associated with the request could not be found.'
        }
        return result;
    }

    /**
     * 
     * * DOUBTS:
     * 1 - I don't know if I understood well I applied what was requested in terms of calculations and updates (ex: POST API'S)} userId 
     * 
     * @param {*} jobId 
     * @returns 
     */
    async handlerPay(jobId){
        const job = await this.findById(jobId);

        const idP = job.Contract.Contractor.id;
        const balanceContractor = job.Contract.Contractor.balance;
        const balanceToPay = (job.price - balanceContractor) + balanceContractor;
        const balance = job.price - balanceToPay;

        if( job.price >= balanceContractor ){
            await this.pay(jobId, idP, balanceToPay, balance);
            job.price = balance;
            job.Contract.Contractor.balance = balanceToPay;
        }
        return job;
    }
    async pay(jobId, idP, balanceToPay, balance){
        await Promise.all([
            this.modelJobs.update(
                { 
                    price: balance,
                    paid: true
                },
                { 
                    where: 
                    {
                        id: jobId
                    }
                }
            ),
            this.modelProfile.update(
                { balance: balanceToPay},
                { 
                    where: 
                    {
                        id: idP
                    }
                }
            )
        ]);
        
    }
    
    /**
     * 
     * DOUBTS:
     * 1 - I don't know if I understood well I applied what was requested in terms of calculations and updates (ex: POST API'S)} userId 
     * 
     * @param {*} amount 
     * @returns 
     */
    async handlerDeposits(userId, amount){
        const jobs = await this.findByUserId(userId);
        if(jobs.length > 1){
            for await(const job of jobs){
                if((job.price*0.25) >= amount){
                    job.price = job.price + amount;
                    await this.deposit(job.id, job.price);
                }
            }
        }else{
            const o = jobs[0].price;
            if((jobs[0].price*0.25) >= amount){
                jobs[0].price = jobs[0].price + amount;
                await this.deposit(jobs[0].id, jobs[0].price);
            }
        }
        
        return jobs;
    }
    async deposit(jobId, amount){
        this.modelJobs.update(
            { 
                price: amount
            },
            { 
                where: 
                {
                    id: jobId
                }
            }
        )
    }
}

module.exports = {
    ContractService,
    JobsService
}