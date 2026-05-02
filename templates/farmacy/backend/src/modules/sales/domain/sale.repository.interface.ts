// ISaleRepository interface
// This defines the contract for sale data access

const ISaleRepository = {
    findById: async (id) => {},
    findAll: async (filters, skip, take) => {},
    count: async (filters) => {},
    create: async (data) => {},
    createItems: async (items) => {},
    updateMedicinesStock: async (updates) => {},
};

module.exports = { ISaleRepository };
