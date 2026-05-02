// IClientRepository interface
// This defines the contract for client data access

const IClientRepository = {
    findById: async (id) => {},
    findAllActive: async (filters, skip, take) => {},
    countActive: async (filters) => {},
    create: async (data) => {},
    update: async (id, data) => {},
    softDelete: async (id) => {},
    getPurchaseHistory: async (id) => {},
};

module.exports = { IClientRepository };
