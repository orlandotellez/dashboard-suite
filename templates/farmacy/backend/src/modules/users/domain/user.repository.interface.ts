// IUserRepository interface
// This defines the contract for user data access

const IUserRepository = {
    findByEmail: async (email) => {},
    findById: async (id) => {},
    findAllActive: async () => {},
    create: async (data) => {},
    update: async (id, data) => {},
    softDelete: async (id) => {},
};

module.exports = { IUserRepository };
