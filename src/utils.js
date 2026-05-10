import { getFreshStore, serviceMeta } from './data.js';
import {
  defaultCompanyProfile,
  demoEmployeeAccounts,
  demoReceiptSeed,
  employeeRoleOptions,
  monthNames,
  monthShortNames,
  objectDistricts,
  reportServiceCodes,
  STORE_KEY,
  SESSION_KEY,
  THEME_KEY,
} from './config.js';

export const formatMoney = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);

export const today = () => new Date().toISOString().slice(0, 10);

export function buildDemoReceipt(id, [periodKey, accountId, service, amount, status]) {
  const { year, monthIndex } = parseMonthKey(periodKey);
  const paid = status === 'paid';
  const due = new Date(year, monthIndex + 1, 10);
  const paidAt = new Date(year, monthIndex + 1, 5);

  return {
    id,
    accountId,
    period: `${monthNames[monthIndex]} ${year}`,
    service,
    amount,
    status,
    dueDate: `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-10`,
    paidAt: paid ? `${paidAt.getFullYear()}-${String(paidAt.getMonth() + 1).padStart(2, '0')}-05` : null,
    method: paid ? (Number(id.replace(/\D/g, '')) % 2 === 0 ? 'МИР' : 'СБП') : null,
  };
}

export function ensureDemoData(store) {
  const nextUsers = [...(store.users ?? [])];
  demoEmployeeAccounts.forEach((account) => {
    const existing = nextUsers.find((user) => user.email === account.email && user.role === 'employee');
    if (existing) {
      existing.employeeRole = existing.employeeRole ?? account.employeeRole;
      existing.position = existing.position ?? account.position;
      existing.loginName = existing.loginName ?? account.loginName;
      return;
    }

    nextUsers.push({
      id: `employee-${account.loginName}`,
      role: 'employee',
      name: account.name,
      email: account.email,
      password: account.password,
      position: account.position,
      employeeRole: account.employeeRole,
      loginName: account.loginName,
    });
  });

  const nextReceipts = [...(store.receipts ?? [])];
  demoReceiptSeed.forEach((seed, index) => {
    const [periodKey, accountId, service] = seed;
    const receiptId = `demo-rcp-${periodKey}-${accountId}-${service}`;
    if (!nextReceipts.some((receipt) => receipt.id === receiptId)) {
      nextReceipts.push(buildDemoReceipt(receiptId, seed));
    }
  });

  const nextPayments = [...(store.payments ?? [])];
  nextReceipts
    .filter((receipt) => receipt.id.startsWith('demo-rcp-') && receipt.status === 'paid')
    .forEach((receipt) => {
      const paymentId = `pay-${receipt.id}`;
      if (!nextPayments.some((payment) => payment.id === paymentId)) {
        nextPayments.push({
          id: paymentId,
          receiptId: receipt.id,
          method: receipt.method,
          paidAt: receipt.paidAt,
          amount: receipt.amount,
        });
      }
    });

  return {
    ...store,
    users: nextUsers,
    receipts: nextReceipts,
    payments: nextPayments,
  };
}

export function loadStore() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    return ensureDemoData(saved ? JSON.parse(saved) : getFreshStore());
  } catch {
    return ensureDemoData(getFreshStore());
  }
}

export function loadSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function buildReceiptSummary(receipts) {
  const paid = receipts.filter((item) => item.status === 'paid');
  const unpaid = receipts.filter((item) => item.status === 'unpaid');

  return {
    paidCount: paid.length,
    unpaidCount: unpaid.length,
    paidAmount: paid.reduce((sum, item) => sum + item.amount, 0),
    unpaidAmount: unpaid.reduce((sum, item) => sum + item.amount, 0),
    totalAmount: receipts.reduce((sum, item) => sum + item.amount, 0),
  };
}

export function getServiceName(code) {
  return serviceMeta[code]?.name ?? code;
}

