import React from 'react';
import { Link, NavLink, Outlet, useOutletContext } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  LayoutDashboard,
  MessageSquare,
  ReceiptText,
  Settings,
} from 'lucide-react';
import {
  buildReceiptSummary,
  formatMoney,
  getLastYearPeriodOptions,
  getReceiptPeriodKey,
  getReportServices,
} from '../utils.js';
import { PageTitle, ServiceBadge, StatCard, WorkspaceTopbar } from '../components/shared.jsx';

export function EmployeeLayout({ user, store, logout, updateProfile, theme, setTheme }) {
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

export function EmployeeDashboard() {
  const { user, store, summary } = useOutletContext();
  const employeeRole = user.employeeRole ?? (user.email.includes('accountant') ? 'Бухгалтер' : 'Диспетчер');

  if (employeeRole === 'Бухгалтер') {
    return <AccountantDashboard user={user} store={store} summary={summary} />;
  }

  return <DispatcherDashboard user={user} store={store} summary={summary} />;
}

export function DispatcherDashboard({ user, store, summary }) {
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

export function AccountantDashboard({ user, store, summary }) {
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
