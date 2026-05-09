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
} from 'react-router-dom';
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  BarChart3,
  Building2,
  CheckCircle2,
  CreditCard,
  Droplets,
  FileText,
  Flame,
  Gauge,
  Home,
  Landmark,
  LayoutDashboard,
  LogIn,
  LogOut,
  Pencil,
  QrCode,
  ReceiptText,
  ShieldCheck,
  UserRound,
  WalletCards,
  Zap,
} from 'lucide-react';
import { getFreshStore, serviceMeta } from './data.js';

const STORE_KEY = 'zhku-demo-store';
const SESSION_KEY = 'zhku-demo-session';
const PARTNER_APPLICATIONS_KEY = 'zhku-partner-applications';

const serviceIcons = {
  water: Droplets,
  gas: Flame,
  electricity: Zap,
  heating: Home,
  maintenance: Building2,
};

const formatMoney = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);

const today = () => new Date().toISOString().slice(0, 10);

function loadStore() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    return saved ? JSON.parse(saved) : getFreshStore();
  } catch {
    return getFreshStore();
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
    <footer className="site-footer">
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

        <ProjectFooter />
      </main>
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

function PartnerPage({ user, onLogout }) {
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
      verificationStatus: 'На модерации',
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
  const initialRole = params.get('role') === 'employee' ? 'employee' : 'payer';
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
      ? role === 'employee'
        ? ['company', 'name', 'loginName', 'phone', 'email', 'password']
        : ['name', 'loginName', 'phone', 'email', 'accountNumber', 'password']
      : role === 'employee'
        ? ['company', 'loginName', 'email', 'password']
        : ['accountNumber', 'loginName', 'email', 'password'];
    const missingFields = requiredFields.filter((field) => !String(form[field] ?? '').trim());

    if (missingFields.length > 0) {
      setInvalidFields(missingFields);
      setError('Заполните обязательные поля.');
      return;
    }

    if (mode === 'register') {
      if (role === 'employee') {
        setError('Регистрация сотрудника будет доступна после приглашения администратора компании.');
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
    navigate(role === 'employee' ? '/employee' : '/app');
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

  const fieldClass = (field) => (invalidFields.includes(field) ? 'field-error' : undefined);

  return (
    <div className="page">
      <Header user={user} onLogout={onLogout} />

      <main className="auth-page">
        <section className="auth-card auth-card-large">
          <span className="section-kicker">Вход в систему</span>
          <h1>{role === 'employee' ? 'Вход сотрудника ЖКУ' : 'Вход гражданина плательщика'}</h1>
          <p>
            {role === 'employee'
              ? 'Выберите компанию и войдите по логину, почте и паролю.'
              : 'Войдите по лицевому счету, логину, почте и паролю.'}
          </p>
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
                    placeholder={role === 'employee' ? 'employee@demo.ru' : 'payer@demo.ru'}
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

            {role === 'employee' && (
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
                  placeholder={role === 'employee' ? 'employee@demo.ru' : 'payer@demo.ru'}
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
              {mode === 'register' ? 'Создать кабинет' : role === 'employee' ? 'Войти как сотрудник' : 'Войти'}
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
              </>
            ) : (
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
              </>
            )}
          </div>
        </section>
      </main>
      <MinimalFooter />
    </div>
  );
}

function RequireRole({ user, role, children }) {
  if (!user || user.role !== role) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function PayerLayout({ user, store, logout, updateProfile, payReceipt }) {
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
        </nav>

        <button className="logout-button" type="button" onClick={logout}>
          <LogOut size={18} />
          Выйти
        </button>
      </aside>

      <main className="workspace">
        <Outlet context={{ user, account, receipts, summary, updateProfile, payReceipt }} />
        <ProjectFooter />
      </main>
    </div>
  );
}

function PageTitle({ eyebrow, title, children }) {
  return (
    <div className="page-title">
      <span className="section-kicker">{eyebrow}</span>
      <div>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
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

function EmployeePage({ user, store, logout }) {
  const summary = buildReceiptSummary(store.receipts);
  const byService = Object.entries(serviceMeta).map(([code, meta]) => {
    const serviceReceipts = store.receipts.filter((item) => item.service === code);
    return {
      code,
      name: meta.name,
      unpaid: serviceReceipts.filter((item) => item.status === 'unpaid').length,
      amount: serviceReceipts.reduce((sum, item) => sum + item.amount, 0),
    };
  });

  return (
    <div className="page">
      <Header user={user} onLogout={logout} />
      <main className="employee-page">
        <PageTitle eyebrow="Сотрудник ЖКУ" title="Служебное главное меню">
          Базовая статистика по фактическим статусам квитанций.
        </PageTitle>

        <section className="stats-grid">
          <StatCard icon={CheckCircle2} label="Оплачено" value={formatMoney(summary.paidAmount)} tone="success" />
          <StatCard icon={AlertCircle} label="Не оплачено" value={formatMoney(summary.unpaidAmount)} tone="danger" />
          <StatCard icon={ReceiptText} label="Всего квитанций" value={store.receipts.length} />
        </section>

        <section className="employee-grid">
          <div className="work-panel">
            <h2>Сводка</h2>
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
            <h2>Услуги</h2>
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
        <ProjectFooter />
      </main>
    </div>
  );
}

export default function App() {
  const [store, setStore] = useState(loadStore);
  const [session, setSession] = useState(loadSession);

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
      <Route path="/partner" element={<PartnerPage user={currentUser} onLogout={logout} />} />
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
      </Route>
      <Route
        path="/employee"
        element={
          <RequireRole user={currentUser} role="employee">
            <EmployeePage user={currentUser} store={store} logout={logout} />
          </RequireRole>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
