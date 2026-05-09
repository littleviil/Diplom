# GSD + Codex: настройка для диплома

Эта папка подготовлена для работы через GSD:

```powershell
C:\Users\littleviil\Desktop\Diplom
```

GSD помогает вести проект по шагам: описание, требования, дорожная карта, план фазы, выполнение, проверка.

## Что уже сделано

- Инициализирован Git-репозиторий.
- Проверен Codex CLI: `0.130.0-alpha.5`.
- Проверен GSD SDK.
- В `~\.codex\skills` найдено 66 GSD skills.
- Создан `.planning/config.json`.
- Создан `AGENTS.md` с локальными инструкциями для Codex.
- Создан `.gitignore` для типичных временных файлов.

## Текущий режим GSD

Конфиг сделан экономным и удобным для учебного проекта:

- `runtime: "codex"` - GSD работает под Codex.
- `mode: "interactive"` - GSD спрашивает подтверждения.
- `granularity: "coarse"` - меньше лишней детализации.
- `model_profile: "budget"` - экономный профиль.
- `workflow.research: false` - не тратить лимиты на лишний research по умолчанию.
- `workflow.plan_check: false` - не запускать отдельного проверяющего плана.
- `workflow.verifier: true` - оставить финальную проверку результата.
- `workflow.use_worktrees: false` - проще на Windows.
- `parallelization.enabled: false` - не запускать много агентов одновременно.
- `workflow.text_mode: true` - вопросы GSD будут удобнее в Codex.

Файл настроек:

```powershell
.planning\config.json
```

## Как начать дипломный проект

Открой PowerShell:

```powershell
cd "C:\Users\littleviil\Desktop\Diplom"
codex
```

Внутри Codex запусти:

```text
$gsd-new-project
```

Когда GSD спросит, кратко опиши:

- тему диплома;
- что должно быть в готовом результате;
- какие технологии надо использовать;
- что точно не входит в работу;
- как запускать и проверять проект.

После этого GSD создаст основные файлы:

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`

## Дальше по этапам

После создания roadmap:

```text
$gsd-plan-phase 1
```

Потом, когда план устроит:

```text
$gsd-execute-phase 1
```

Проверка готовой работы:

```text
$gsd-verify-work
```

## Если нужно ещё экономнее

Можно временно выключить финального verifier:

```json
"verifier": false
```

Но лучше оставлять его включенным: он помогает ловить недоделки перед сдачей.
