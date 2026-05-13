import React, { useState } from 'react';
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

const dispatcherStatusOptions = ['Новое', 'В работе', 'Выполнено'];

const dispatcherTypeOptions = [
  'Ошибка в квитанции',
  'Детализация счета',
  'Не отображается оплата',
  'Передача показаний',
  'Перерасчет начислений',
  'Вопрос по сроку оплаты',
  'Качество услуги',
  'Другой вопрос',
];

const initialDispatcherTickets = [
  {
    id: 'ticket-1',
    topic: 'Не отображается оплата за водоснабжение',
    type: 'Не отображается оплата',
    service: 'water',
    period: 'Май 2026',
    amount: 4523.67,
    dueDate: '10.06.2026',
    account: '407900000001',
    resident: 'Ирина Волкова',
    status: 'Новое',
    priority: 'Высокий',
    message: 'Оплата прошла через СБП вчера вечером, но в кабинете квитанция до сих пор отмечена как неоплаченная.',
    answer: '',
    answered: false,
  },
  {
    id: 'ticket-2',
    topic: 'Нужна детализация начисления по электроснабжению',
    type: 'Детализация счета',
    service: 'electricity',
    period: 'Май 2026',
    amount: 1367.4,
    dueDate: '10.06.2026',
    account: '407900000002',
    resident: 'Демо-абонент',
    status: 'В работе',
    priority: 'Средний',
    message: 'Пользователь просит объяснить разницу между дневным и ночным тарифом за последний период.',
    answer: 'Проверяем начисления по прибору учета и тарифным зонам.',
    answered: true,
  },
  {
    id: 'ticket-3',
    topic: 'Ошибка в периоде квитанции',
    type: 'Ошибка в квитанции',
    service: 'water',
    period: 'Апрель 2026',
    amount: 1580,
    dueDate: '10.05.2026',
    account: '407900000001',
    resident: 'Ирина Волкова',
    status: 'Выполнено',
    priority: 'Обычный',
    message: 'В истории платежей отображался март вместо апреля.',
    answer: 'Период исправлен, квитанция отображается корректно.',
    answered: true,
  },
  {
    id: 'ticket-4',
    topic: 'Не принимаются показания счетчика газоснабжения',
    type: 'Передача показаний',
    service: 'gas',
    period: 'Май 2026',
    amount: 1190.64,
    dueDate: '10.06.2026',
    account: '407900000001',
    resident: 'Ирина Волкова',
    status: 'Новое',
    priority: 'Средний',
    message: 'Показания выше предыдущих, но форма пишет, что данные некорректны.',
    answer: '',
    answered: false,
  },
  {
    id: 'ticket-5',
    topic: 'Запрос перерасчета начислений за водоснабжение',
    type: 'Перерасчет начислений',
    service: 'water',
    period: 'Май 2026',
    amount: 4523.67,
    dueDate: '10.06.2026',
    account: '407900000001',
    resident: 'Ирина Волкова',
    status: 'В работе',
    priority: 'Высокий',
    message: 'Пользователь считает, что расход горячей воды рассчитан по неверному объему.',
    answer: 'Запрошены контрольные показания и история начислений за предыдущий месяц.',
    answered: true,
  },
  {
    id: 'ticket-6',
    topic: 'Уточнение срока оплаты квитанции',
    type: 'Вопрос по сроку оплаты',
    service: 'electricity',
    period: 'Май 2026',
    amount: 1367.4,
    dueDate: '10.06.2026',
    account: '407900000002',
    resident: 'Демо-абонент',
    status: 'Новое',
    priority: 'Обычный',
    message: 'Нужно уточнить, до какого числа можно оплатить без начисления пени.',
    answer: '',
    answered: false,
  },
  {
    id: 'ticket-7',
    topic: 'Жалоба на качество водоснабжения',
    type: 'Качество услуги',
    service: 'water',
    period: 'Май 2026',
    amount: 4523.67,
    dueDate: '10.06.2026',
    account: '407900000001',
    resident: 'Ирина Волкова',
    status: 'В работе',
    priority: 'Высокий',
    message: 'Пользователь сообщает о слабом напоре и просит проверить начисления за период.',
    answer: 'Заявка передана в техническую службу, начисления будут сверены после проверки.',
    answered: true,
  },
  {
    id: 'ticket-8',
    topic: 'Нужна справка по истории оплат',
    type: 'Другой вопрос',
    service: 'gas',
    period: 'Апрель 2026',
    amount: 980,
    dueDate: '10.05.2026',
    account: '407900000001',
    resident: 'Ирина Волкова',
    status: 'Выполнено',
    priority: 'Обычный',
    message: 'Пользователь просит подсказать, где увидеть оплаты за последние месяцы.',
    answer: 'Историю оплат можно открыть в кабинете плательщика через кнопку "Посмотреть историю платежей".',
    answered: true,
  },
];

const getTicketStatusTone = (status) => {
  if (status === 'Новое') {
    return 'warning';
  }

  if (status === 'Выполнено') {
    return 'success';
  }

  return '';
};

