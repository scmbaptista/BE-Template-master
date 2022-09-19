const SequelizeMock = require('sequelize-mock');
const { ContractService, JobsService } = require('../business/service');
var dbMock = new SequelizeMock();

const profileResultMock = {
    id: 5,
    firstName: 'John',
    lastName: 'Lenon',
    profession: 'Musician',
    balance: 64,
    type: 'contractor'
}
const ProfileMock = dbMock.define('Profile', profileResultMock);


const contractResultMock = { 
    "ClientId": 1, 
    "ContractorId": 5, 
    "createdAt": "2022-09-19T15:08:25.117Z", 
    "id": 1, 
    "status": "terminated", 
    "terms": "bla bla bla", 
    "updatedAt": "2022-09-19T15:08:25.117Z",
    Contractor: profileResultMock
}
const ContractMock = dbMock.define('Contract', contractResultMock);

const jobsResultMock = {
    id: 1,
    description: 'work',
    paid: null,
    paymentDate: null,
    price: 200,
    ContractId: 1,
    ContractorId: 5,
    Contract: contractResultMock
}
var JobsMock = dbMock.define('Jobs', jobsResultMock);

const dummy = dbMock.define('dummy');

/**
 * NOTES: 
 *      1 - With more time the goal was to do unit tests for all cases
 *      2 - In this file are represented some examples of unit tests
 */

describe('Ensure ContractService, ', () => {
    let contractService;
    beforeAll(() => {
        contractService = new ContractService(ContractMock);
    });

    describe('when is called findAll ', () => {
        it(' and all process is success.', async () => {
            const result = await contractService.findAll();
            expect(result).not.toBeNull();
            expect(result).not.toHaveLength(0);
        });
        it(' and returns error.', async () => {
        });
    });
    describe('when is called findById ', () => {
        it(' and all process is success.', async () => {
            const result = await contractService.findById(1);
            expect(result).not.toBeNull();
            expect(result.id).toBe(1);
        });
        it(' and returns error.', () => { });
    });
    describe('when is called findByIdAndProfile ', () => {
        it(' and all process is success.', async () => {
            const result = await contractService.findByIdAndProfile(1, 5);
            expect(result).not.toBeNull();
            expect(result.id).toBe(1);
            expect(result.ContractorId).toBe(5);
        });
        it(' and returns error.', () => { });
    });
    describe('when is called findAllNotTerminated ', () => {
        it(' and all process is success.', async () => {
            const result = await contractService.findAllNotTerminated();
            expect(result).not.toBeNull();
        });
        it(' and returns error.', () => { });
    });
});

describe('Ensure JobsService, ', () => {
    let jobsService;
    beforeAll(() => {
        jobsService = new JobsService(JobsMock, ProfileMock);
        jobsService.pay = jest.fn();
        jobsService.deposit = jest.fn();
    });

    describe('when is called findAll ', () => {
        it(' and all process is success.', async () => {
            const result = await jobsService.findAll();
            expect(result).not.toBeNull();
            expect(result).not.toHaveLength(0);
        });
        it(' and returns error.', () => { });
    });
    describe('when is called findById ', () => {
        it(' and all process is success.', async () => {
            const result = await jobsService.findById(1);
            expect(result).not.toBeNull();
            expect(result.id).toBe(1);
        });
        it(' and returns error.', () => { });
    });
    describe('when is called findByUserId ', () => {
        it(' and all process is success.', async () => {
            const result = await jobsService.findByUserId(5);
            expect(result).not.toBeNull();
        });
        it(' and returns error.', () => { });
    });
    describe('when is called findAllUnpaid ', () => {
        it(' and all process is success.', () => { });
        it(' and returns error.', () => { });
    });
    describe('when is called findByTime ', () => {
        it(' and all process is success.', () => { });
        it(' and returns error.', () => { });
    });
    describe('when is called findAllUnpaid ', () => {
        it(' and all process is success.', () => { });
        it(' and returns error.', () => { });
    });
    describe('when is called handlerPay ', () => {
        it(' and all process is success.', async () => {
            const spy = jest.spyOn(jobsService, 'pay');
            const result = await jobsService.handlerPay(1);
            expect(result).not.toBeNull();
            expect(spy).toBeCalled();
        });
        it(' and returns error.', () => { });
    });
    describe('when is called handlerDeposits ', () => {
        it(' and all process is success and not deposit more than 25%.', async () => { 
            const spy = jest.spyOn(jobsService, 'deposit');
            const result = await jobsService.handlerDeposits(1, 100);
            expect(result).not.toBeNull();
            expect(spy).not.toBeCalled();
        });
        it(' and all process is success.', async () => { 
            const spy = jest.spyOn(jobsService, 'deposit');
            const result = await jobsService.handlerDeposits(1, 1);
            expect(result).not.toBeNull();
            expect(spy).toBeCalled();
        });
        it(' and returns error.', () => { });
    });
});
