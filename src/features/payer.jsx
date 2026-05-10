import React, { useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  LayoutDashboard,
  Pencil,
  QrCode,
  ReceiptText,
  Settings,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { buildReceiptSummary, formatMoney, getServiceName } from '../utils.js';
import { PageTitle, ServiceBadge, StatCard, StatusBadge, WorkspaceTopbar } from '../components/shared.jsx';

export function PayerLayout({ user, store, logout, updateProfile, payReceipt, theme, setTheme }) {
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

export function PayerDashboard() {
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

export function ReceiptsPage() {
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

export function ReceiptDetailPage() {
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

export function PaymentPage() {
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

export function ProfilePage() {
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
