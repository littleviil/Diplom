import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useOutletContext, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  ChevronDown,
  Database,
  Download,
  FileSpreadsheet,
  Gauge,
  House,
  LayoutDashboard,
  MessageSquare,
  Pencil,
  ReceiptText,
  Settings,
  Trash2,
  UserCog,
  Users,
} from 'lucide-react';
import { defaultCompanyProfile, employeeRoleOptions, registryCheckVariants } from '../config.js';
import {
  buildReceiptSummary,
  formatMoney,
  getLatestReceiptPeriodKey,
  getObjectTree,
  getOrganizations,
  getReceiptPeriodKey,
  getReportServices,
  getServiceName,
  getThreeMonthWindow,
  getLastYearPeriodOptions,
  makeMonthKey,
  normalizeEmployeeRole,
} from '../utils.js';
import { PageTitle, ServiceBadge, StatCard, WorkspaceTopbar } from '../components/shared.jsx';

export function CompanyAdminLayout({
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

export function CompanyAdminDashboard() {
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

export function CompanyRegistryPage() {
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

export function CompanyEmployeesPage() {
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

export function CompanyObjectsPage() {
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

export function ObjectSummaryStats({ paid, unpaid }) {
  return (
    <span className="object-payment-stats">
      <b>{paid}</b> оплачено
      <b>{unpaid}</b> не оплачено
    </span>
  );
}

export function CompanyStatisticsPage() {
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
