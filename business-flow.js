// B2B平台业务流数据管理
class BusinessFlowManager {
  constructor() {
    this.storageKey = 'b2b_business_data';
    this.initData();
  }

  // 初始化数据
  initData() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.data = JSON.parse(saved);
    } else {
      this.data = {
        opportunities: [], // 需求
        quotes: [],        // 报价
        samples: [],       // 样品
        orders: [],        // 订单
        interventions: [], // 干预记录
        lastId: {
          opportunity: 1000,
          quote: 100,
          sample: 10,
          order: 1,
          intervention: 1
        }
      };
      this.saveData();
    }
  }

  // 保存数据到本地存储
  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    this.dispatchEvent('dataUpdated');
  }

  // 事件系统
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  // 生成ID
  generateId(type) {
    const id = this.data.lastId[type]++;
    this.saveData();
    return `${type.toUpperCase()}-${id}`;
  }

  // ========== 需求管理 ==========
  
  // 创建需求
  createOpportunity(opportunityData) {
    const opportunity = {
      id: this.generateId('opportunity'),
      title: opportunityData.title || '未命名需求',
      buyer: opportunityData.buyer || '匿名采购商',
      category: opportunityData.category || '未分类',
      quantity: opportunityData.quantity || 0,
      budget: opportunityData.budget || [0, 0],
      status: 'published', // published, matching, quoted, compared, sampled, intervened, contracted, paid, completed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      matchedSuppliers: opportunityData.matchedSuppliers || [],
      currentStep: 1,
      totalSteps: 10,
      ...opportunityData
    };

    this.data.opportunities.unshift(opportunity);
    this.saveData();
    
    // 自动匹配供应商
    setTimeout(() => this.autoMatchSuppliers(opportunity.id), 1000);
    
    return opportunity;
  }

  // 自动匹配供应商
  autoMatchSuppliers(opportunityId) {
    const opportunity = this.data.opportunities.find(o => o.id === opportunityId);
    if (!opportunity) return;

    // 模拟匹配的供应商
    const matchedSuppliers = [
      { id: 'SUP-001', name: '临沂不锈钢制品厂', matchRate: 95 },
      { id: 'SUP-002', name: '义乌五金餐具厂', matchRate: 88 },
      { id: 'SUP-003', name: '山东临沂五金厂', matchRate: 74 }
    ];

    opportunity.matchedSuppliers = matchedSuppliers;
    opportunity.status = 'matching';
    opportunity.currentStep = 2;
    opportunity.updatedAt = new Date().toISOString();
    
    this.saveData();
    this.dispatchEvent('opportunityMatched', { opportunityId, matchedSuppliers });
  }

  // ========== 报价管理 ==========
  
  // 创建报价
  createQuote(quoteData) {
    const quote = {
      id: this.generateId('quote'),
      opportunityId: quoteData.opportunityId,
      supplier: quoteData.supplier || '匿名供应商',
      price: quoteData.price || 0,
      deliveryDays: quoteData.deliveryDays || 0,
      samplePolicy: quoteData.samplePolicy || 'none', // none, free, paid
      status: 'submitted', // submitted, reviewed, accepted, rejected
      createdAt: new Date().toISOString(),
      notes: quoteData.notes || '',
      ...quoteData
    };

    this.data.quotes.push(quote);
    
    // 更新需求状态
    const opportunity = this.data.opportunities.find(o => o.id === quoteData.opportunityId);
    if (opportunity) {
      if (opportunity.status === 'matching') {
        opportunity.status = 'quoted';
        opportunity.currentStep = 4;
      }
      opportunity.updatedAt = new Date().toISOString();
    }
    
    this.saveData();
    this.dispatchEvent('quoteCreated', { quote });
    
    return quote;
  }

  // ========== 比价管理 ==========
  
  // 添加到比价
  addToComparison(opportunityId, quoteIds) {
    const opportunity = this.data.opportunities.find(o => o.id === opportunityId);
    if (!opportunity) return;

    opportunity.status = 'compared';
    opportunity.currentStep = 5;
    opportunity.comparedQuotes = quoteIds;
    opportunity.updatedAt = new Date().toISOString();
    
    this.saveData();
    this.dispatchEvent('comparisonUpdated', { opportunityId, quoteIds });
  }

  // ========== 样品管理 ==========
  
  // 申请样品
  requestSample(sampleData) {
    const sample = {
      id: this.generateId('sample'),
      opportunityId: sampleData.opportunityId,
      quoteId: sampleData.quoteId,
      supplier: sampleData.supplier,
      status: 'requested', // requested, sent, received, confirmed, rejected
      requestedAt: new Date().toISOString(),
      ...sampleData
    };

    this.data.samples.push(sample);
    
    // 更新需求状态
    const opportunity = this.data.opportunities.find(o => o.id === sampleData.opportunityId);
    if (opportunity) {
      opportunity.status = 'sampled';
      opportunity.currentStep = 6;
      opportunity.updatedAt = new Date().toISOString();
    }
    
    this.saveData();
    this.dispatchEvent('sampleRequested', { sample });
    
    return sample;
  }

  // ========== 平台干预 ==========
  
  // 创建干预记录
  createIntervention(interventionData) {
    const intervention = {
      id: this.generateId('intervention'),
      opportunityId: interventionData.opportunityId,
      type: interventionData.type || 'manual_match', // manual_match, supplier_audit, contract_review
      operator: interventionData.operator || '平台运营',
      action: interventionData.action || '',
      status: 'completed',
      createdAt: new Date().toISOString(),
      ...interventionData
    };

    this.data.interventions.push(intervention);
    
    // 更新需求状态
    const opportunity = this.data.opportunities.find(o => o.id === interventionData.opportunityId);
    if (opportunity) {
      opportunity.status = 'intervened';
      opportunity.currentStep = 7;
      opportunity.updatedAt = new Date().toISOString();
    }
    
    this.saveData();
    this.dispatchEvent('interventionCreated', { intervention });
    
    return intervention;
  }

  // ========== 订单管理 ==========
  
  // 创建订单
  createOrder(orderData) {
    const order = {
      id: this.generateId('order'),
      opportunityId: orderData.opportunityId,
      quoteId: orderData.quoteId,
      supplier: orderData.supplier,
      buyer: orderData.buyer,
      amount: orderData.amount || 0,
      status: 'contracted', // contracted, paid, shipped, completed
      contractUrl: orderData.contractUrl || '#',
      paymentStatus: 'pending', // pending, paid, refunded
      createdAt: new Date().toISOString(),
      ...orderData
    };

    this.data.orders.push(order);
    
    // 更新需求状态
    const opportunity = this.data.opportunities.find(o => o.id === orderData.opportunityId);
    if (opportunity) {
      opportunity.status = 'contracted';
      opportunity.currentStep = 8;
      opportunity.updatedAt = new Date().toISOString();
    }
    
    this.saveData();
    this.dispatchEvent('orderCreated', { order });
    
    return order;
  }

  // ========== 查询方法 ==========
  
  // 获取所有需求
  getOpportunities(status = null) {
    if (status) {
      return this.data.opportunities.filter(o => o.status === status);
    }
    return [...this.data.opportunities];
  }

  // 获取需求的报价
  getQuotesByOpportunity(opportunityId) {
    return this.data.quotes.filter(q => q.opportunityId === opportunityId);
  }

  // 获取需求的样品记录
  getSamplesByOpportunity(opportunityId) {
    return this.data.samples.filter(s => s.opportunityId === opportunityId);
  }

  // 获取需求的订单
  getOrderByOpportunity(opportunityId) {
    return this.data.orders.find(o => o.opportunityId === opportunityId);
  }

  // 获取统计信息
  getStats() {
    const opportunities = this.data.opportunities;
    return {
      total: opportunities.length,
      published: opportunities.filter(o => o.status === 'published').length,
      matching: opportunities.filter(o => o.status === 'matching').length,
      quoted: opportunities.filter(o => o.status === 'quoted').length,
      compared: opportunities.filter(o => o.status === 'compared').length,
      sampled: opportunities.filter(o => o.status === 'sampled').length,
      intervened: opportunities.filter(o => o.status === 'intervened').length,
      contracted: opportunities.filter(o => o.status === 'contracted').length,
      paid: opportunities.filter(o => o.status === 'paid').length,
      completed: opportunities.filter(o => o.status === 'completed').length
    };
  }

  // ========== 工具方法 ==========
  
  // 重置数据
  resetData() {
    localStorage.removeItem(this.storageKey);
    this.initData();
    this.dispatchEvent('dataReset');
  }

  // 导出数据
  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  // 导入数据
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this.data = data;
      this.saveData();
      this.dispatchEvent('dataImported');
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}

// 创建全局实例
window.businessFlow = new BusinessFlowManager();