export function EmployeeLayout({ user, store, logout, updateProfile, theme, setTheme }) {
  const summary = buildReceiptSummary(store.receipts);
  const showRequests = user.employeeRole !== 'Бухгалтер';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand-link side-brand">
          <span className="brand-mark">
            <Building2 size={22} />
          </span>
          <span>
            <strong>ЖКУ Контроль</strong>
            <small>{user.employeeRole ?? 'Диспетчер'}</small>
          </span>
        </Link>

        <nav className="side-nav">
          <NavLink end to="/employee">
            <LayoutDashboard size={18} />
            Главное
          </NavLink>
          {showRequests && (
            <NavLink to="/employee/requests">
              <MessageSquare size={18} />
              Заявки
            </NavLink>
          )}
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
  const tickets = initialDispatcherTickets;
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
        <StatCard icon={MessageSquare} label="Новых заявок" value={tickets.filter((item) => item.status === 'Новое').length} />
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
                <span className={`status-chip ${getTicketStatusTone(ticket.status)}`}>
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

export function EmployeeRequestsPage() {
  const { user } = useOutletContext();
  const [tickets, setTickets] = useState(initialDispatcherTickets);
  const [typeFilter, setTypeFilter] = useState('Все типы');
  const [statusFilter, setStatusFilter] = useState('Все статусы');
  const [selectedTicketId, setSelectedTicketId] = useState(initialDispatcherTickets[0]?.id ?? null);
  const employeeRole = user.employeeRole ?? (user.email.includes('accountant') ? 'Бухгалтер' : 'Диспетчер');
  const filteredTickets = tickets.filter((ticket) => {
    const matchesType = typeFilter === 'Все типы' || ticket.type === typeFilter;
    const matchesStatus = statusFilter === 'Все статусы' || ticket.status === statusFilter;

    return matchesType && matchesStatus;
  });
  const selectedTicket =
    filteredTickets.find((ticket) => ticket.id === selectedTicketId) ??
    filteredTickets[0] ??
    null;

  const updateTicketStatus = (ticketId, status) => {
    setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket)));
  };
  const updateTicketAnswer = (ticketId, answer) => {
    setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? { ...ticket, answer, answered: false } : ticket)));
  };
  const saveTicketAnswer = (ticketId) => {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, answered: ticket.answer.trim().length > 0 } : ticket,
      ),
    );
  };

  if (employeeRole === 'Бухгалтер') {
    return (
      <PageTitle title="Заявки пользователей">
        Этот раздел доступен диспетчеру. Для бухгалтера заявки скрыты.
      </PageTitle>
    );
  }

  return (
    <>
      <PageTitle title="Заявки пользователей">
        Ответы пользователям и смена статуса заявки: Новое, В работе или Выполнено.
      </PageTitle>

      <section className="stats-grid">
        <StatCard icon={MessageSquare} label="Новое" value={tickets.filter((item) => item.status === 'Новое').length} />
        <StatCard icon={AlertCircle} label="В работе" value={tickets.filter((item) => item.status === 'В работе').length} />
        <StatCard icon={CheckCircle2} label="Выполнено" value={tickets.filter((item) => item.status === 'Выполнено').length} tone="success" />
      </section>

      <section className="request-workspace">
        <div className="work-panel request-list-panel">
          <div className="request-list-headline">
            <h2>Общий список заявок</h2>
            <span>{filteredTickets.length} из {tickets.length}</span>
          </div>
          <div className="request-filters">
            <label>
              Тип заявки
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option>Все типы</option>
                {dispatcherTypeOptions.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Статус
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>Все статусы</option>
                {dispatcherStatusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="request-list">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <button
                  className={`request-list-item ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                >
                  <span className="request-list-item-head">
                    <strong>{ticket.topic}</strong>
                    <span className={`status-chip ${getTicketStatusTone(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </span>
                  <span>{ticket.type}</span>
                  <small>{ticket.resident} · {ticket.period} · лицевой счет {ticket.account}</small>
                </button>
              ))
            ) : (
              <div className="empty-state">По выбранным фильтрам заявок нет.</div>
            )}
          </div>
        </div>

        <aside className="work-panel request-detail-panel">
          {selectedTicket ? (
            <>
              <div className="request-detail-head">
                <span className="section-kicker">{selectedTicket.type}</span>
                <h2>{selectedTicket.topic}</h2>
                <span className={`status-chip ${getTicketStatusTone(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
              </div>

              <div className="request-detail-meta">
                <div>
                  <span>Плательщик</span>
                  <strong>{selectedTicket.resident}</strong>
                </div>
                <div>
                  <span>Лицевой счет</span>
                  <strong>{selectedTicket.account}</strong>
                </div>
                <div>
                  <span>Услуга</span>
                  <ServiceBadge service={selectedTicket.service} />
                </div>
                <div>
                  <span>Период</span>
                  <strong>{selectedTicket.period}</strong>
                </div>
                <div>
                  <span>Сумма квитанции</span>
                  <strong>{formatMoney(selectedTicket.amount)}</strong>
                </div>
                <div>
                  <span>Срок оплаты</span>
                  <strong>{selectedTicket.dueDate}</strong>
                </div>
              </div>

              <div className="request-message-box">
                <span>Сообщение пользователя</span>
                <p>{selectedTicket.message}</p>
              </div>

              <label>
                Ответ диспетчера
                <textarea
                  value={selectedTicket.answer}
                  onChange={(event) => updateTicketAnswer(selectedTicket.id, event.target.value)}
                  placeholder="Напишите ответ пользователю"
                />
              </label>

              <div className="ticket-controls request-detail-actions">
                <label>
                  Статус заявки
                  <select value={selectedTicket.status} onChange={(event) => updateTicketStatus(selectedTicket.id, event.target.value)}>
                    {dispatcherStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="primary-link" type="button" onClick={() => saveTicketAnswer(selectedTicket.id)}>
                  Ответить
                </button>
              </div>

              {selectedTicket.answered && <div className="inline-success">Ответ сохранен для пользователя.</div>}
            </>
          ) : (
            <div className="empty-state">Выберите заявку из списка слева.</div>
          )}
        </aside>
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
