const { prisma } = require('@/config/prisma');
const { ForbiddenError } = require('@/core/errors/AppError');

const reportController = {
    salesReport: async (request, reply) => {
        const { startDate, endDate } = request.query;

        if (!startDate || !endDate) {
            throw new ForbiddenError('startDate and endDate are required');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (start > end) {
            throw new ForbiddenError('Invalid date range: end date must be after start date');
        }

        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (daysDiff > 90) {
            throw new ForbiddenError('Date range cannot exceed 90 days');
        }

        const sales = await prisma.sale.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                items: true,
            },
        });

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
        const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

        const byPaymentMethod = sales.reduce((acc, sale) => {
            acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
            return acc;
        }, {});

        const dailyBreakdown = {};
        sales.forEach(sale => {
            const date = sale.date.toISOString().split('T')[0];
            if (!dailyBreakdown[date]) {
                dailyBreakdown[date] = { sales: 0, revenue: 0 };
            }
            dailyBreakdown[date].sales++;
            dailyBreakdown[date].revenue += Number(sale.total);
        });

        return reply.send({
            totalSales,
            totalRevenue,
            avgSaleValue,
            byPaymentMethod,
            dailyBreakdown: Object.entries(dailyBreakdown).map(([date, data]) => ({
                date,
                ...data,
            })),
        });
    },

    topMedicines: async (request, reply) => {
        const { startDate, endDate, limit = 10 } = request.query;

        if (!startDate || !endDate) {
            throw new ForbiddenError('startDate and endDate are required');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const limitNum = Math.min(Number(limit), 50);

        const saleItems = await prisma.saleItem.findMany({
            where: {
                sale: {
                    date: {
                        gte: start,
                        lte: end,
                    },
                },
            },
            include: {
                medicine: {
                    select: { id: true, tradeName: true, genericName: true },
                },
            },
        });

        const medicineStats = {};
        saleItems.forEach(item => {
            const medId = item.medicineId;
            if (!medicineStats[medId]) {
                medicineStats[medId] = {
                    medicine: item.medicine,
                    totalSold: 0,
                    revenue: 0,
                    transactions: new Set(),
                };
            }
            medicineStats[medId].totalSold += item.quantity;
            medicineStats[medId].revenue += Number(item.unitPrice) * item.quantity;
            medicineStats[medId].transactions.add(item.saleId);
        });

        const sortedMedicines = Object.values(medicineStats)
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, limitNum)
            .map(stat => ({
                medicine: stat.medicine,
                totalSold: stat.totalSold,
                revenue: stat.revenue,
                transactions: stat.transactions.size,
            }));

        return reply.send(sortedMedicines);
    },

    dashboard: async (request, reply) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            totalMedicines,
            lowStockCount,
            totalClients,
            salesToday,
            salesThisMonth,
            revenueThisMonth
        ] = await Promise.all([
            prisma.medicine.count({ where: { deletedAt: null } }),
            prisma.medicine.count({ where: { deletedAt: null, stock: { lt: 10 } } }),
            prisma.client.count({ where: { deletedAt: null } }),
            prisma.sale.count({ where: { date: { gte: today } } }),
            prisma.sale.count({ where: { date: { gte: firstDayOfMonth } } }),
            prisma.sale.aggregate({
                where: { date: { gte: firstDayOfMonth } },
                _sum: { total: true },
            }),
        ]);

        return reply.send({
            totalMedicines,
            lowStockCount,
            totalClients,
            salesToday,
            salesThisMonth,
            revenueThisMonth: revenueThisMonth._sum.total || 0,
        });
    },

    stockStatus: async (request, reply) => {
        const { categoryId } = request.query;

        const where = { deletedAt: null };
        if (categoryId) where.categoryId = categoryId;

        const medicines = await prisma.medicine.findMany({
            where,
            select: { id: true, tradeName: true, stock: true, categoryId: true },
        });

        const outOfStock = medicines.filter(m => m.stock === 0);
        const lowStock = medicines.filter(m => m.stock > 0 && m.stock < 10);
        const adequateStock = medicines.filter(m => m.stock >= 10 && m.stock < 50);
        const wellStocked = medicines.filter(m => m.stock >= 50);

        return reply.send({
            outOfStock: { count: outOfStock.length, items: outOfStock },
            lowStock: { count: lowStock.length, items: lowStock },
            adequateStock: { count: adequateStock.length, items: adequateStock },
            wellStocked: { count: wellStocked.length, items: wellStocked },
        });
    },
};

module.exports = { reportController };
