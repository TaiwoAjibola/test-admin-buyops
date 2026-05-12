// ══════════════════════════════════════════════════════════════════════════
// MOCK API SERVICE - Test System (No Backend)
// All data is served from local mock data
// ══════════════════════════════════════════════════════════════════════════

import {
  mockUser,
  mockCompanies,
  mockAssets,
  mockClusters,
  mockAgents,
  mockFreelancers,
  mockLeads,
  mockTransactions,
  mockInstallmentPlans,
  mockNotifications,
  mockDashboardKPIs,
  mockDashboardCharts,
  mockInvoices,
  mockUsers,
  mockReports,
  mockInvestors,
} from '../app/lib/mock-data';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to create a deep copy
const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data));

// ══════════════════════════════════════════════════════════════════════════
// AUTH API
// ══════════════════════════════════════════════════════════════════════════

export const authApi = {
  login: async (email: string, password: string) => {
    await delay(500);
    // Accept any email/password for test system
    if (password.length >= 4) {
      return {
        user: mockUser,
        access_token: 'mock-access-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
      };
    }
    throw new Error('Invalid credentials');
  },

  register: async (data: any) => {
    await delay(500);
    return { user: { ...mockUser, ...data }, access_token: 'mock-token' };
  },

  logout: async () => {
    await delay(200);
    return;
  },

  getProfile: async () => {
    await delay(300);
    return clone(mockUser);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await delay(500);
    return { success: true };
  },

  forgotPassword: async (email: string) => {
    await delay(500);
    return { success: true };
  },

  resetPassword: async (token: string, newPassword: string) => {
    await delay(500);
    return { success: true };
  },

  setup2FA: async () => {
    await delay(300);
    return { secret: 'mock-secret', qrCode: 'mock-qr-code' };
  },

  enable2FA: async (token: string) => {
    await delay(300);
    return { success: true };
  },

  disable2FA: async (token: string) => {
    await delay(300);
    return { success: true };
  },

  verify2FA: async (interimToken: string, token: string) => {
    await delay(300);
    return {
      user: mockUser,
      access_token: 'mock-access-token-' + Date.now(),
      refresh_token: 'mock-refresh-token-' + Date.now(),
    };
  },
};

// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD API
// ══════════════════════════════════════════════════════════════════════════

