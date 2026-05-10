import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Database,
  Download,
  Droplets,
  FileSpreadsheet,
  FileText,
  Flame,
  Gauge,
  Home,
  House,
  Landmark,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquare,
  Moon,
  Pencil,
  QrCode,
  ReceiptText,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  UserCog,
  UserRound,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react';
import { getFreshStore, serviceMeta } from './data.js';

const STORE_KEY = 'zhku-demo-store';
const SESSION_KEY = 'zhku-demo-session';
const PARTNER_APPLICATIONS_KEY = 'zhku-partner-applications';
const THEME_KEY = 'zhku-theme';

const serviceIcons = {
  water: Droplets,
  gas: Flame,
  electricity: Zap,
  heating: Home,
  maintenance: Building2,
};

const employeeRoleOptions = ['Администратор', 'Диспетчер', 'Бухгалтер'];
const reportServiceCodes = ['water', 'gas', 'electricity'];
const monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];
const monthShortNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const objectDistricts = {
  'house-1': 'Советский район',
  'house-2': 'Вахитовский район',
  'house-3': 'Приволжский район',
};

const registryCheckVariants = [
  {
    type: 'success',
    title: 'Данные совпадают',
    text: 'Сведения компании, лицензия, адреса и реквизиты соответствуют данным реестра.',
    details: ['Новых записей нет', 'Конфликтов не найдено'],
  },
  {
    type: 'warning',
    title: 'Есть новые данные',
    text: 'В реестре появились сведения, которых пока нет в кабинете.',
    details: ['Новый контактный телефон: +7 843 210-40-50', 'Конфликтов с текущими реквизитами нет'],
  },
  {
    type: 'warning',
    title: 'Найдены расхождения',
    text: 'Часть новых сведений конфликтует с текущими данными кабинета.',
    details: ['Юридический адрес отличается от сохраненного', 'Лицензия совпадает', 'Перед обновлением нужна ручная проверка'],
  },
];

const demoEmployeeAccounts = [
  {
    label: 'Диспетчер',
    email: 'dispatcher@demo.ru',
    password: 'demo',
    loginName: 'dispatcher',
    name: 'Анна Сергеева',
    employeeRole: 'Диспетчер',
    position: 'Диспетчер абонентской службы',
  },
  {
    label: 'Бухгалтер',
    email: 'accountant@demo.ru',
    password: 'demo',
    loginName: 'accountant',
    name: 'Ольга Миронова',
    employeeRole: 'Бухгалтер',
    position: 'Бухгалтер по начислениям',
  },
  {
    label: 'Сотрудник',
    email: 'employee@demo.ru',
    password: 'demo',
    loginName: 'employee',
    name: 'Антон Соколов',
    employeeRole: 'Диспетчер',
    position: 'Специалист абонентского отдела',
  },
];

const demoReceiptSeed = [
  ['2025-06', 'acc-1', 'water', 1260, 'paid'],
  ['2025-06', 'acc-1', 'gas', 820, 'paid'],
  ['2025-06', 'acc-2', 'electricity', 2040, 'paid'],
  ['2025-07', 'acc-1', 'water', 1310, 'paid'],
  ['2025-07', 'acc-1', 'electricity', 2290, 'paid'],
  ['2025-07', 'acc-2', 'gas', 790, 'paid'],
  ['2025-08', 'acc-1', 'water', 1370, 'paid'],
  ['2025-08', 'acc-2', 'electricity', 2180, 'unpaid'],
  ['2025-08', 'acc-2', 'gas', 840, 'paid'],
  ['2025-09', 'acc-1', 'water', 1290, 'paid'],
  ['2025-09', 'acc-1', 'electricity', 2410, 'paid'],
  ['2025-09', 'acc-2', 'gas', 860, 'unpaid'],
  ['2025-10', 'acc-1', 'water', 1440, 'paid'],
  ['2025-10', 'acc-2', 'electricity', 2320, 'paid'],
  ['2025-10', 'acc-2', 'water', 1190, 'paid'],
  ['2025-11', 'acc-1', 'water', 1490, 'paid'],
  ['2025-11', 'acc-1', 'gas', 910, 'paid'],
  ['2025-11', 'acc-2', 'electricity', 2510, 'unpaid'],
  ['2025-12', 'acc-1', 'water', 1530, 'paid'],
  ['2025-12', 'acc-1', 'electricity', 2660, 'paid'],
  ['2025-12', 'acc-2', 'gas', 930, 'paid'],
  ['2026-04', 'acc-1', 'water', 1580, 'paid'],
  ['2026-04', 'acc-1', 'gas', 980, 'unpaid'],
  ['2026-04', 'acc-2', 'electricity', 2440, 'paid'],
  ['2026-05', 'acc-1', 'water', 1620, 'unpaid'],
  ['2026-05', 'acc-1', 'electricity', 2780, 'unpaid'],
  ['2026-05', 'acc-2', 'gas', 940, 'paid'],
];

const defaultCompanyProfile = {
  id: 'org-demo',
  status: 'Одобрена',
  legalFullName: 'Общество с ограниченной ответственностью "Комфортный дом"',
  legalShortName: 'ООО "Комфортный дом"',
  taxId: '1655000000',
  kpp: '165501001',
  ogrn: '1261600000000',
  legalAddress: 'г. Казань, ул. Центральная, 10',
  actualAddress: 'г. Казань, ул. Центральная, 10',
  corporatePhone: '+7 843 200-10-20',
  corporateEmail: 'office@comfort-dom.ru',
  licenseNumber: 'ЛМКД-016-2026',
  bankAccount: '40702810000000000001',
  bankBik: '049205000',
  registryUpdatedAt: '2026-05-08',
  houses: [
    { id: 'house-1', address: 'г. Казань, ул. Светлая, 18', units: 124, accounts: 118, meters: 236, debtors: 18 },
    { id: 'house-2', address: 'г. Казань, ул. Центральная, 10', units: 96, accounts: 91, meters: 188, debtors: 11 },
    { id: 'house-3', address: 'г. Казань, ул. Озерная, 6', units: 72, accounts: 70, meters: 142, debtors: 6 },
  ],
  employees: [
    { id: 'staff-1', name: 'Иван Петров', email: 'owner@comfort-dom.ru', phone: '+7 900 555-44-33', role: 'Администратор', status: 'Активен' },
    { id: 'staff-2', name: 'Анна Сергеева', email: 'operator@comfort-dom.ru', phone: '+7 900 222-14-15', role: 'Диспетчер', status: 'Активен' },
    { id: 'staff-3', name: 'Ольга Миронова', email: 'accountant@comfort-dom.ru', phone: '+7 900 777-11-21', role: 'Бухгалтер', status: 'Ожидает приглашение' },
    { id: 'staff-4', name: 'Павел Кузнецов', email: 'master@comfort-dom.ru', phone: '+7 900 333-44-55', role: 'Диспетчер', status: 'Активен' },
  ],
  requests: [
    { id: 'req-1', topic: 'Протечка в подъезде', house: 'ул. Светлая, 18', status: 'В работе', assignee: 'Павел Кузнецов' },
    { id: 'req-2', topic: 'Перерасчет начисления', house: 'ул. Центральная, 10', status: 'Новая', assignee: 'Не назначен' },
    { id: 'req-3', topic: 'Проверка счетчика воды', house: 'ул. Озерная, 6', status: 'Закрыта', assignee: 'Анна Сергеева' },
  ],
  registryEvents: [
    'Обновлены сведения о домах из реестра',
    'Подтверждена лицензия управляющей организации',
    'Загружены лицевые счета для сверки начислений',
  ],
};

const formatMoney = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);

const today = () => new Date().toISOString().slice(0, 10);

function buildDemoReceipt(id, [periodKey, accountId, service, amount, status]) {
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

function ensureDemoData(store) {
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

function loadStore() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    return ensureDemoData(saved ? JSON.parse(saved) : getFreshStore());
  } catch {
    return ensureDemoData(getFreshStore());
  }
}

function loadSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function buildReceiptSummary(receipts) {
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

function getServiceName(code) {
  return serviceMeta[code]?.name ?? code;
}

function getReportServices() {
  return reportServiceCodes
    .filter((code) => serviceMeta[code])
    .map((code) => [code, serviceMeta[code]]);
}

function normalizeEmployeeRole(role) {
  return employeeRoleOptions.includes(role) ? role : 'Диспетчер';
}

function getOrganizations(store) {
  return store.organizations?.length ? store.organizations : [defaultCompanyProfile];
}

function getHousePaymentStats(house) {
  return {
    paid: Math.max(house.accounts - house.debtors, 0),
    unpaid: house.debtors,
  };
}

function getObjectTree(organization) {
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

function makeMonthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function parseMonthKey(key) {
  const [year, month] = key.split('-').map(Number);
  return { year, monthIndex: month - 1 };
}

function getLastYearPeriodOptions() {
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

function getThreeMonthWindow(periodKey) {
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

function getReceiptPeriodKey(period) {
  const [monthName, yearText] = period.split(' ');
  const monthIndex = monthNames.findIndex((name) => name.toLowerCase() === monthName?.toLowerCase());
  const year = Number(yearText);

  if (monthIndex < 0 || !year) {
    return '';
  }

  return makeMonthKey(year, monthIndex);
}

function getLatestReceiptPeriodKey(receipts) {
  return receipts
    .map((receipt) => getReceiptPeriodKey(receipt.period))
    .filter(Boolean)
    .sort()
    .at(-1);
}

function buildCompanyFromApplication(application, orgId) {
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

function ServiceBadge({ service }) {
  const Icon = serviceIcons[service] ?? ReceiptText;

  return (
    <span className={`service-badge service-${serviceMeta[service]?.accent ?? 'blue'}`}>
      <Icon size={16} />
      {getServiceName(service)}
    </span>
  );
}

function StatusBadge({ status }) {
  const paid = status === 'paid';

  return (
    <span className={`status-badge ${paid ? 'status-paid' : 'status-unpaid'}`}>
      {paid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {paid ? 'Оплачено' : 'Не оплачено'}
    </span>
  );
}

function Header({ user, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand-link" aria-label="На главную">
          <span className="brand-mark">
            <Building2 size={22} />
          </span>
          <span>
            <strong>ЖКУ Контроль</strong>
            <small>учет оплат</small>
          </span>
        </Link>

        <nav className="top-nav">
          <NavLink to="/">Главная</NavLink>
          <NavLink to="/partner">Стать партнером</NavLink>
          {user?.role === 'payer' && <NavLink to="/app">Кабинет</NavLink>}
          {user?.role === 'employee' && <NavLink to="/employee">Сотрудник</NavLink>}
          {user?.role === 'companyAdmin' && <NavLink to="/company-admin">Компания</NavLink>}
          {user ? (
            <button className="ghost-button" type="button" onClick={onLogout}>
              <LogOut size={18} />
              Выйти
            </button>
          ) : (
            <Link to="/auth" className="primary-link login-link">
              <LogIn size={18} />
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

const audienceContent = {
  citizen: {
    eyebrow: 'Для гражданина',
    title: 'Все платежи ЖКУ рядом, без бумажной путаницы',
    text: 'Плательщик видит квитанции по периодам, быстро проверяет долги и имитирует оплату через понятные способы.',
    action: 'Войти',
    href: '/auth',
    cards: [
      {
        icon: ShieldCheck,
        title: 'Проверка без регистрации',
        text: 'Введите лицевой счет и увидьте, какие периоды оплачены, а какие требуют внимания.',
      },
      {
        icon: ReceiptText,
        title: 'Квитанции по услугам',
        text: 'Вода, газ, электричество и содержание жилья собраны в одном личном кабинете.',
      },
      {
        icon: WalletCards,
        title: 'Оплата МИР и СБП',
        text: 'В дипломной версии платеж имитируется, но статус квитанции обновляется как в реальном сценарии.',
      },
    ],
  },
  employee: {
    eyebrow: 'Для сотрудников ЖКУ',
    title: 'Быстрая картина по оплатам и задолженностям',
    text: 'Сотрудник видит базовую статистику по оплаченным и неоплаченным квитанциям без ручного подсчета.',
    action: 'Войти',
    href: '/auth?role=employee',
    cards: [
      {
        icon: BarChart3,
        title: 'Сводка оплат',
        text: 'Количество и сумма оплаченных и неоплаченных квитанций отображаются в служебном кабинете.',
      },
      {
        icon: Gauge,
        title: 'Контроль задолженности',
        text: 'Статистика строится по фактическим статусам платежей из данных приложения.',
      },
      {
        icon: Building2,
        title: 'Основа для компаний',
        text: 'Регистрация компаний и расширенные отчеты запланированы следующими этапами.',
      },
    ],
  },
};

const faqByAudience = {
  citizen: [
    {
      question: 'Можно ли проверить задолженность без регистрации?',
      answer: 'Да. На главной странице достаточно ввести лицевой счет. Сервис покажет только статус задолженности, периоды и виды услуг.',
    },
    {
      question: 'Почему оплата пока называется имитацией?',
      answer: 'Для дипломного v1 реальная платежная интеграция не нужна. Интерфейс показывает сценарий оплаты, а статус квитанции меняется внутри приложения.',
    },
    {
      question: 'Какие данные скрыты при публичной проверке?',
      answer: 'Без входа не выводятся ФИО, адрес и другие персональные данные. Это сделано, чтобы проверка была полезной, но аккуратной.',
    },
  ],
  employee: [
    {
      question: 'Как компании начать работу на сайте?',
      answer: 'Компания подает заявку на странице партнерства, указывает юридические данные, банковские реквизиты, лицензию и данные первого администратора.',
    },
    {
      question: 'Какие роли сотрудников предусмотрены?',
      answer: 'Первый зарегистрировавший компанию пользователь становится администратором. Остальных сотрудников и их права компания сможет настроить позже в личном кабинете.',
    },
    {
      question: 'Можно ли приглашать сотрудников по почте?',
      answer: 'Да. После модерации компании администратор сможет отправлять сотрудникам приглашения на почту, а они будут заполнять свои данные и создавать пароль.',
    },
  ],
};

const demoCompanies = [
  'УК Комфортный дом',
  'Городские коммунальные системы',
  'Единый расчетный центр ЖКУ',
  'ЖКХ СЕРВИС ПЛЮС',
  'ДомСервис Казань',
  'Управдом Онлайн',
];

function ProjectFooter() {
  return (
    <footer className="footer-shell">
      <div className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand-link" aria-label="На главную">
              <span className="brand-mark">
                <Building2 size={22} />
              </span>
              <span>
                <strong>ЖКУ Контроль</strong>
                <small>учет коммунальных платежей</small>
              </span>
            </Link>
          </div>
          <div className="footer-links">
            <Link to="/about">
              Информация о проекте
            </Link>
            <a href="/downloads/zhku-control-desktop.txt" download>
              Скачать для компьютера
            </a>
            <a href="/downloads/zhku-control-mobile.txt" download>
              Скачать для телефона
            </a>
            <Link to="/partner">
              Стать партнером
            </Link>
            <Link to="/privacy">
              Политика конфиденциальности
            </Link>
          </div>
          <div className="footer-contact">
            <div className="footer-contact-title">
              <Landmark size={24} />
              <strong>Абонентский отдел</strong>
            </div>
            <span>Пн-Пт 9:00-18:00</span>
            <span>support@zhku-demo.ru</span>
            <span>+7 800 250-10-20</span>
          </div>
        </div>
        <div className="footer-note">
          <span>© 2026 ЖКУ Контроль. Все права защищены.</span>
          <span>Сделано для учета коммунальных платежей</span>
        </div>
      </div>
    </footer>
  );
}

function MinimalFooter() {
  return (
    <footer className="minimal-footer">
      <span>© 2026 ЖКУ Контроль. Все права защищены.</span>
      <span>Сделано для учета коммунальных платежей</span>
    </footer>
  );
}

function HomePage({ store, user, onLogout }) {
  const [accountNumber, setAccountNumber] = useState('407900000001');
  const [result, setResult] = useState(null);
  const [activeAudience, setActiveAudience] = useState('citizen');
  const audience = audienceContent[activeAudience];

  const checkDebt = (event) => {
    event.preventDefault();
    const account = store.accounts.find((item) => item.number === accountNumber.trim());

    if (!account) {
      setResult({ type: 'missing' });
      return;
    }

    const unpaid = store.receipts.filter(
      (item) => item.accountId === account.id && item.status === 'unpaid',
    );

    setResult({
      type: unpaid.length > 0 ? 'debt' : 'clear',
      accountNumber: account.number,
      unpaid,
    });
  };

  return (
    <div className="page">
      <Header user={user} onLogout={onLogout} />

      <main className="home-page">
        <section className="debt-hero check-panel">
          <div className="debt-hero-copy">
            <span className="section-kicker">Без регистрации</span>
            <h1>Проверка задолженности по ЖКУ</h1>
            <p>
              Введите лицевой счет и узнайте, какие прошлые периоды оплачены, а какие
              требуют внимания.
            </p>
          </div>

          <div className="debt-form-column">
            <form className="debt-check-form" onSubmit={checkDebt}>
              <label htmlFor="account">Лицевой счет</label>
              <div className="input-row">
                <input
                  id="account"
                  value={accountNumber}
                  onChange={(event) => setAccountNumber(event.target.value)}
                  placeholder="407900000001"
                />
                <button type="submit">
                  <ShieldCheck size={20} />
                  Проверить
                </button>
              </div>
              <small>Демо: 407900000001 — есть долг, 407900000002 — все оплачено.</small>
            </form>

            {result && <PublicCheckResult result={result} />}
          </div>
        </section>

        <section className="intro-block">
          <h2>Оплата ЖКУ, квитанции и задолженности в одном сервисе</h2>
          <p>
            Личный кабинет помогает жителям контролировать начисления, оплачивать
            квитанции и быстро понимать, остались ли неоплаченные периоды. Для
            сотрудников ЖКУ предусмотрен отдельный вход со статистикой оплат.
          </p>
          <div className="hero-actions">
            <Link to="/auth" className="primary-link">
              <UserRound size={18} />
              Войти плательщику
            </Link>
            <Link to="/auth?role=employee" className="primary-link secondary-action">
              <BarChart3 size={18} />
              Войти сотруднику
            </Link>
          </div>
        </section>

        <section className="audience-section">
          <div className="section-heading">
            <span className="section-kicker">Тип пользователя</span>
            <h2>Выберите, для кого смотреть возможности и вопросы</h2>
          </div>

          <div className="audience-switch" role="tablist" aria-label="Тип пользователя">
            <button
              className={activeAudience === 'citizen' ? 'active' : ''}
              type="button"
              onClick={() => setActiveAudience('citizen')}
            >
              Гражданин плательщик
            </button>
            <button
              className={activeAudience === 'employee' ? 'active' : ''}
              type="button"
              onClick={() => setActiveAudience('employee')}
            >
              Сотрудник ЖКУ
            </button>
          </div>

          <div className="section-heading audience-subheading">
            <span className="section-kicker">Наши сервисы</span>
            <h2>Возможности для разных пользователей</h2>
          </div>

          <div className="audience-content" key={activeAudience}>
            <div className="audience-copy">
              <span className="section-kicker">{audience.eyebrow}</span>
              <h3>{audience.title}</h3>
              <p>{audience.text}</p>
              <Link to={audience.href} className="primary-link">
                <LogIn size={18} />
                {audience.action}
              </Link>
            </div>
            <div className="home-card-grid">
              {audience.cards.map((service) => {
                const Icon = service.icon;
                return (
                  <article className="home-card" key={service.title}>
                    <Icon size={24} />
                    <h3>{service.title}</h3>
                    <p>{service.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="section-heading">
            <span className="section-kicker">Вопросы</span>
            <h2>Часто задаваемые вопросы</h2>
          </div>
          <div className="faq-list">
            {faqByAudience[activeAudience].map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <ProjectFooter />
    </div>
  );
}

function PublicCheckResult({ result }) {
  if (result.type === 'missing') {
    return (
      <div className="result-box result-warning">
        <AlertCircle size={22} />
        <div>
          <strong>Лицевой счет не найден</strong>
          <span>Проверьте номер и попробуйте снова.</span>
        </div>
      </div>
    );
  }

  if (result.type === 'clear') {
    return (
      <div className="result-box result-success">
        <BadgeCheck size={24} />
        <div>
          <strong>Прошлые периоды оплачены</strong>
          <span>По счету {result.accountNumber} задолженность не найдена.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="debt-list">
      <div className="result-box result-debt">
        <AlertCircle size={22} />
        <div>
          <strong>Есть неоплаченные периоды</strong>
          <span>По счету {result.accountNumber} найдено: {result.unpaid.length}</span>
        </div>
      </div>

      {result.unpaid.map((receipt) => (
        <div className="debt-row" key={receipt.id}>
          <div>
            <strong>{receipt.period}</strong>
            <ServiceBadge service={receipt.service} />
          </div>
          <span>{formatMoney(receipt.amount)}</span>
        </div>
      ))}
    </div>
  );
}

function InfoPage({ user, onLogout }) {
  return (
    <div className="page">
      <Header user={user} onLogout={onLogout} />
      <main className="static-page">
        <section className="static-panel">
          <span className="section-kicker">О проекте</span>
          <h1>ЖКУ Контроль</h1>
          <p>
            Это дипломное веб-приложение для отслеживания оплаты ЖКУ и задолженностей.
            Идея появилась из-за отсутствия удобного единого места для коммунальных
            платежей: неудобно оплачивать все в разных сервисах, сверять статусы вручную
            и хранить бумажные квитанции дома.
          </p>
          <p>
            В проекте есть публичная проверка задолженности по лицевому счету, личный
            кабинет плательщика, электронные квитанции, имитация оплаты через МИР и СБП,
            а также служебный кабинет сотрудника ЖКУ с базовой статистикой оплат.
          </p>
          <Link to="/" className="primary-link">Вернуться на главную</Link>
        </section>
      </main>
      <ProjectFooter />
    </div>
  );
}

function PrivacyPage({ user, onLogout }) {
  return (
    <div className="page">
      <Header user={user} onLogout={onLogout} />
      <main className="static-page">
        <section className="static-panel">
          <span className="section-kicker">Политика конфиденциальности</span>
          <h1>Защита данных пользователей</h1>
          <p>
            Демонстрационная версия не передает данные во внешние платежные сервисы и
            использует локальные демо-данные. Публичная проверка задолженности показывает
            только периоды, виды услуг и статус оплаты.
          </p>
          <p>
            Без авторизации сервис не раскрывает ФИО, адрес и другие персональные данные.
            Доступ к личному кабинету плательщика и служебному кабинету сотрудника
            разделяется по ролям.
          </p>
          <Link to="/" className="primary-link">Вернуться на главную</Link>
        </section>
      </main>
      <ProjectFooter />
    </div>
  );
}

function PartnerPage({ user, onLogout, approvePartnerApplication }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState([]);
  const [form, setForm] = useState({
    legalFullName: 'Общество с ограниченной ответственностью "Комфортный дом"',
    legalShortName: 'ООО "Комфортный дом"',
    taxId: '1655000000',
    legalAddress: 'г. Казань, ул. Центральная, 10',
    actualAddress: 'г. Казань, ул. Центральная, 10',
    corporatePhone: '+7 843 200-10-20',
    corporateEmail: 'office@comfort-dom.ru',
    licenseNumber: 'ЛМКД-016-2026',
    bankAccount: '40702810000000000001',
    bankBik: '049205000',
    ownerName: 'Иван Петров',
    ownerEmail: 'owner@comfort-dom.ru',
    ownerPhone: '+7 900 555-44-33',
    authMethod: 'Почта и пароль',
  });

  const update = (field, value) => {
    setSaved(false);
    setError('');
    setInvalidFields((current) => current.filter((item) => item !== field));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    const requiredFields = [
      'legalFullName',
      'legalShortName',
      'taxId',
      'legalAddress',
      'actualAddress',
      'corporatePhone',
      'corporateEmail',
      'licenseNumber',
      'bankAccount',
      'bankBik',
      'ownerName',
      'ownerEmail',
      'ownerPhone',
      'authMethod',
    ];
    const missingFields = requiredFields.filter((field) => !String(form[field] ?? '').trim());
    const wrongTaxId = form.taxId.trim() && !/^\d{10}(\d{2})?$/.test(form.taxId.trim());
    const nextInvalidFields = wrongTaxId ? [...missingFields, 'taxId'] : missingFields;

    if (nextInvalidFields.length > 0) {
      setInvalidFields([...new Set(nextInvalidFields)]);
      setError(wrongTaxId ? 'ИНН должен содержать 10 или 12 цифр.' : 'Заполните обязательные поля.');
      return;
    }

    const application = {
      id: `org-${Date.now()}`,
      verificationStatus: 'Одобрена',
      createdAt: new Date().toISOString(),
      firstUserAccess: 'Первый зарегистрировавший компанию пользователь становится администратором',
      ...form,
    };

    const savedApplications = JSON.parse(localStorage.getItem(PARTNER_APPLICATIONS_KEY) ?? '[]');
    localStorage.setItem(
      PARTNER_APPLICATIONS_KEY,
      JSON.stringify([...savedApplications, application]),
    );
    setSaved(true);
    setError('');
    setInvalidFields([]);
    approvePartnerApplication(application);
    navigate('/company-admin');
  };

  const fieldClass = (field) => (invalidFields.includes(field) ? 'field-error' : undefined);

  return (
    <div className="page">
      <Header user={user} onLogout={onLogout} />
      <main className="partner-page">
        <section className="partner-hero">
          <span className="section-kicker">Партнерство</span>
          <h1>Регистрация компании ЖКУ</h1>
          <p>
            Заявка создает профиль юридического лица и первого администратора компании.
            После модерации он сможет продолжить настройку сотрудников в личном кабинете.
          </p>
        </section>

        <form className="partner-form" onSubmit={submit}>
          <section className="form-section">
            <h2>1. Профиль юридического лица</h2>
            <div className="form-grid">
              <label className={fieldClass('legalFullName')}>
                Полное наименование
                <input value={form.legalFullName} onChange={(event) => update('legalFullName', event.target.value)} />
              </label>
              <label className={fieldClass('legalShortName')}>
                Краткое наименование
                <input value={form.legalShortName} onChange={(event) => update('legalShortName', event.target.value)} />
              </label>
              <label className={fieldClass('taxId')}>
                ИНН
                <input inputMode="numeric" value={form.taxId} onChange={(event) => update('taxId', event.target.value)} />
              </label>
              <label className={fieldClass('licenseNumber')}>
                Номер лицензии МКД
                <input value={form.licenseNumber} onChange={(event) => update('licenseNumber', event.target.value)} />
              </label>
              <label className={fieldClass('legalAddress')}>
                Юридический адрес
                <input value={form.legalAddress} onChange={(event) => update('legalAddress', event.target.value)} />
              </label>
              <label className={fieldClass('actualAddress')}>
                Фактический адрес
                <input value={form.actualAddress} onChange={(event) => update('actualAddress', event.target.value)} />
              </label>
              <label className={fieldClass('corporatePhone')}>
                Корпоративный телефон
                <input value={form.corporatePhone} onChange={(event) => update('corporatePhone', event.target.value)} />
              </label>
              <label className={fieldClass('corporateEmail')}>
                Корпоративная почта
                <input value={form.corporateEmail} onChange={(event) => update('corporateEmail', event.target.value)} />
              </label>
              <label className={fieldClass('bankAccount')}>
                Расчетный счет
                <input inputMode="numeric" value={form.bankAccount} onChange={(event) => update('bankAccount', event.target.value)} />
              </label>
              <label className={fieldClass('bankBik')}>
                БИК
                <input inputMode="numeric" value={form.bankBik} onChange={(event) => update('bankBik', event.target.value)} />
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>2. Первый администратор компании</h2>
            <div className="form-grid">
              <label className={fieldClass('ownerName')}>
                ФИО администратора
                <input value={form.ownerName} onChange={(event) => update('ownerName', event.target.value)} />
              </label>
              <label className={fieldClass('ownerEmail')}>
                Почта администратора
                <input value={form.ownerEmail} onChange={(event) => update('ownerEmail', event.target.value)} />
              </label>
              <label className={fieldClass('ownerPhone')}>
                Телефон администратора
                <input value={form.ownerPhone} onChange={(event) => update('ownerPhone', event.target.value)} />
              </label>
              <label className={fieldClass('authMethod')}>
                Способ входа
                <select value={form.authMethod} onChange={(event) => update('authMethod', event.target.value)}>
                  <option>Почта и пароль</option>
                  <option>ЕСИА / госуслуги</option>
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>3. Настройка сотрудников</h2>
            <p className="form-hint">
              Первый зарегистрировавший компанию пользователь получает права администратора.
              Выдачу доступов сотрудникам и приглашения лучше заполнить позже в личном
              кабинете компании, когда заявка пройдет модерацию.
            </p>
          </section>

          <button className="wide-button" type="submit">
            <Building2 size={18} />
            Отправить заявку на модерацию
          </button>
          {error && <div className="inline-error">{error}</div>}
          {saved && <div className="inline-success">Заявка сохранена локально и ожидает модерации.</div>}
        </form>
      </main>
      <ProjectFooter />
    </div>
  );
}

function AuthPage({ user, login, registerPayer, onLogout }) {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const roleParam = params.get('role');
  const initialRole =
    roleParam === 'employee' || roleParam === 'companyAdmin' ? roleParam : 'payer';
  const [role, setRole] = useState(initialRole);
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState([]);
  const [companyQuery, setCompanyQuery] = useState('УК Комфортный дом');
  const [companyListOpen, setCompanyListOpen] = useState(false);
  const companySearchRef = useRef(null);
  const [form, setForm] = useState({
    name: 'Мария Орлова',
    loginName: 'orlovam',
    email: 'payer@demo.ru',
    password: 'demo',
    accountNumber: '407900000001',
    phone: '+7 900 000-00-00',
    company: 'УК Комфортный дом',
  });

  const update = (field, value) => {
    setError('');
    setInvalidFields((current) => current.filter((item) => item !== field));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const filteredCompanies = demoCompanies.filter((company) =>
    company.toLocaleLowerCase('ru-RU').includes(companyQuery.toLocaleLowerCase('ru-RU')),
  );

  const chooseCompany = (company) => {
    setCompanyQuery(company);
    update('company', company);
    setCompanyListOpen(false);
  };

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!companySearchRef.current?.contains(event.target)) {
        setCompanyListOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const submit = (event) => {
    event.preventDefault();
    const requiredFields = mode === 'register'
      ? role !== 'payer'
        ? ['company', 'name', 'loginName', 'phone', 'email', 'password']
        : ['name', 'loginName', 'phone', 'email', 'accountNumber', 'password']
      : role !== 'payer'
        ? ['company', 'loginName', 'email', 'password']
        : ['accountNumber', 'loginName', 'email', 'password'];
    const missingFields = requiredFields.filter((field) => !String(form[field] ?? '').trim());

    if (missingFields.length > 0) {
      setInvalidFields(missingFields);
      setError('Заполните обязательные поля.');
      return;
    }

    if (mode === 'register') {
      if (role !== 'payer') {
        setError('Регистрация сотрудников и администраторов выполняется через заявку компании и приглашение.');
        return;
      }

      const created = registerPayer(form);
      if (!created.ok) {
        setError(created.message);
        return;
      }
      navigate('/app');
      return;
    }

    const signed = login(form.email, form.password, role);
    if (!signed.ok) {
      setError(signed.message);
      return;
    }
    navigate(role === 'companyAdmin' ? '/company-admin' : role === 'employee' ? '/employee' : '/app');
  };

  const switchToEmployee = () => {
    setRole('employee');
    setMode('login');
    setForm((current) => ({
      ...current,
      loginName: 'employee',
      email: 'employee@demo.ru',
      password: 'demo',
      company: 'УК Комфортный дом',
    }));
    setCompanyQuery('УК Комфортный дом');
    setError('');
    setInvalidFields([]);
  };

  const switchToCompanyAdmin = () => {
    setRole('companyAdmin');
    setMode('login');
    setForm((current) => ({
      ...current,
      loginName: 'admin',
      email: 'owner@comfort-dom.ru',
      password: 'demo',
      company: 'УК Комфортный дом',
    }));
    setCompanyQuery('УК Комфортный дом');
    setError('');
    setInvalidFields([]);
  };

  const switchToPayer = () => {
    setRole('payer');
    setMode('login');
    setForm((current) => ({
      ...current,
      loginName: 'orlovam',
      email: 'payer@demo.ru',
      password: 'demo',
      accountNumber: '407900000001',
    }));
    setError('');
    setInvalidFields([]);
  };

  const quickEmployeeLogin = (account) => {
    setRole('employee');
    setMode('login');
    setCompanyQuery('УК Комфортный дом');
    setForm((current) => ({
      ...current,
      loginName: account.loginName,
      email: account.email,
      password: account.password,
      company: 'УК Комфортный дом',
    }));
    setError('');
    setInvalidFields([]);

    const signed = login(account.email, account.password, 'employee');
    if (!signed.ok) {
      setError(signed.message);
      return;
    }
    navigate('/employee');
  };

  const fieldClass = (field) => (invalidFields.includes(field) ? 'field-error' : undefined);

  return (
    <div className="page">
      <Header user={user} onLogout={onLogout} />

      <main className="auth-page">
        <section className="auth-card auth-card-large">
          <span className="section-kicker">Вход в систему</span>
          <h1>
            {role === 'companyAdmin'
              ? 'Вход администратора компании'
              : role === 'employee'
                ? 'Вход сотрудника ЖКУ'
                : 'Вход гражданина плательщика'}
          </h1>
          <p>
            {role !== 'payer'
              ? 'Выберите компанию и войдите по логину, почте и паролю.'
              : 'Войдите по лицевому счету, логину, почте и паролю.'}
          </p>
          {role === 'employee' && (
            <div className="demo-login-panel">
              <span>Быстрый вход сотрудника</span>
              <div className="demo-login-buttons">
                {demoEmployeeAccounts.map((account) => (
                  <button
                    className="ghost-button"
                    key={account.email}
                    type="button"
                    onClick={() => quickEmployeeLogin(account)}
                  >
                    <LogIn size={18} />
                    {account.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <form className="stack-form" onSubmit={submit}>
            {mode === 'register' && (
              <>
                <label className={fieldClass('name')}>
                  ФИО
                  <input value={form.name} onChange={(event) => update('name', event.target.value)} />
                </label>
                <label className={fieldClass('loginName')}>
                  Логин
                  <input value={form.loginName} onChange={(event) => update('loginName', event.target.value)} />
                </label>
                <label className={fieldClass('phone')}>
                  Телефон
                  <input value={form.phone} onChange={(event) => update('phone', event.target.value)} />
                </label>
                <label className={fieldClass('email')}>
                  Почта
                  <input
                    value={form.email}
                    onChange={(event) => update('email', event.target.value)}
                    placeholder={role === 'companyAdmin' ? 'owner@comfort-dom.ru' : role === 'employee' ? 'employee@demo.ru' : 'payer@demo.ru'}
                  />
                </label>
                {role === 'payer' && (
                  <label className={fieldClass('accountNumber')}>
                    Лицевой счет
                    <input
                      value={form.accountNumber}
                      onChange={(event) => update('accountNumber', event.target.value)}
                    />
                  </label>
                )}
              </>
            )}

            {role === 'payer' && mode !== 'register' && (
              <label className={fieldClass('accountNumber')}>
                Лицевой счет
                <input
                  value={form.accountNumber}
                  onChange={(event) => update('accountNumber', event.target.value)}
                />
              </label>
            )}

            {role !== 'payer' && (
              <label className={`company-search ${fieldClass('company') ?? ''}`} ref={companySearchRef}>
                Компания ЖКУ
                <div className="company-input-row">
                  <input
                    value={companyQuery}
                    onChange={(event) => {
                      setCompanyQuery(event.target.value);
                      update('company', event.target.value);
                      setCompanyListOpen(true);
                    }}
                    onFocus={() => setCompanyListOpen(true)}
                    placeholder="Начните вводить название компании"
                  />
                  <button
                    aria-label="Открыть список компаний"
                    type="button"
                    onClick={() => setCompanyListOpen((open) => !open)}
                  >
                    ▾
                  </button>
                </div>
                {companyListOpen && (
                  <div className="company-options">
                    {(filteredCompanies.length > 0 ? filteredCompanies : ['Компания не найдена']).map((company) => (
                      <button
                        disabled={company === 'Компания не найдена'}
                        key={company}
                        type="button"
                        onClick={() => chooseCompany(company)}
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                )}
              </label>
            )}

            {mode !== 'register' && (
              <label className={fieldClass('loginName')}>
                Логин
                <input value={form.loginName} onChange={(event) => update('loginName', event.target.value)} />
              </label>
            )}

            {mode !== 'register' && (
              <label className={fieldClass('email')}>
                Почта
                <input
                  value={form.email}
                  onChange={(event) => update('email', event.target.value)}
                  placeholder={role === 'companyAdmin' ? 'owner@comfort-dom.ru' : role === 'employee' ? 'employee@demo.ru' : 'payer@demo.ru'}
                />
              </label>
            )}
            <label className={fieldClass('password')}>
              Пароль
              <input
                type="password"
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
              />
            </label>

            {error && <div className="inline-error">{error}</div>}

            <button type="submit" className="wide-button">
              <LogIn size={18} />
              {mode === 'register'
                ? 'Создать кабинет'
                : role === 'companyAdmin'
                  ? 'Войти как администратор'
                  : role === 'employee'
                    ? 'Войти как сотрудник'
                    : 'Войти'}
            </button>
          </form>

          <div className="auth-text-actions">
            {role === 'payer' ? (
              <>
                <button
                  type="button"
                  className="muted-action"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setInvalidFields([]);
                  }}
                >
                  Регистрация
                </button>
                <button type="button" className="underlined-action" onClick={switchToEmployee}>
                  войти как сотрудник ЖКУ
                </button>
                <button type="button" className="underlined-action" onClick={switchToCompanyAdmin}>
                  войти как администратор компании
                </button>
              </>
            ) : role === 'employee' ? (
              <>
                <button
                  type="button"
                  className="muted-action"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setInvalidFields([]);
                  }}
                >
                  Регистрация
                </button>
                <button type="button" className="underlined-action" onClick={switchToPayer}>
                  войти как гражданин плательщик
                </button>
                <button type="button" className="underlined-action" onClick={switchToCompanyAdmin}>
                  войти как администратор компании
                </button>
              </>
            ) : (
              <>
                <Link to="/partner" className="muted-action">
                  Регистрация компании
                </Link>
                <button type="button" className="underlined-action" onClick={switchToEmployee}>
                  войти как сотрудник ЖКУ
                </button>
                <button type="button" className="underlined-action" onClick={switchToPayer}>
                  войти как гражданин плательщик
                </button>
              </>
            )}
          </div>
        </section>
      </main>
      <MinimalFooter />
    </div>
  );
}

function ThemeSwitch({ theme, setTheme }) {
  const dark = theme === 'dark';

  return (
    <label className="theme-switch">
      <input
        checked={dark}
        type="checkbox"
        onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')}
      />
      <span className="theme-track">
        <span className="theme-thumb">{dark ? <Moon size={14} /> : <Sun size={14} />}</span>
      </span>
      <small>{dark ? 'Темная тема' : 'Светлая тема'}</small>
    </label>
  );
}

function UserMenu({ user, logout, theme, setTheme, settingsTo }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="profile-button" type="button" onClick={() => setOpen((current) => !current)}>
        <UserRound size={20} />
        <span>{user.name}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="profile-menu">
          <div className="profile-menu-head">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <ThemeSwitch theme={theme} setTheme={setTheme} />
          <Link className="profile-menu-link" to={settingsTo} onClick={() => setOpen(false)}>
            <Settings size={18} />
            Настройки
          </Link>
          <button className="profile-menu-link danger-link" type="button" onClick={logout}>
            <LogOut size={18} />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}

function WorkspaceTopbar({ user, logout, theme, setTheme, settingsTo }) {
  return (
    <header className="workspace-topbar">
      <div>
        <span className="section-kicker">Рабочая область</span>
        <strong>{user.role === 'companyAdmin' ? 'Администратор компании' : user.name}</strong>
      </div>
      <UserMenu
        user={user}
        logout={logout}
        theme={theme}
        setTheme={setTheme}
        settingsTo={settingsTo}
      />
    </header>
  );
}

function RequireRole({ user, role, children }) {
  if (!user || user.role !== role) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function PayerLayout({ user, store, logout, updateProfile, payReceipt, theme, setTheme }) {
  const account = store.accounts.find((item) => item.id === user.accountId);
  const receipts = store.receipts.filter((item) => item.accountId === user.accountId);
  const summary = buildReceiptSummary(receipts);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand-link side-brand">
          <span className="brand-mark">
            <Building2 size={22} />
          </span>
          <span>
            <strong>ЖКУ Контроль</strong>
            <small>{account?.number}</small>
          </span>
        </Link>

        <nav className="side-nav">
          <NavLink end to="/app">
            <LayoutDashboard size={18} />
            Главное
          </NavLink>
          <NavLink to="/app/receipts">
            <ReceiptText size={18} />
            Квитанции
          </NavLink>
          <NavLink to="/app/pay">
            <WalletCards size={18} />
            Оплата
          </NavLink>
          <NavLink to="/app/profile">
            <UserRound size={18} />
            Профиль
          </NavLink>
          <NavLink to="/app/settings">
            <Settings size={18} />
            Настройки
          </NavLink>
        </nav>
      </aside>

      <main className="workspace">
        <WorkspaceTopbar
          user={user}
          logout={logout}
          theme={theme}
          setTheme={setTheme}
          settingsTo="/app/settings"
        />
        <Outlet context={{ user, account, receipts, summary, updateProfile, payReceipt, theme, setTheme }} />
      </main>
    </div>
  );
}

function PageTitle({ eyebrow, title, children }) {
  return (
    <div className="page-title">
      <div className="page-title-main">
        {eyebrow && <span className="section-kicker">{eyebrow}</span>}
        <h1>{title}</h1>
      </div>
      {children && <p>{children}</p>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className={`stat-card ${tone ?? ''}`}>
      <span className="stat-icon">
        <Icon size={22} />
      </span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PayerDashboard() {
  const { account, receipts, summary } = useOutletContext();
  const nextReceipt = receipts.find((item) => item.status === 'unpaid');

  return (
    <>
      <PageTitle eyebrow="Личный кабинет" title="Главное меню">
        Сводка по лицевому счету {account?.number}
      </PageTitle>

      <section className="stats-grid">
        <StatCard icon={AlertCircle} label="Не оплачено" value={formatMoney(summary.unpaidAmount)} tone="danger" />
        <StatCard icon={CheckCircle2} label="Оплачено" value={formatMoney(summary.paidAmount)} tone="success" />
        <StatCard icon={ReceiptText} label="Квитанций" value={receipts.length} />
      </section>

      <section className="dashboard-grid">
        <div className="work-panel">
          <h2>Ближайшее действие</h2>
          {nextReceipt ? (
            <div className="focus-receipt">
              <ServiceBadge service={nextReceipt.service} />
              <strong>{nextReceipt.period}</strong>
              <span>{formatMoney(nextReceipt.amount)}</span>
              <Link className="primary-link" to={`/app/pay/${nextReceipt.id}`}>
                <WalletCards size={18} />
                Оплатить
              </Link>
            </div>
          ) : (
            <div className="empty-state">
              <BadgeCheck size={28} />
              <strong>Задолженности нет</strong>
              <span>Все квитанции по текущим демо-данным оплачены.</span>
            </div>
          )}
        </div>

        <div className="work-panel">
          <h2>Разделы</h2>
          <div className="action-grid">
            <Link to="/app/receipts">
              <ReceiptText size={22} />
              Квитанции
            </Link>
            <Link to="/app/pay">
              <CreditCard size={22} />
              Оплата
            </Link>
            <Link to="/app/profile">
              <Pencil size={22} />
              Профиль
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function ReceiptsPage() {
  const { receipts } = useOutletContext();
  const [filter, setFilter] = useState('all');

  const filtered = receipts.filter((item) => filter === 'all' || item.status === filter);

  return (
    <>
      <PageTitle eyebrow="Квитанции" title="Платежные документы">
        Периоды, услуги, суммы и текущие статусы оплаты.
      </PageTitle>

      <div className="toolbar">
        {[
          ['all', 'Все'],
          ['unpaid', 'Не оплачены'],
          ['paid', 'Оплачены'],
        ].map(([value, label]) => (
          <button
            className={filter === value ? 'active' : ''}
            key={value}
            type="button"
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="receipt-list">
        {filtered.map((receipt) => (
          <article className="receipt-card" key={receipt.id}>
            <div className="receipt-main">
              <FileText size={22} />
              <div>
                <strong>{receipt.period}</strong>
                <ServiceBadge service={receipt.service} />
              </div>
            </div>
            <div className="receipt-meta">
              <span>{formatMoney(receipt.amount)}</span>
              <StatusBadge status={receipt.status} />
            </div>
            <div className="receipt-actions">
              <Link to={`/app/receipts/${receipt.id}`} className="ghost-link">
                Детали
              </Link>
              {receipt.status === 'unpaid' && (
                <Link to={`/app/pay/${receipt.id}`} className="primary-link">
                  <CreditCard size={18} />
                  Оплатить
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function ReceiptDetailPage() {
  const { receiptId } = useParams();
  const { receipts, account } = useOutletContext();
  const receipt = receipts.find((item) => item.id === receiptId);

  if (!receipt) {
    return <Navigate to="/app/receipts" replace />;
  }

  return (
    <>
      <PageTitle eyebrow="Квитанция" title={receipt.period}>
        Лицевой счет {account?.number}
      </PageTitle>

      <section className="detail-layout">
        <div className="detail-panel">
          <ServiceBadge service={receipt.service} />
          <dl className="detail-list">
            <div>
              <dt>Сумма</dt>
              <dd>{formatMoney(receipt.amount)}</dd>
            </div>
            <div>
              <dt>Срок оплаты</dt>
              <dd>{receipt.dueDate}</dd>
            </div>
            <div>
              <dt>Статус</dt>
              <dd><StatusBadge status={receipt.status} /></dd>
            </div>
            <div>
              <dt>Способ оплаты</dt>
              <dd>{receipt.method ?? 'Ожидает оплаты'}</dd>
            </div>
          </dl>
        </div>

        <div className="detail-actions">
          <Link to="/app/receipts" className="ghost-link">К списку</Link>
          {receipt.status === 'unpaid' && (
            <Link to={`/app/pay/${receipt.id}`} className="primary-link">
              <WalletCards size={18} />
              Перейти к оплате
            </Link>
          )}
        </div>
      </section>
    </>
  );
}

function PaymentPage() {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const { receipts, payReceipt } = useOutletContext();
  const unpaidReceipts = receipts.filter((item) => item.status === 'unpaid');
  const [selectedId, setSelectedId] = useState(receiptId ?? unpaidReceipts[0]?.id ?? '');
  const [method, setMethod] = useState('МИР');

  const selected = receipts.find((item) => item.id === selectedId);

  const submitPayment = () => {
    if (!selected || selected.status !== 'unpaid') {
      return;
    }

    payReceipt(selected.id, method);
    navigate('/app/receipts');
  };

  return (
    <>
      <PageTitle eyebrow="Оплата" title="Имитация платежа">
        Демо-оплата меняет статус квитанции и обновляет историю в приложении.
      </PageTitle>

      {unpaidReceipts.length === 0 ? (
        <div className="empty-state wide">
          <BadgeCheck size={30} />
          <strong>Нет неоплаченных квитанций</strong>
          <Link to="/app/receipts" className="ghost-link">Открыть список</Link>
        </div>
      ) : (
        <section className="payment-layout">
          <div className="payment-panel">
            <label>
              Квитанция
              <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                {unpaidReceipts.map((receipt) => (
                  <option key={receipt.id} value={receipt.id}>
                    {receipt.period} - {getServiceName(receipt.service)} - {formatMoney(receipt.amount)}
                  </option>
                ))}
              </select>
            </label>

            {selected && (
              <div className="payment-summary">
                <ServiceBadge service={selected.service} />
                <strong>{formatMoney(selected.amount)}</strong>
                <span>Период: {selected.period}</span>
              </div>
            )}
          </div>

          <div className="payment-panel">
            <h2>Способ оплаты</h2>
            <div className="payment-methods">
              <button
                className={method === 'МИР' ? 'selected' : ''}
                type="button"
                onClick={() => setMethod('МИР')}
              >
                <CreditCard size={24} />
                <strong>МИР</strong>
                <span>карта</span>
              </button>
              <button
                className={method === 'СБП' ? 'selected' : ''}
                type="button"
                onClick={() => setMethod('СБП')}
              >
                <QrCode size={24} />
                <strong>СБП</strong>
                <span>QR / банк</span>
              </button>
            </div>
            <button className="wide-button" type="button" onClick={submitPayment}>
              <Banknote size={18} />
              Подтвердить оплату
            </button>
          </div>
        </section>
      )}
    </>
  );
}

function ProfilePage() {
  const { user, account, updateProfile } = useOutletContext();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
  });
  const [saved, setSaved] = useState(false);

  const update = (field, value) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    updateProfile(form);
    setSaved(true);
  };

  return (
    <>
      <PageTitle eyebrow="Профиль" title="Данные аккаунта">
        Лицевой счет {account?.number}
      </PageTitle>

      <form className="profile-form" onSubmit={submit}>
        <label>
          ФИО
          <input value={form.name} onChange={(event) => update('name', event.target.value)} />
        </label>
        <label>
          Почта
          <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
        </label>
        <label>
          Телефон
          <input value={form.phone} onChange={(event) => update('phone', event.target.value)} />
        </label>
        <button type="submit" className="wide-button">
          <Pencil size={18} />
          Сохранить
        </button>
        {saved && <div className="inline-success">Данные обновлены</div>}
      </form>
    </>
  );
}

function SettingsPage({ scope = 'личного кабинета' }) {
  const { user, theme, setTheme, updateProfile } = useOutletContext();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
  });
  const [saved, setSaved] = useState(false);

  const update = (field, value) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitAccount = (event) => {
    event.preventDefault();
    updateProfile?.(form);
    setSaved(true);
  };

  return (
    <>
      <PageTitle title="Параметры кабинета">
        Настройка внешнего вида, уведомлений и данных аккаунта {scope}.
      </PageTitle>

      <section className="settings-grid">
        <div className="work-panel">
          <h2>Внешний вид</h2>
          <div className="settings-row">
            <div>
              <strong>Тема интерфейса</strong>
              <span>Переключение применяется ко всему сайту.</span>
            </div>
            <ThemeSwitch theme={theme} setTheme={setTheme} />
          </div>
        </div>

        <div className="work-panel">
          <h2>Уведомления</h2>
          <div className="settings-row">
            <div>
              <strong>Важные события</strong>
              <span>Оплаты, новые квитанции, заявки и изменения профиля.</span>
            </div>
            <button className="ghost-button" type="button" onClick={() => setSaved(true)}>
              <Bell size={18} />
              Включены
            </button>
          </div>
        </div>

        <form className="work-panel account-settings-form" onSubmit={submitAccount}>
          <h2>Аккаунт</h2>
          <label>
            Имя
            <input value={form.name} onChange={(event) => update('name', event.target.value)} />
          </label>
          <label>
            Почта
            <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
          </label>
          <label>
            Телефон
            <input value={form.phone} onChange={(event) => update('phone', event.target.value)} />
          </label>
          <span className="form-hint">Изменения применятся только после сохранения.</span>
          <button className="wide-button" type="submit">
            <Pencil size={18} />
            Сохранить
          </button>
        </form>
      </section>
      {saved && <div className="inline-success settings-saved">Изменения сохранены</div>}
    </>
  );
}

function EmployeeLayout({ user, store, logout, updateProfile, theme, setTheme }) {
  const summary = buildReceiptSummary(store.receipts);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand-link side-brand">
          <span className="brand-mark">
            <Building2 size={22} />
          </span>
          <span>
            <strong>ЖКУ Контроль</strong>
            <small>{user.employeeRole ?? 'сотрудник ЖКУ'}</small>
          </span>
        </Link>

        <nav className="side-nav">
          <NavLink end to="/employee">
            <LayoutDashboard size={18} />
            Главное
          </NavLink>
          <NavLink to="/employee/settings">
            <Settings size={18} />
            Настройки
          </NavLink>
        </nav>
      </aside>

      <main className="workspace">
        <WorkspaceTopbar
          user={user}
          logout={logout}
          theme={theme}
          setTheme={setTheme}
          settingsTo="/employee/settings"
        />
        <Outlet context={{ user, store, summary, updateProfile, theme, setTheme }} />
      </main>
    </div>
  );
}

function EmployeeDashboard() {
  const { user, store, summary } = useOutletContext();
  const employeeRole = user.employeeRole ?? (user.email.includes('accountant') ? 'Бухгалтер' : 'Диспетчер');

  if (employeeRole === 'Бухгалтер') {
    return <AccountantDashboard user={user} store={store} summary={summary} />;
  }

  return <DispatcherDashboard user={user} store={store} summary={summary} />;
}

function DispatcherDashboard({ user, store, summary }) {
  const tickets = [
    {
      id: 'ticket-1',
      topic: 'Не отображается оплата за воду',
      account: '407900000001',
      resident: 'Ирина Волкова',
      status: 'Новый',
      priority: 'Высокий',
    },
    {
      id: 'ticket-2',
      topic: 'Нужна детализация начисления по электричеству',
      account: '407900000002',
      resident: 'Демо-абонент',
      status: 'В работе',
      priority: 'Средний',
    },
    {
      id: 'ticket-3',
      topic: 'Ошибка в периоде квитанции',
      account: '407900000001',
      resident: 'Ирина Волкова',
      status: 'Ожидает ответа',
      priority: 'Обычный',
    },
  ];
  const disputedReceipts = store.receipts
    .filter((receipt) => receipt.status === 'unpaid')
    .slice(0, 5)
    .map((receipt) => ({
      ...receipt,
      accountNumber: store.accounts.find((account) => account.id === receipt.accountId)?.number ?? receipt.accountId,
    }));

  return (
    <>
      <PageTitle title="Кабинет диспетчера">
        Обращения жителей по квитанциям, оплатам, начислениям и спорным периодам.
      </PageTitle>

      <section className="stats-grid">
        <StatCard icon={MessageSquare} label="Новых обращений" value={tickets.filter((item) => item.status === 'Новый').length} />
        <StatCard icon={AlertCircle} label="Спорных квитанций" value={disputedReceipts.length} tone="danger" />
        <StatCard icon={ReceiptText} label="Не оплачено" value={summary.unpaidCount} />
      </section>

      <section className="employee-grid">
        <div className="work-panel">
          <h2>Очередь обращений</h2>
          <div className="ticket-list">
            {tickets.map((ticket) => (
              <article className="ticket-card" key={ticket.id}>
                <div>
                  <strong>{ticket.topic}</strong>
                  <span>{ticket.resident}, лицевой счет {ticket.account}</span>
                </div>
                <span className={`status-chip ${ticket.status === 'Новый' ? 'warning' : 'success'}`}>
                  {ticket.status}
                </span>
                <small>{ticket.priority}</small>
              </article>
            ))}
          </div>
        </div>

        <div className="work-panel">
          <h2>Квитанции с вопросами</h2>
          <div className="service-table">
            {disputedReceipts.map((receipt) => (
              <div key={receipt.id}>
                <ServiceBadge service={receipt.service} />
                <span>{receipt.period}</span>
                <strong>{receipt.accountNumber}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="module-grid">
        {[
          { icon: ReceiptText, title: 'Проверить квитанцию', text: 'Открыть период, услугу, сумму и историю статусов.' },
          { icon: MessageSquare, title: 'Ответить жителю', text: 'Подготовить комментарий по начислению или оплате.' },
          { icon: Database, title: 'Передать на сверку', text: 'Отправить спорную запись бухгалтерии или администратору.' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="module-card" key={item.title}>
              <Icon size={24} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          );
        })}
      </section>
    </>
  );
}

function AccountantDashboard({ user, store, summary }) {
  const byService = getReportServices().map(([code, meta]) => {
    const serviceReceipts = store.receipts.filter((item) => item.service === code);
    return {
      code,
      name: meta.name,
      unpaid: serviceReceipts.filter((item) => item.status === 'unpaid').length,
      amount: serviceReceipts.reduce((sum, item) => sum + item.amount, 0),
    };
  });
  const paidReceipts = store.receipts.filter((receipt) => receipt.status === 'paid');
  const monthlyRevenue = getLastYearPeriodOptions()
    .slice(-6)
    .map((period) => {
      const amount = paidReceipts
        .filter((receipt) => getReceiptPeriodKey(receipt.period) === period.key)
        .reduce((sum, receipt) => sum + receipt.amount, 0);

      return { ...period, amount };
    });
  const documents = [
    { title: 'Реестр начислений', meta: 'XLSX, все услуги' },
    { title: 'Акт сверки оплат', meta: 'PDF, выбранный период' },
    { title: 'Реестр должников', meta: 'CSV, неоплаченные счета' },
    { title: 'Отчет по выручке', meta: 'XLSX, помесячно' },
  ];

  return (
    <>
      <PageTitle title="Кабинет бухгалтера">
        Документы, выгрузки, выручка, задолженность и сверка денежных показателей.
      </PageTitle>

      <section className="stats-grid">
        <StatCard icon={CheckCircle2} label="Выручка" value={formatMoney(summary.paidAmount)} tone="success" />
        <StatCard icon={AlertCircle} label="Дебиторка" value={formatMoney(summary.unpaidAmount)} tone="danger" />
        <StatCard icon={FileSpreadsheet} label="Платежей" value={store.payments.length} />
      </section>

      <section className="employee-grid">
        <div className="work-panel">
          <h2>Денежная сводка</h2>
          <dl className="detail-list compact">
            <div>
              <dt>Оплаченных квитанций</dt>
              <dd>{summary.paidCount}</dd>
            </div>
            <div>
              <dt>Неоплаченных квитанций</dt>
              <dd>{summary.unpaidCount}</dd>
            </div>
            <div>
              <dt>Сотрудник</dt>
              <dd>{user.name}</dd>
            </div>
          </dl>
        </div>

        <div className="work-panel">
          <h2>По услугам</h2>
          <div className="service-table">
            {byService.map((item) => (
              <div key={item.code}>
                <ServiceBadge service={item.code} />
                <span>{formatMoney(item.amount)}</span>
                <strong>{item.unpaid} долг.</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="employee-grid">
        <div className="work-panel">
          <h2>Выручка за последние месяцы</h2>
          <div className="finance-list">
            {monthlyRevenue.map((item) => (
              <div key={item.key}>
                <span>{item.label}</span>
                <strong>{formatMoney(item.amount)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="work-panel">
          <h2>Документы и выгрузки</h2>
          <div className="document-grid">
            {documents.map((document) => (
              <button className="document-action" key={document.title} type="button">
                <FileSpreadsheet size={20} />
                <span>
                  <strong>{document.title}</strong>
                  <small>{document.meta}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function CompanyAdminLayout({
  user,
  store,
  logout,
  updateProfile,
  theme,
  setTheme,
  updateCompanyEmployeeRole,
  addCompanyEmployee,
  removeCompanyEmployee,
}) {
  const organizations = getOrganizations(store);
  const organization =
    organizations.find((item) => item.id === user.orgId) ?? organizations[0] ?? defaultCompanyProfile;
  const summary = buildReceiptSummary(store.receipts);
  const companyStats = {
    houses: organization.houses.reduce((sum, item) => sum + 1, 0),
    units: organization.houses.reduce((sum, item) => sum + item.units, 0),
    accounts: organization.houses.reduce((sum, item) => sum + item.accounts, 0),
    meters: organization.houses.reduce((sum, item) => sum + item.meters, 0),
    debtors: organization.houses.reduce((sum, item) => sum + item.debtors, 0),
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand-link side-brand">
          <span className="brand-mark">
            <Building2 size={22} />
          </span>
          <span>
            <strong>ЖКУ Контроль</strong>
            <small>{organization.legalShortName}</small>
          </span>
        </Link>

        <nav className="side-nav">
          <NavLink end to="/company-admin">
            <LayoutDashboard size={18} />
            Главное
          </NavLink>
          <NavLink to="/company-admin/company">
            <Database size={18} />
            Реестр
          </NavLink>
          <NavLink to="/company-admin/employees">
            <Users size={18} />
            Сотрудники
          </NavLink>
          <NavLink to="/company-admin/objects">
            <House size={18} />
            Объекты
          </NavLink>
          <NavLink to="/company-admin/statistics">
            <BarChart3 size={18} />
            Статистика
          </NavLink>
          <NavLink to="/company-admin/settings">
            <Settings size={18} />
            Настройки
          </NavLink>
        </nav>
      </aside>

      <main className="workspace">
        <WorkspaceTopbar
          user={user}
          logout={logout}
          theme={theme}
          setTheme={setTheme}
          settingsTo="/company-admin/settings"
        />
        <Outlet
          context={{
            user,
            store,
            organization,
            summary,
            companyStats,
            updateProfile,
            theme,
            setTheme,
            updateCompanyEmployeeRole,
            addCompanyEmployee,
            removeCompanyEmployee,
          }}
        />
      </main>
    </div>
  );
}

function CompanyAdminDashboard() {
  const { organization, summary, companyStats } = useOutletContext();
  const unpaidPercent = Math.round((summary.unpaidCount / Math.max(summary.paidCount + summary.unpaidCount, 1)) * 100);

  const cabinetModules = [
    { icon: Database, title: 'Данные из реестра', text: 'Название, ИНН, лицензия, реквизиты и дата последней сверки.', to: '/company-admin/company' },
    { icon: Users, title: 'Сотрудники и доступ', text: 'Назначение ролей и контроль приглашений сотрудников компании.', to: '/company-admin/employees' },
    { icon: House, title: 'Объекты управления', text: 'Дома, помещения, лицевые счета и приборы учета по адресам.', to: '/company-admin/objects' },
    { icon: MessageSquare, title: 'Обращения жителей', text: 'Заявки, статусы, ответственные и история обработки обращений.', to: '/company-admin/objects' },
    { icon: FileSpreadsheet, title: 'Отчеты и выгрузки', text: 'Статистика оплат, должники, начисления и файлы для дальнейшей обработки.', to: '/company-admin/statistics' },
    { icon: Bell, title: 'Журнал событий', text: 'Уведомления о загрузках, изменениях данных и действиях сотрудников.', to: '/company-admin/settings' },
  ];

  return (
    <>
      <PageTitle title="Кабинет администратора">
        {organization.legalShortName}
      </PageTitle>

      <section className="stats-grid">
        <StatCard icon={House} label="Домов в управлении" value={companyStats.houses} />
        <StatCard icon={ReceiptText} label="Лицевых счетов" value={companyStats.accounts} />
        <StatCard icon={AlertCircle} label="Доля неоплаты" value={`${unpaidPercent}%`} tone="danger" />
      </section>

      <section className="dashboard-grid">
        <div className="work-panel">
          <h2>Данные из реестра</h2>
          <dl className="detail-list compact">
            <div>
              <dt>Статус компании</dt>
              <dd>{organization.status}</dd>
            </div>
            <div>
              <dt>ИНН</dt>
              <dd>{organization.taxId}</dd>
            </div>
            <div>
              <dt>Лицензия</dt>
              <dd>{organization.licenseNumber}</dd>
            </div>
            <div>
              <dt>Последняя сверка</dt>
              <dd>{organization.registryUpdatedAt}</dd>
            </div>
          </dl>
        </div>

        <div className="work-panel">
          <h2>Что требует внимания</h2>
          <div className="attention-list">
            <span><AlertCircle size={18} /> {companyStats.debtors} лицевых счетов с задолженностью</span>
            <span><MessageSquare size={18} /> 2 обращения ждут назначения ответственного</span>
            <span><Users size={18} /> 1 сотрудник ожидает подтверждение приглашения</span>
          </div>
        </div>
      </section>

      <section className="module-grid">
        {cabinetModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link className="module-card" key={module.title} to={module.to}>
              <Icon size={24} />
              <h3>{module.title}</h3>
              <p>{module.text}</p>
            </Link>
          );
        })}
      </section>
    </>
  );
}

function CompanyRegistryPage() {
  const { organization } = useOutletContext();
  const [checkResult, setCheckResult] = useState(null);

  const runRegistryCheck = () => {
    setCheckResult(registryCheckVariants[Math.floor(Math.random() * registryCheckVariants.length)]);
  };

  return (
    <>
      <PageTitle title="Сведения о компании">
        Данные отображаются так, как будто они прошли сверку с реестром.
      </PageTitle>

      <section className="company-registry-grid">
        <div className="work-panel">
          <h2>Юридические сведения</h2>
          <dl className="detail-list compact">
            <div><dt>Полное наименование</dt><dd>{organization.legalFullName}</dd></div>
            <div><dt>Краткое наименование</dt><dd>{organization.legalShortName}</dd></div>
            <div><dt>ИНН</dt><dd>{organization.taxId}</dd></div>
            <div><dt>КПП</dt><dd>{organization.kpp}</dd></div>
            <div><dt>ОГРН</dt><dd>{organization.ogrn}</dd></div>
            <div><dt>Лицензия</dt><dd>{organization.licenseNumber}</dd></div>
            <div><dt>Статус заявки</dt><dd><span className="status-chip success registry-status">{organization.status}</span></dd></div>
          </dl>
        </div>

        <div className="work-panel">
          <h2>Контакты и реквизиты</h2>
          <dl className="detail-list compact">
            <div><dt>Юридический адрес</dt><dd>{organization.legalAddress}</dd></div>
            <div><dt>Фактический адрес</dt><dd>{organization.actualAddress}</dd></div>
            <div><dt>Телефон</dt><dd>{organization.corporatePhone}</dd></div>
            <div><dt>Почта</dt><dd>{organization.corporateEmail}</dd></div>
            <div><dt>Расчетный счет</dt><dd>{organization.bankAccount}</dd></div>
            <div><dt>БИК</dt><dd>{organization.bankBik}</dd></div>
          </dl>
        </div>
      </section>

      <section className="work-panel">
        <div className="panel-heading-row">
          <h2>Последние события сверки</h2>
          <button className="ghost-button" type="button" onClick={runRegistryCheck}>
            <Database size={18} />
            Сверить с реестром
          </button>
        </div>
        {checkResult && (
          <div className={`result-box ${checkResult.type === 'success' ? 'result-success' : 'result-warning'}`}>
            {checkResult.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
            <div>
              <strong>{checkResult.title}</strong>
              <span>{checkResult.text}</span>
              <ul className="registry-check-list">
                {checkResult.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <div className="timeline-list">
          {organization.registryEvents.map((event) => (
            <span key={event}><CheckCircle2 size={18} /> {event}</span>
          ))}
        </div>
      </section>
    </>
  );
}

function CompanyEmployeesPage() {
  const { user, organization, updateCompanyEmployeeRole, addCompanyEmployee, removeCompanyEmployee } = useOutletContext();
  const [draftRoles, setDraftRoles] = useState(() =>
    Object.fromEntries(organization.employees.map((employee) => [employee.id, normalizeEmployeeRole(employee.role)])),
  );
  const [newEmployee, setNewEmployee] = useState({ email: '', role: employeeRoleOptions[1] });
  const [openRoles, setOpenRoles] = useState(() =>
    Object.fromEntries(employeeRoleOptions.map((role) => [
      role,
      organization.employees.some((employee) => normalizeEmployeeRole(employee.role) === role),
    ])),
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraftRoles(Object.fromEntries(organization.employees.map((employee) => [employee.id, normalizeEmployeeRole(employee.role)])));
  }, [organization.employees]);

  const changeDraftRole = (employeeId, role) => {
    setSaved(false);
    setDraftRoles((current) => ({ ...current, [employeeId]: role }));
  };

  const saveRoles = () => {
    organization.employees.forEach((employee) => {
      const nextRole = draftRoles[employee.id];
      if (employee.email !== user.email && nextRole && nextRole !== employee.role) {
        updateCompanyEmployeeRole(organization.id, employee.id, nextRole);
      }
    });
    setSaved(true);
  };

  const addEmployee = (event) => {
    event.preventDefault();
    if (!newEmployee.email.trim()) {
      return;
    }
    addCompanyEmployee(organization.id, newEmployee);
    setNewEmployee({ email: '', role: employeeRoleOptions[1] });
    setOpenRoles((current) => ({ ...current, [newEmployee.role]: true }));
    setSaved(true);
  };

  const toggleRole = (role) => {
    setOpenRoles((current) => ({ ...current, [role]: !current[role] }));
  };

  const deleteEmployee = (employee) => {
    if (employee.email === user.email) {
      return;
    }
    removeCompanyEmployee(organization.id, employee.id);
    setSaved(true);
  };

  return (
    <>
      <PageTitle title="Роли и доступы">
        Добавление сотрудника по почте и изменение ролей применяются только после сохранения.
      </PageTitle>

      <form className="work-panel employee-add-form" onSubmit={addEmployee}>
        <h2>Добавить сотрудника</h2>
        <label>
          Почта
          <input
            type="email"
            value={newEmployee.email}
            onChange={(event) => setNewEmployee((current) => ({ ...current, email: event.target.value }))}
            placeholder="employee@company.ru"
          />
        </label>
        <label>
          Роль
          <select
            value={newEmployee.role}
            onChange={(event) => setNewEmployee((current) => ({ ...current, role: event.target.value }))}
          >
            {employeeRoleOptions.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <button className="wide-button" type="submit">
          <Users size={18} />
          Добавить
        </button>
      </form>

      <section className="employee-role-groups">
        {employeeRoleOptions.map((role) => {
          const employees = organization.employees.filter((employee) => normalizeEmployeeRole(employee.role) === role);
          const isOpen = openRoles[role] ?? false;

          return (
            <article className={`role-details ${isOpen ? 'open' : ''}`} key={role}>
              <div className="role-summary">
                <b className="role-count">{employees.length}</b>
                <span>{role}</span>
                <button
                  aria-label={`${isOpen ? 'Свернуть' : 'Развернуть'} роль ${role}`}
                  className="role-toggle-button"
                  type="button"
                  onClick={() => toggleRole(role)}
                >
                  <ChevronDown size={18} />
                </button>
              </div>
              {isOpen && (
                <div className="employee-role-list">
                {employees.length === 0 ? (
                  <div className="empty-state">Сотрудников с этой ролью пока нет</div>
                ) : (
                  employees.map((employee) => {
                    const isSelf = employee.email === user.email;

                    return (
                    <article className="employee-role-card" key={employee.id}>
                      <div className="employee-avatar">
                        <UserCog size={22} />
                      </div>
                      <div>
                        <strong>{employee.name}</strong>
                        <span>{employee.email}</span>
                        <small>{employee.phone || 'Телефон не указан'}</small>
                      </div>
                      <label>
                        Роль
                        <select
                          disabled={isSelf}
                          value={draftRoles[employee.id] ?? normalizeEmployeeRole(employee.role)}
                          onChange={(event) => changeDraftRole(employee.id, event.target.value)}
                        >
                          {employeeRoleOptions.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                      <span className={`status-chip ${employee.status === 'Активен' ? 'success' : 'warning'}`}>
                        {employee.status}
                      </span>
                      <button
                        className="ghost-button danger-action"
                        disabled={isSelf}
                        type="button"
                        onClick={() => deleteEmployee(employee)}
                      >
                        <Trash2 size={18} />
                        Удалить
                      </button>
                    </article>
                    );
                  })
                )}
                </div>
              )}
            </article>
          );
        })}
      </section>

      <div className="employee-save-row">
        <button className="wide-button" type="button" onClick={saveRoles}>
          <Pencil size={18} />
          Сохранить роли
        </button>
        {saved && <span className="inline-success">Изменения сохранены</span>}
      </div>
    </>
  );
}

function CompanyObjectsPage() {
  const { organization, companyStats } = useOutletContext();
  const objectTree = getObjectTree(organization);

  return (
    <>
      <PageTitle title="Дома, помещения и лицевые счета">
        Сводка по объектам управления, которые подгружаются из реестра.
      </PageTitle>

      <section className="stats-grid">
        <StatCard icon={House} label="Помещений" value={companyStats.units} />
        <StatCard icon={ReceiptText} label="Лицевых счетов" value={companyStats.accounts} />
        <StatCard icon={Gauge} label="Приборов учета" value={companyStats.meters} />
      </section>

      <section className="object-tree">
        {objectTree.map((city) => (
          <details className="object-details city-details" key={city.name} open>
            <summary>
              <span>{city.name}</span>
              <ObjectSummaryStats paid={city.paid} unpaid={city.unpaid} />
              <Link className="ghost-link compact-link" to={`/company-admin/statistics?scope=city&value=${encodeURIComponent(city.name)}`}>
                <BarChart3 size={16} />
                Статистика
              </Link>
            </summary>
            {city.districts.map((district) => (
              <details className="object-details district-details" key={district.name}>
                <summary>
                  <span>{district.name}</span>
                  <ObjectSummaryStats paid={district.paid} unpaid={district.unpaid} />
                  <Link className="ghost-link compact-link" to={`/company-admin/statistics?scope=district&value=${encodeURIComponent(district.name)}`}>
                    <BarChart3 size={16} />
                    Статистика
                  </Link>
                </summary>
                <div className="object-list">
                  {district.houses.map((house) => (
                    <article className="object-card" key={house.id}>
                      <House size={24} />
                      <div>
                        <strong>{house.address}</strong>
                        <span>{house.units} помещений, {house.accounts} лицевых счетов</span>
                      </div>
                      <ObjectSummaryStats paid={house.paid} unpaid={house.unpaid} />
                      <Link className="ghost-link compact-link" to={`/company-admin/statistics?scope=house&value=${encodeURIComponent(house.address)}`}>
                        <BarChart3 size={16} />
                        Статистика
                      </Link>
                    </article>
                  ))}
                </div>
              </details>
            ))}
          </details>
        ))}
      </section>
    </>
  );
}

function ObjectSummaryStats({ paid, unpaid }) {
  return (
    <span className="object-payment-stats">
      <b>{paid}</b> оплачено
      <b>{unpaid}</b> не оплачено
    </span>
  );
}

function CompanyStatisticsPage() {
  const { store, summary, organization, companyStats } = useOutletContext();
  const [searchParams] = useSearchParams();
  const objectTree = getObjectTree(organization);
  const scopeFromUrl = searchParams.get('scope') ?? 'all';
  const valueFromUrl = searchParams.get('value') ?? 'all';
  const [mode, setMode] = useState(scopeFromUrl === 'all' ? 'overview' : 'chart');
  const [scope, setScope] = useState(scopeFromUrl);
  const [selectedValue, setSelectedValue] = useState(valueFromUrl);
  const periodOptions = getLastYearPeriodOptions();
  const defaultPeriodKey =
    periodOptions.some((option) => option.key === getLatestReceiptPeriodKey(store.receipts))
      ? getLatestReceiptPeriodKey(store.receipts)
      : periodOptions.at(-1)?.key ?? makeMonthKey(new Date().getFullYear(), new Date().getMonth());
  const [periodKey, setPeriodKey] = useState(defaultPeriodKey);
  const [chartType, setChartType] = useState('comparison');
  const selectionOptions = [
    { scope: 'all', value: 'all', label: 'Все данные' },
    ...objectTree.flatMap((city) => [
      { scope: 'city', value: city.name, label: `Город: ${city.name}` },
      ...city.districts.flatMap((district) => [
        { scope: 'district', value: district.name, label: `Район: ${district.name}` },
        ...district.houses.map((house) => ({
          scope: 'house',
          value: house.address,
          label: `Дом: ${house.address}`,
        })),
      ]),
    ]),
  ];
  const selectedOption =
    selectionOptions.find((option) => option.scope === scope && option.value === selectedValue) ?? selectionOptions[0];
  const selectedStats = (() => {
    if (selectedOption.scope === 'city') {
      return objectTree.find((city) => city.name === selectedOption.value) ?? objectTree[0];
    }
    if (selectedOption.scope === 'district') {
      return objectTree.flatMap((city) => city.districts).find((district) => district.name === selectedOption.value);
    }
    if (selectedOption.scope === 'house') {
      return objectTree
        .flatMap((city) => city.districts)
        .flatMap((district) => district.houses)
        .find((house) => house.address === selectedOption.value);
    }
    return { paid: summary.paidCount, unpaid: summary.unpaidCount };
  })() ?? { paid: summary.paidCount, unpaid: summary.unpaidCount };
  const byService = getReportServices().map(([code]) => {
    const serviceReceipts = store.receipts.filter((item) => item.service === code);
    return {
      code,
      paid: serviceReceipts.filter((item) => item.status === 'paid').length,
      unpaid: serviceReceipts.filter((item) => item.status === 'unpaid').length,
      amount: serviceReceipts.reduce((sum, item) => sum + item.amount, 0),
    };
  });
  const chartMonths = getThreeMonthWindow(periodKey);
  const receiptMonthStats = Object.fromEntries(
    chartMonths.map((month) => {
      const receipts = store.receipts.filter((receipt) => getReceiptPeriodKey(receipt.period) === month.key);

      return [
        month.key,
        {
          paid: receipts.filter((receipt) => receipt.status === 'paid').length,
          unpaid: receipts.filter((receipt) => receipt.status === 'unpaid').length,
        },
      ];
    }),
  );
  const monthlyData = chartMonths.map((month, index) => {
    if (selectedOption.scope === 'all') {
      return { ...month, ...receiptMonthStats[month.key] };
    }

    const trend = 0.88 + index * 0.06;

    return {
      ...month,
      paid: Math.max(Math.round((selectedStats.paid ?? 0) * trend), 0),
      unpaid: Math.max(Math.round((selectedStats.unpaid ?? 0) * (1.08 - index * 0.04)), 0),
    };
  });
  const maxChartValue = Math.max(
    ...monthlyData.map((item) => Math.max(item.paid, item.unpaid)),
    1,
  );

  const changeSelection = (value) => {
    const [nextScope, ...rest] = value.split(':');
    setScope(nextScope);
    setSelectedValue(rest.join(':'));
    setMode(nextScope === 'all' ? 'overview' : 'chart');
  };

  return (
    <>
      <PageTitle title="Оплаты, долги и выгрузки">
        Сводка для администратора {organization.legalShortName}.
      </PageTitle>

      <section className="work-panel analytics-controls">
        <div className="mode-switch">
          <button className={mode === 'overview' ? 'active' : ''} type="button" onClick={() => setMode('overview')}>
            Общая статистика
          </button>
          <button className={mode === 'chart' ? 'active' : ''} type="button" onClick={() => setMode('chart')}>
            График по выбору
          </button>
        </div>
        <label>
          Данные для анализа
          <select value={`${scope}:${selectedValue}`} onChange={(event) => changeSelection(event.target.value)}>
            {selectionOptions.map((option) => (
              <option key={`${option.scope}:${option.value}`} value={`${option.scope}:${option.value}`}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Отчетный месяц
          <select value={periodKey} onChange={(event) => setPeriodKey(event.target.value)}>
            {periodOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Вид графика
          <select value={chartType} onChange={(event) => setChartType(event.target.value)}>
            <option value="comparison">Оплачено и не оплачено</option>
            <option value="paid">Только оплаты</option>
            <option value="unpaid">Только неоплаты</option>
          </select>
        </label>
      </section>

      {mode === 'overview' ? (
        <section className="stats-grid">
          <StatCard icon={CheckCircle2} label="Оплачено" value={formatMoney(summary.paidAmount)} tone="success" />
          <StatCard icon={AlertCircle} label="Не оплачено" value={formatMoney(summary.unpaidAmount)} tone="danger" />
          <StatCard icon={Users} label="Должников" value={companyStats.debtors} />
        </section>
      ) : (
        <section className="work-panel chart-panel">
          <div className="panel-heading-row">
            <h2>{selectedOption.label}</h2>
            <span className="chart-period-note">Последние 3 месяца до выбранного периода</span>
          </div>
          <div className={`period-chart ${chartType}`}>
            {monthlyData.map((item) => (
              <article className="period-chart-column" key={item.key}>
                <div className="period-bars">
                  {chartType !== 'unpaid' && (
                    <span
                      className="period-bar paid-bar"
                      style={{ height: `${Math.max((item.paid / maxChartValue) * 100, item.paid ? 8 : 0)}%` }}
                    />
                  )}
                  {chartType !== 'paid' && (
                    <span
                      className="period-bar unpaid-bar"
                      style={{ height: `${Math.max((item.unpaid / maxChartValue) * 100, item.unpaid ? 8 : 0)}%` }}
                    />
                  )}
                </div>
                <strong>{item.label}</strong>
                <span>{item.paid} оплачено</span>
                <span>{item.unpaid} не оплачено</span>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="employee-grid">
        <div className="work-panel">
          <h2>По услугам</h2>
          <div className="service-table">
            {byService.map((item) => (
              <div key={item.code}>
                <ServiceBadge service={item.code} />
                <span>{formatMoney(item.amount)}</span>
                <strong>{item.unpaid} не оплачено</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="work-panel">
          <h2>Выгрузки</h2>
          <div className="export-actions">
            <button className="ghost-button" type="button">
              <Download size={18} />
              Реестр должников
            </button>
            <button className="ghost-button" type="button">
              <FileSpreadsheet size={18} />
              Отчет по оплатам
            </button>
            <button className="ghost-button" type="button">
              <ClipboardList size={18} />
              Сводка заявок
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default function App() {
  const [store, setStore] = useState(loadStore);
  const [session, setSession] = useState(loadSession);
  const [theme, setTheme] = useState(loadTheme);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const currentUser = useMemo(
    () => store.users.find((item) => item.id === session?.userId) ?? null,
    [session, store.users],
  );

  const login = (email, password, role) => {
    const user = store.users.find(
      (item) => item.email === email.trim() && item.password === password && item.role === role,
    );

    if (!user) {
      return { ok: false, message: 'Проверьте почту, пароль и выбранную роль.' };
    }

    setSession({ userId: user.id, role: user.role });
    return { ok: true };
  };

  const registerPayer = ({ name, email, password, accountNumber, phone }) => {
    if (!email || !password || !accountNumber) {
      return { ok: false, message: 'Заполните почту, пароль и лицевой счет.' };
    }

    if (store.users.some((item) => item.email === email.trim())) {
      return { ok: false, message: 'Пользователь с такой почтой уже есть.' };
    }

    const account =
      store.accounts.find((item) => item.number === accountNumber.trim()) ?? {
        id: `acc-${Date.now()}`,
        number: accountNumber.trim(),
        ownerName: name.trim() || 'Новый плательщик',
        address: 'Адрес будет уточнен',
      };

    const user = {
      id: `payer-${Date.now()}`,
      role: 'payer',
      name: name.trim() || 'Новый плательщик',
      email: email.trim(),
      password,
      phone,
      accountId: account.id,
    };

    setStore((current) => ({
      ...current,
      accounts: current.accounts.some((item) => item.id === account.id)
        ? current.accounts
        : [...current.accounts, account],
      users: [...current.users, user],
    }));
    setSession({ userId: user.id, role: user.role });

    return { ok: true };
  };

  const approvePartnerApplication = (application) => {
    const orgId = application.id ?? `org-${Date.now()}`;
    const adminId = `company-admin-${Date.now()}`;
    const organization = buildCompanyFromApplication(application, orgId);
    const adminUser = {
      id: adminId,
      role: 'companyAdmin',
      orgId,
      name: application.ownerName || 'Администратор компании',
      email: application.ownerEmail || 'owner@company.ru',
      password: 'demo',
      phone: application.ownerPhone || '',
    };

    setStore((current) => ({
      ...current,
      organizations: [
        ...(current.organizations ?? []).filter((item) => item.id !== orgId),
        organization,
      ],
      users: [
        ...current.users.filter((item) => item.email !== adminUser.email || item.role !== 'companyAdmin'),
        adminUser,
      ],
    }));
    setSession({ userId: adminId, role: 'companyAdmin' });
    return { ok: true, orgId };
  };

  const logout = () => setSession(null);

  const updateProfile = (patch) => {
    if (!currentUser) {
      return;
    }

    setStore((current) => ({
      ...current,
      users: current.users.map((item) =>
        item.id === currentUser.id ? { ...item, ...patch } : item,
      ),
    }));
  };

  const updateCompanyEmployeeRole = (orgId, employeeId, role) => {
    setStore((current) => ({
      ...current,
      organizations: getOrganizations(current).map((organization) =>
        organization.id === orgId
          ? {
              ...organization,
              employees: organization.employees.map((employee) =>
                employee.id === employeeId ? { ...employee, role } : employee,
              ),
            }
          : organization,
      ),
    }));
  };

  const addCompanyEmployee = (orgId, employee) => {
    const email = employee.email.trim();
    if (!email) {
      return;
    }

    setStore((current) => ({
      ...current,
      organizations: getOrganizations(current).map((organization) =>
        organization.id === orgId
          ? {
              ...organization,
              employees: [
                ...organization.employees,
                {
                  id: `staff-${Date.now()}`,
                  name: email.split('@')[0],
                  email,
                  phone: '',
                  role: employee.role,
                  status: 'Ожидает приглашение',
                },
              ],
            }
          : organization,
      ),
    }));
  };

  const removeCompanyEmployee = (orgId, employeeId) => {
    setStore((current) => ({
      ...current,
      organizations: getOrganizations(current).map((organization) =>
        organization.id === orgId
          ? {
              ...organization,
              employees: organization.employees.filter((employee) => employee.id !== employeeId),
            }
          : organization,
      ),
    }));
  };

  const payReceipt = (receiptId, method) => {
    const receipt = store.receipts.find((item) => item.id === receiptId);
    if (!receipt) {
      return;
    }

    const payment = {
      id: `pay-${Date.now()}`,
      receiptId,
      method,
      paidAt: today(),
      amount: receipt.amount,
    };

    setStore((current) => ({
      ...current,
      receipts: current.receipts.map((item) =>
        item.id === receiptId
          ? { ...item, status: 'paid', paidAt: payment.paidAt, method }
          : item,
      ),
      payments: [...current.payments, payment],
    }));
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage store={store} user={currentUser} onLogout={logout} />} />
      <Route path="/about" element={<InfoPage user={currentUser} onLogout={logout} />} />
      <Route path="/privacy" element={<PrivacyPage user={currentUser} onLogout={logout} />} />
      <Route
        path="/partner"
        element={
          <PartnerPage
            user={currentUser}
            onLogout={logout}
            approvePartnerApplication={approvePartnerApplication}
          />
        }
      />
      <Route
        path="/auth"
        element={
          <AuthPage
            user={currentUser}
            login={login}
            registerPayer={registerPayer}
            onLogout={logout}
          />
        }
      />
      <Route
        path="/app"
        element={
          <RequireRole user={currentUser} role="payer">
            <PayerLayout
              user={currentUser}
              store={store}
              logout={logout}
              updateProfile={updateProfile}
              payReceipt={payReceipt}
              theme={theme}
              setTheme={setTheme}
            />
          </RequireRole>
        }
      >
        <Route index element={<PayerDashboard />} />
        <Route path="receipts" element={<ReceiptsPage />} />
        <Route path="receipts/:receiptId" element={<ReceiptDetailPage />} />
        <Route path="pay" element={<PaymentPage />} />
        <Route path="pay/:receiptId" element={<PaymentPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage scope="кабинета плательщика" />} />
      </Route>
      <Route
        path="/employee"
        element={
          <RequireRole user={currentUser} role="employee">
            <EmployeeLayout
              user={currentUser}
              store={store}
              logout={logout}
              updateProfile={updateProfile}
              theme={theme}
              setTheme={setTheme}
            />
          </RequireRole>
        }
      >
        <Route index element={<EmployeeDashboard />} />
        <Route path="settings" element={<SettingsPage scope="служебного кабинета" />} />
      </Route>
      <Route
        path="/company-admin"
        element={
          <RequireRole user={currentUser} role="companyAdmin">
            <CompanyAdminLayout
              user={currentUser}
              store={store}
              logout={logout}
              updateProfile={updateProfile}
              theme={theme}
              setTheme={setTheme}
              updateCompanyEmployeeRole={updateCompanyEmployeeRole}
              addCompanyEmployee={addCompanyEmployee}
              removeCompanyEmployee={removeCompanyEmployee}
            />
          </RequireRole>
        }
      >
        <Route index element={<CompanyAdminDashboard />} />
        <Route path="company" element={<CompanyRegistryPage />} />
        <Route path="employees" element={<CompanyEmployeesPage />} />
        <Route path="objects" element={<CompanyObjectsPage />} />
        <Route path="statistics" element={<CompanyStatisticsPage />} />
        <Route path="settings" element={<SettingsPage scope="кабинета администратора компании" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
