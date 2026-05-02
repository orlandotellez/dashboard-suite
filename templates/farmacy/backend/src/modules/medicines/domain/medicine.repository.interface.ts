// IMedicineRepository interface
// This defines the contract for medicine data access

const IMedicineRepository = {
    findById: async (id) => {},
    findAllActive: async (filters) => {},
    countActive: async (filters) => {},
    create: async (data) => {},
    update: async (id, data) => {},
    updateStock: async (id, stock) => {},
    incrementStock: async (id, amount) => {},
    decrementStock: async (id, amount) => {},
    softDelete: async (id) => {},
};

module.exports = { IMedicineRepository };