export const dashboardApi = {
  getOverview: async () => {
    await delay(300);
    return clone(mockDashboardKPIs);
  },

  getRecentTransactions: async () => {
    await delay(300);
    return clone(mockTransactions.slice(0, 5));
  },

  getKPIs: async () => {
    await delay(300);
    return clone(mockDashboardKPIs);
  },

  getCharts: async () => {
    await delay(300);
    return clone(mockDashboardCharts);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// COMPANIES API
// ══════════════════════════════════════════════════════════════════════════

let companies = clone(mockCompanies);

export const companiesApi = {
  getAll: async (filters?: any) => {
    await delay(300);
    return clone(companies);
  },

  getById: async (id: string) => {
    await delay(200);
    const company = companies.find(c => c.id === id);
    if (!company) throw new Error('Company not found');
    return clone(company);
  },

  create: async (data: any) => {
    await delay(500);
    const newCompany = {
      id: 'comp-' + Date.now(),
      ...data,
      totalAssets: 0,
      activeAssets: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    companies.push(newCompany);
    return clone(newCompany);
  },

  update: async (id: string, data: any) => {
    await delay(500);
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Company not found');
    companies[index] = { ...companies[index], ...data };
    return clone(companies[index]);
  },

  delete: async (id: string) => {
    await delay(300);
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Company not found');
    companies.splice(index, 1);
    return { success: true };
  },

  updateStats: async (id: string) => {
    await delay(300);
    return { success: true };
  },
};

// ══════════════════════════════════════════════════════════════════════════
// ASSETS API
// ══════════════════════════════════════════════════════════════════════════

let assets = clone(mockAssets);

export const assetsApi = {
  getAll: async (filters?: any) => {
    await delay(300);
    let result = clone(assets);
    if (filters?.platform && filters.platform !== 'all') {
      result = result.filter(a => a.platform === filters.platform);
    }
    if (filters?.type && filters.type !== 'all') {
      result = result.filter(a => a.type.toLowerCase() === filters.type.toLowerCase());
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter(a => a.status === filters.status);
    }
    if (filters?.companyId) {
      result = result.filter(a => a.companyId === filters.companyId);
    }
    return result;
  },

  getById: async (id: string) => {
    await delay(200);
    const asset = assets.find(a => a.id === id);
    if (!asset) throw new Error('Asset not found');
    return clone(asset);
  },

  create: async (data: any) => {
    await delay(500);
    const platform = data.platform || 'BuyOps';
    const newAsset = {
      id: (platform === 'URBCO' ? 'urb-' : 'asset-') + Date.now(),
      platform,
      ...data,
      status: data.status || 'draft',
      createdAt: new Date().toISOString(),
    };
    assets.push(newAsset);
    return clone(newAsset);
  },

  update: async (id: string, data: any) => {
    await delay(500);
    const index = assets.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Asset not found');
    // Prevent changing platform from BuyOps to URBCO
    if (assets[index].platform === 'BuyOps' && data.platform === 'URBCO') {
      throw new Error('BuyOps assets cannot be transferred to URBCO');
    }
    assets[index] = { ...assets[index], ...data };
    return clone(assets[index]);
  },

  transferToBuyOps: async (id: string) => {
    await delay(500);
    const index = assets.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Asset not found');
    if (assets[index].platform !== 'URBCO') {
      throw new Error('Only URBCO assets can be transferred to BuyOps');
    }
    assets[index].platform = 'BuyOps';
    assets[index].id = 'asset-' + Date.now();
    assets[index].status = 'active';
    return clone(assets[index]);
  },

  delete: async (id: string) => {
    await delay(300);
    const index = assets.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Asset not found');
    assets.splice(index, 1);
    return { success: true };
  },

  publish: async (id: string) => {
    await delay(300);
    const index = assets.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Asset not found');
    assets[index].status = 'active';
    return clone(assets[index]);
  },

  unpublish: async (id: string) => {
    await delay(300);
    const index = assets.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Asset not found');
    assets[index].status = 'draft';
    return clone(assets[index]);
  },

  uploadImages: async (id: string, formData: FormData) => {
    await delay(500);
    return { success: true, uploaded: 1 };
  },

  uploadDocuments: async (id: string, formData: FormData) => {
    await delay(500);
    return { success: true, uploaded: 1 };
  },

  addImage: async (id: string, imageData: any) => {
    await delay(300);
    return { success: true };
  },

  deleteImage: async (assetId: string, imageId: string) => {
    await delay(300);
    return { success: true };
  },

  addDocument: async (id: string, documentData: any) => {
    await delay(300);
    return { success: true };
  },

  deleteDocument: async (assetId: string, documentId: string) => {
    await delay(300);
    return { success: true };
  },

  getBySearch: async (query: any) => {
    await delay(300);
    let result = clone(assets);
    if (query.name) {
      result = result.filter(a => a.name.toLowerCase().includes(query.name.toLowerCase()));
    }
    if (query.id) {
      result = result.filter(a => a.id === query.id || a.referenceCode === query.id);
    }
    return result;
  },
};

// ══════════════════════════════════════════════════════════════════════════
// TRANSACTIONS API
// ══════════════════════════════════════════════════════════════════════════

let transactions = clone(mockTransactions);

export const transactionsApi = {
  getAll: async (filters?: any) => {
    await delay(300);
    return clone(transactions);
  },

  getById: async (id: string) => {
    await delay(200);
    const txn = transactions.find(t => t.id === id);
    if (!txn) throw new Error('Transaction not found');
    return clone(txn);
  },

  create: async (data: any) => {
    await delay(500);
    const newTxn = {
      id: 'txn-' + Date.now(),
      ...data,
      date: new Date().toISOString(),
    };
    transactions.push(newTxn);
    return clone(newTxn);
  },

  update: async (id: string, data: any) => {
    await delay(500);
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Transaction not found');
    transactions[index] = { ...transactions[index], ...data };
    return clone(transactions[index]);
  },

  getStats: async () => {
    await delay(300);
    return {
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
      completedTransactions: transactions.filter(t => t.status === 'completed').length,
      pendingTransactions: transactions.filter(t => t.status === 'pending').length,
    };
  },

  getUnpaidCommissions: async (month?: string) => {
    await delay(300);
    return clone(transactions.filter(t => t.commissionStatus === 'unpaid'));
  },

  getPaidCommissions: async (month?: string) => {
    await delay(300);
    return clone(transactions.filter(t => t.commissionStatus === 'paid'));
  },

  sendCommissions: async (transactionIds: string[]) => {
    await delay(500);
    transactionIds.forEach(id => {
      const index = transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        transactions[index].commissionStatus = 'paid';
      }
    });
    return { success: true, count: transactionIds.length };
  },

  uploadPaymentProof: async (file: File) => {
    await delay(500);
    return { success: true };
  },
};

// ══════════════════════════════════════════════════════════════════════════
// COMMISSIONS API
// ══════════════════════════════════════════════════════════════════════════

export const commissionsApi = {
  getSummary: async () => {
    await delay(300);
    return clone(mockReports.commissions);
  },

  getUnpaid: async (month?: string) => {
    await delay(300);
    return clone(transactions.filter(t => t.commissionStatus === 'unpaid'));
  },

  getPaid: async (month?: string) => {
    await delay(300);
    return clone(transactions.filter(t => t.commissionStatus === 'paid'));
  },

  markAsPaid: async (transactionIds: string[]) => {
    await delay(500);
    return transactionsApi.sendCommissions(transactionIds);
  },

  getByTransaction: async (transactionId: string) => {
    await delay(200);
    const txn = transactions.find(t => t.id === transactionId);
    if (!txn) throw new Error('Transaction not found');
    return clone(txn);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// INSTALLMENTS API
// ══════════════════════════════════════════════════════════════════════════

let installmentPlans = clone(mockInstallmentPlans);

export const installmentsApi = {
  getAll: async (status?: string) => {
    await delay(300);
    let result = clone(installmentPlans);
    if (status) {
      result = result.filter(p => p.status === status);
    }
    return result;
  },

  getById: async (id: string) => {
    await delay(200);
    const plan = installmentPlans.find(p => p.id === id);
    if (!plan) throw new Error('Installment plan not found');
    return clone(plan);
  },

  getSchedule: async (id: string) => {
    await delay(300);
    const plan = installmentPlans.find(p => p.id === id);
    if (!plan) throw new Error('Installment plan not found');
    return clone(plan.installments);
  },

  create: async (data: any) => {
    await delay(500);
    const newPlan = {
      id: 'installment-' + Date.now(),
      ...data,
      installments: [],
    };
    installmentPlans.push(newPlan);
    return clone(newPlan);
  },

  recordPayment: async (planId: string, installmentId: string, data: any) => {
    await delay(500);
    return { success: true };
  },

  sendReminder: async (data: any) => {
    await delay(300);
    return { success: true };
  },

  getStats: async () => {
    await delay(300);
    return {
      totalPlans: installmentPlans.length,
      activePlans: installmentPlans.filter(p => p.status === 'active').length,
      totalPaid: installmentPlans.reduce((sum, p) => sum + p.paidAmount, 0),
      totalRemaining: installmentPlans.reduce((sum, p) => sum + p.remainingAmount, 0),
    };
  },

  getUpcoming: async () => {
    await delay(300);
    const upcoming: any[] = [];
    installmentPlans.forEach(plan => {
      plan.installments.forEach(inst => {
        if (inst.status === 'upcoming') {
          upcoming.push({ ...inst, planId: plan.id, buyerName: plan.buyerName });
        }
      });
    });
    return upcoming;
  },

  getOverdue: async () => {
    await delay(300);
    return [];
  },
};

// ══════════════════════════════════════════════════════════════════════════
// PAYMENTS API
// ══════════════════════════════════════════════════════════════════════════

export const paymentsApi = {
  getProviders: async () => {
    await delay(300);
    return ['paystack', 'flutterwave'];
  },

  initialize: async (data: any) => {
    await delay(500);
    return {
      authorization_url: 'https://mock-payment.com/pay/' + Date.now(),
      reference: 'mock-ref-' + Date.now(),
    };
  },

  verify: async (provider: string, reference: string) => {
    await delay(500);
    return {
      status: 'success',
      reference,
      provider,
      amount: 1000000,
    };
  },
};

// ══════════════════════════════════════════════════════════════════════════
// LEADS API
// ══════════════════════════════════════════════════════════════════════════

let leads = clone(mockLeads);

export const leadsApi = {
  getAll: async (filters?: any) => {
    await delay(300);
    return clone(leads);
  },

  getById: async (id: string) => {
    await delay(200);
    const lead = leads.find(l => l.id === id);
    if (!lead) throw new Error('Lead not found');
    return clone(lead);
  },

  create: async (data: any) => {
    await delay(500);
    const newLead = {
      id: 'lead-' + Date.now(),
      serialId: 'LEAD-' + Date.now().toString().slice(-3),
      ...data,
      dateReceived: new Date().toISOString(),
    };
    leads.push(newLead);
    return clone(newLead);
  },

  update: async (id: string, data: any) => {
    await delay(500);
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');
    leads[index] = { ...leads[index], ...data };
    return clone(leads[index]);
  },

  assign: async (id: string, clusterId: string) => {
    await delay(300);
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');
    leads[index].status = 'assigned';
    leads[index].assignedCluster = clusterId;
    return clone(leads[index]);
  },

  assignBulk: async (leadIds: string[], assignmentType: string, clusterId?: string) => {
    await delay(500);
    leadIds.forEach(id => {
      const index = leads.findIndex(l => l.id === id);
      if (index !== -1) {
        if (assignmentType === 'all') {
          leads[index].status = 'available';
        } else {
          leads[index].status = 'assigned';
          leads[index].assignedCluster = clusterId || null;
        }
      }
    });
    return { success: true, count: leadIds.length };
  },

  updateStatus: async (id: string, status: string) => {
    await delay(300);
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');
    leads[index].status = status as any;
    return clone(leads[index]);
  },

  bulkImport: async (file: File) => {
    await delay(1000);
    return { created: 5, skipped: 0, errors: [] };
  },
};

// ══════════════════════════════════════════════════════════════════════════
// USERS API
// ══════════════════════════════════════════════════════════════════════════

let users = clone(mockUsers);

export const usersApi = {
  getAll: async (params?: any) => {
    await delay(300);
    let result = clone(users);
    if (params?.role) {
      result = result.filter(u => u.role === params.role);
    }
    if (params?.status) {
      result = result.filter(u => u.status === params.status);
    }
    if (params?.search) {
      const search = params.search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }
    return result;
  },

  getById: async (id: string) => {
    await delay(200);
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return clone(user);
  },

  create: async (data: any) => {
    await delay(500);
    const newUser = {
      id: 'user-' + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    return clone(newUser);
  },

  update: async (id: string, data: any) => {
    await delay(500);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...data };
    return clone(users[index]);
  },

  delete: async (id: string) => {
    await delay(300);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    users.splice(index, 1);
    return { success: true };
  },

  getUserStats: async (id: string) => {
    await delay(300);
    return {
      totalLeads: 0,
      closedDeals: 0,
      totalCommission: 0,
    };
  },

  deactivate: async (id: string) => {
    await delay(300);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index].status = 'INACTIVE';
    return clone(users[index]);
  },

  reactivate: async (id: string) => {
    await delay(300);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index].status = 'ACTIVE';
    return clone(users[index]);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// AGENTS API
// ══════════════════════════════════════════════════════════════════════════

let agents = clone(mockAgents);

export const agentsApi = {
  getAll: async () => {
    await delay(300);
    return clone(agents);
  },

  getById: async (id: string) => {
    await delay(200);
    const agent = agents.find(a => a.id === id);
    if (!agent) throw new Error('Agent not found');
    return clone(agent);
  },

  create: async (data: any) => {
    await delay(500);
    const newAgent = {
      id: 'agent-' + Date.now(),
      serialId: 'AGT-' + Date.now().toString().slice(-3),
      ...data,
      activeDeals: 0,
      closedDeals: 0,
      totalCommission: 0,
      commissionRate: 3.0,
      performance: 100,
      createdAt: new Date().toISOString(),
    };
    agents.push(newAgent);
    return clone(newAgent);
  },

  update: async (id: string, data: any) => {
    await delay(500);
    const index = agents.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Agent not found');
    agents[index] = { ...agents[index], ...data };
    return clone(agents[index]);
  },

  delete: async (id: string) => {
    await delay(300);
    const index = agents.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Agent not found');
    agents.splice(index, 1);
    return { success: true };
  },

  getStats: async () => {
    await delay(300);
    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'ACTIVE').length,
      totalDeals: agents.reduce((sum, a) => sum + a.activeDeals, 0),
      totalCommission: agents.reduce((sum, a) => sum + a.totalCommission, 0),
    };
  },

  getPerformance: async (id: string) => {
    await delay(300);
    const agent = agents.find(a => a.id === id);
    if (!agent) throw new Error('Agent not found');
    return clone(agent);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// CLUSTERS API
// ══════════════════════════════════════════════════════════════════════════

let clusters = clone(mockClusters);

export const clustersApi = {
  getAll: async () => {
    await delay(300);
    return clone(clusters);
  },

  getById: async (id: string) => {
    await delay(200);
    const cluster = clusters.find(c => c.id === id);
    if (!cluster) throw new Error('Cluster not found');
    return clone(cluster);
  },

  create: async (data: any) => {
    await delay(500);
    const newCluster = {
      id: 'cluster-' + Date.now(),
      ...data,
      agentCount: 0,
      totalLeads: 0,
      closedDeals: 0,
      totalRevenue: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    clusters.push(newCluster);
    return clone(newCluster);
  },

  update: async (id: string, data: any) => {
    await delay(500);
    const index = clusters.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Cluster not found');
    clusters[index] = { ...clusters[index], ...data };
    return clone(clusters[index]);
  },

  delete: async (id: string) => {
    await delay(300);
    const index = clusters.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Cluster not found');
    clusters.splice(index, 1);
    return { success: true };
  },

  addAgent: async (clusterId: string, agentId: string) => {
    await delay(300);
    return { success: true };
  },

  removeAgent: async (clusterId: string, agentId: string) => {
    await delay(300);
    return { success: true };
  },

  getStats: async () => {
    await delay(300);
    return {
      totalClusters: clusters.length,
      activeClusters: clusters.filter(c => c.status === 'active').length,
      totalAgents: clusters.reduce((sum, c) => sum + c.agentCount, 0),
      totalRevenue: clusters.reduce((sum, c) => sum + c.totalRevenue, 0),
    };
  },
};

// ══════════════════════════════════════════════════════════════════════════
// FREELANCERS API
// ══════════════════════════════════════════════════════════════════════════

let freelancers = clone(mockFreelancers);

export const freelancersApi = {
  getAll: async () => {
    await delay(300);
    return clone(freelancers);
  },

  getById: async (id: string) => {
    await delay(200);
    const freelancer = freelancers.find(f => f.id === id);
    if (!freelancer) throw new Error('Freelancer not found');
    return clone(freelancer);
  },

  create: async (data: any) => {
    await delay(500);
    const newFreelancer = {
      id: 'freelancer-' + Date.now(),
      ...data,
      totalLeads: 0,
      closedDeals: 0,
      totalCommission: 0,
      commissionRate: 2.0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    freelancers.push(newFreelancer);
    return clone(newFreelancer);
  },

  update: async (id: string, data: any) => {
    await delay(500);
    const index = freelancers.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Freelancer not found');
    freelancers[index] = { ...freelancers[index], ...data };
    return clone(freelancers[index]);
  },

  delete: async (id: string) => {
    await delay(300);
    const index = freelancers.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Freelancer not found');
    freelancers.splice(index, 1);
    return { success: true };
  },
};

// ══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS API
// ══════════════════════════════════════════════════════════════════════════

let notifications = clone(mockNotifications);

export const notificationsApi = {
  getAll: async () => {
    await delay(300);
    return clone(notifications);
  },

  getUnread: async () => {
    await delay(300);
    return clone(notifications.filter(n => !n.read));
  },

  markAsRead: async (id: string) => {
    await delay(200);
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Notification not found');
    notifications[index].read = true;
    return clone(notifications[index]);
  },

  markAllAsRead: async () => {
    await delay(300);
    notifications = notifications.map(n => ({ ...n, read: true }));
    return { success: true };
  },

  delete: async (id: string) => {
    await delay(300);
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Notification not found');
    notifications.splice(index, 1);
    return { success: true };
  },
};

// ══════════════════════════════════════════════════════════════════════════
// REPORTS API
// ══════════════════════════════════════════════════════════════════════════

export const reportsApi = {
  getSalesReport: async (params?: any) => {
    await delay(300);
    return clone(mockReports.sales);
  },

  getAssetReport: async (params?: any) => {
    await delay(300);
    return clone(mockReports.assets);
  },

  getInvestmentReports: async (params?: any) => {
    await delay(300);
    return clone(mockReports.investments);
  },

  getCommissionReports: async (params?: any) => {
    await delay(300);
    return clone(mockReports.commissions);
  },

  getPerformanceReports: async (params?: any) => {
    await delay(300);
    return clone(mockReports.performance);
  },

  exportReport: async (type: string, params?: any) => {
    await delay(500);
    // Return a mock blob
    return new Blob(['mock report data'], { type: 'application/pdf' });
  },
};

// ══════════════════════════════════════════════════════════════════════════
// INVESTORS API
// ══════════════════════════════════════════════════════════════════════════

let investors = clone(mockInvestors);

export const investorsApi = {
  getAll: async (filters?: any) => {
    await delay(300);
    let result = clone(investors);
    if (filters?.platform && filters.platform !== 'all') {
      result = result.filter(i => i.investorPlatform === filters.platform);
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter(i => i.status === filters.status);
    }
    return result;
  },

  getById: async (id: string) => {
    await delay(200);
    const investor = investors.find(i => i.id === id);
    if (!investor) throw new Error('Investor not found');
    return clone(investor);
  },

  create: async (data: any) => {
    await delay(500);
    const newInvestor = {
      id: 'inv-' + Date.now(),
      ...data,
      totalInvested: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      assets: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    investors.push(newInvestor);
    return clone(newInvestor);
  },

  update: async (id: string, data: any) => {
    await delay(500);
    const index = investors.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Investor not found');
    investors[index] = { ...investors[index], ...data };
    return clone(investors[index]);
  },

  delete: async (id: string) => {
    await delay(300);
    const index = investors.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Investor not found');
    investors.splice(index, 1);
    return { success: true };
  },

  recordPayment: async (investorId: string, assetId: string, amount: number) => {
    await delay(500);
    const index = investors.findIndex(i => i.id === investorId);
    if (index === -1) throw new Error('Investor not found');
    const assetIndex = investors[index].assets.findIndex((a: any) => a.assetId === assetId);
    if (assetIndex === -1) throw new Error('Asset investment not found');
    investors[index].assets[assetIndex].paid += amount;
    investors[index].assets[assetIndex].outstanding -= amount;
    investors[index].totalPaid += amount;
    investors[index].outstandingBalance -= amount;
    return clone(investors[index]);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// INVOICE API
// ══════════════════════════════════════════════════════════════════════════

export const invoicesApi = {
  getAll: async (params?: any) => {
    await delay(300);
    return {
      invoices: clone(mockInvoices),
      total: mockInvoices.length,
    };
  },
};

// ══════════════════════════════════════════════════════════════════════════
// MEDIA URL HELPER
// ══════════════════════════════════════════════════════════════════════════

export const resolveMediaUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  return url;
};

// ══════════════════════════════════════════════════════════════════════════
// GENERIC API (for compatibility)
// ══════════════════════════════════════════════════════════════════════════

export const api = {
  get: async (url: string) => {
    await delay(300);
    return { data: null };
  },
  post: async (url: string, data?: any) => {
    await delay(300);
    return { data: { success: true } };
  },
  put: async (url: string, data?: any) => {
    await delay(300);
    return { data: { success: true } };
  },
  delete: async (url: string) => {
    await delay(300);
    return { data: { success: true } };
  },
};