export function getReportServices() {
  return reportServiceCodes
    .filter((code) => serviceMeta[code])
    .map((code) => [code, serviceMeta[code]]);
}

export function normalizeEmployeeRole(role) {
  return employeeRoleOptions.includes(role) ? role : 'Диспетчер';
}

export function getOrganizations(store) {
  return store.organizations?.length ? store.organizations : [defaultCompanyProfile];
}

export function getHousePaymentStats(house) {
  return {
    paid: Math.max(house.accounts - house.debtors, 0),
    unpaid: house.debtors,
  };
}

export function getObjectTree(organization) {
  const cities = new Map();

  organization.houses.forEach((house) => {
    const city = house.address.split(',')[0]?.replace('г. ', '').trim() || 'Город не указан';
    const district = objectDistricts[house.id] ?? 'Район не указан';
    const stats = getHousePaymentStats(house);

    if (!cities.has(city)) {
      cities.set(city, { name: city, paid: 0, unpaid: 0, districts: new Map() });
    }

    const cityItem = cities.get(city);
    if (!cityItem.districts.has(district)) {
      cityItem.districts.set(district, { name: district, paid: 0, unpaid: 0, houses: [] });
    }

    const districtItem = cityItem.districts.get(district);
    const enrichedHouse = { ...house, paid: stats.paid, unpaid: stats.unpaid };
    districtItem.houses.push(enrichedHouse);
    districtItem.paid += stats.paid;
    districtItem.unpaid += stats.unpaid;
    cityItem.paid += stats.paid;
    cityItem.unpaid += stats.unpaid;
  });

  return Array.from(cities.values()).map((city) => ({
    ...city,
    districts: Array.from(city.districts.values()),
  }));
}

export function makeMonthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

export function parseMonthKey(key) {
  const [year, month] = key.split('-').map(Number);
  return { year, monthIndex: month - 1 };
}

export function getLastYearPeriodOptions() {
  const now = new Date();

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return {
      key: makeMonthKey(year, monthIndex),
      label: `${monthNames[monthIndex]} ${year}`,
    };
  });
}

export function getThreeMonthWindow(periodKey) {
  const { year, monthIndex } = parseMonthKey(periodKey);

  return Array.from({ length: 3 }, (_, index) => {
    const date = new Date(year, monthIndex - 2 + index, 1);
    const itemMonthIndex = date.getMonth();
    const itemYear = date.getFullYear();

    return {
      key: makeMonthKey(itemYear, itemMonthIndex),
      label: monthShortNames[itemMonthIndex],
      fullLabel: `${monthNames[itemMonthIndex]} ${itemYear}`,
    };
  });
}

export function getReceiptPeriodKey(period) {
  const [monthName, yearText] = period.split(' ');
  const monthIndex = monthNames.findIndex((name) => name.toLowerCase() === monthName?.toLowerCase());
  const year = Number(yearText);

  if (monthIndex < 0 || !year) {
    return '';
  }

  return makeMonthKey(year, monthIndex);
}

export function getLatestReceiptPeriodKey(receipts) {
  return receipts
    .map((receipt) => getReceiptPeriodKey(receipt.period))
    .filter(Boolean)
    .sort()
    .at(-1);
}

export function buildCompanyFromApplication(application, orgId) {
  return {
    ...defaultCompanyProfile,
    ...application,
    id: orgId,
    status: 'Одобрена',
    registryUpdatedAt: today(),
    houses: defaultCompanyProfile.houses,
    employees: [
      {
        id: `staff-${Date.now()}`,
        name: application.ownerName || 'Администратор компании',
        email: application.ownerEmail || 'owner@company.ru',
        phone: application.ownerPhone || '',
        role: 'Администратор',
        status: 'Активен',
      },
      ...defaultCompanyProfile.employees.slice(1),
    ],
    requests: defaultCompanyProfile.requests,
    registryEvents: [
      'Заявка компании одобрена',
      'Профиль организации создан по данным заявки',
      'Сведения из реестра подготовлены к сверке',
    ],
  };
}
