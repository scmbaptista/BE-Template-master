const { Op } = require('sequelize');

/*
* Created:
* 1 - New file Service to be able to read better code and to use design pattern
* 3 - Added error handler with throw
*/


/**
 * ContractService - class that contains all method need to gest contracts
 */
class ContractService{

    async findAll(contractModels){
        const list = await contractModels.findAll({where: {
            status: {
                [Op.or]: [contractModels.statusTypes.values[0], contractModels.statusTypes.values[1]]
            }
        }});

        if(!list) throw {
            status: 404,
            message: 'The requested operation failed because a resource associated with the request could not be found.'
        }
        return list;
    }
}

module.exports = {
    ContractService
}