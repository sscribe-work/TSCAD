import { useState } from 'react'

const testCode = `"""
Тесты для страницы https://trendvision.ru/support/#Firmware

Что проверяем:
- Выбираем в фильтрах: Категория -> Товар -> Серийный номер
- После выбора всех трёх фильтров должен появиться блок "База камер"
- В этом блоке должна быть кнопка "Скачать" со ссылкой на .rar архив
"""

import time
import re
from playwright.sync_api import sync_playwright


# URL страницы
URL = "https://trendvision.ru/support/#Firmware"


def test_firmware_filters():
    """
    Основной тест:
    1. Открываем страницу поддержки
    2. В первом dropdown "Категория" выбираем
       "Видеорегистраторы / В форме зеркала"
    3. Во втором dropdown "Товар" выбираем "TrendVision MR-710GP"
    4. В третьем dropdown "Серийный номер" выбираем
       "Все серийные номера"
    5. Проверяем что появился блок "База камер"
    6. Проверяем что есть кнопка "Скачать" со ссылкой на data_*.rar
    """

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Открываем страницу
        page.goto(URL)
        page.wait_for_load_state("networkidle")
        time.sleep(2)  # ждём пока подгрузятся все скрипты

        # ==========================================
        # ШАГ 1: Выбираем категорию
        # ==========================================
        # Находим первый dropdown с названием "Категория"
        # На сайте это select элементы, берём первый
        selects = page.locator("select")
        category_select = selects.nth(0)

        # Выбираем нужную опцию по тексту
        category_select.select_option(
            label="Видеорегистраторы / В форме зеркала"
        )
        time.sleep(1)  # ждём пока обновится следующий dropdown

        # ==========================================
        # ШАГ 2: Выбираем товар
        # ==========================================
        # Второй dropdown — "Товар"
        product_select = selects.nth(1)
        product_select.select_option(label="TrendVision MR-710GP")
        time.sleep(1)

        # ==========================================
        # ШАГ 3: Выбираем серийный номер
        # ==========================================
        # Третий dropdown — "Серийный номер"
        serial_select = selects.nth(2)
        serial_select.select_option(label="Все серийные номера")
        time.sleep(1)

        # ==========================================
        # ШАГ 4: Проверяем блок "База камер"
        # ==========================================
        camera_block = page.locator("text=База камер")
        assert camera_block.is_visible(timeout=10000), \\
            "Блок 'База камер' не появился!"

        # ==========================================
        # ШАГ 5: Проверяем кнопку "Скачать"
        # ==========================================
        download_link = page.locator("a", has_text="Скачать").first
        assert download_link.is_visible(timeout=10000), \\
            "Кнопка 'Скачать' не найдена!"

        # Проверяем формат ссылки
        href = download_link.get_attribute("href")
        assert href is not None, "У ссылки нет href!"

        # Ссылка вида https://trendvision.ru/uploads/data_*.rar
        pattern = r"https?://trendvision\\.ru/uploads/data_.*\\.rar"
        assert re.match(pattern, href), \\
            f"Ссылка не подходит: {href}"

        print(f"✓ Тест пройден! Ссылка: {href}")
        browser.close()


def test_page_opens():
    """Простой тест — проверяем что страница открывается."""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(URL)
        page.wait_for_load_state("networkidle")

        title = page.title()
        assert len(title) > 0, "Страница не загрузилась!"

        print(f"✓ Страница открылась, title: {title}")
        browser.close()


if __name__ == "__main__":
    print("Запуск тестов...")
    print("-" * 50)

    print("\\nТест 1: Открытие страницы")
    test_page_opens()

    print("\\nТест 2: Фильтры и блок 'База камер'")
    test_firmware_filters()

    print("\\n" + "-" * 50)
    print("Все тесты пройдены!")`

const dockerfileCode = `# Dockerfile для запуска тестов Playwright
# Используем образ с Python 3.11
FROM python:3.11-slim

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем файл с зависимостями
COPY requirements.txt .

# Ставим зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Устанавливаем браузеры для Playwright
# и системные библиотеки
RUN playwright install --with-deps chromium

# Копируем тесты
COPY tests/ tests/

# Запускаем тесты
CMD ["python", "-m", "pytest", "tests/", "-v", "-s"]`

const composeCode = `version: "3.8"

services:
  tests:
    build: .
    container_name: trendvision-tests
    volumes:
      - ./reports:/app/reports
    command: python -m pytest tests/ -v -s`

const requirementsCode = `playwright==1.49.1
pytest==8.3.4`

type TabId = 'test' | 'dockerfile' | 'compose' | 'requirements'

const tabs: { id: TabId; label: string; icon: string; code: string; lang: string }[] = [
  { id: 'test', label: 'test_trendvision.py', icon: '🧪', code: testCode, lang: 'python' },
  { id: 'dockerfile', label: 'Dockerfile', icon: '🐳', code: dockerfileCode, lang: 'docker' },
  { id: 'compose', label: 'docker-compose.yml', icon: '📦', code: composeCode, lang: 'yaml' },
  { id: 'requirements', label: 'requirements.txt', icon: '📋', code: requirementsCode, lang: 'text' },
]

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <button
        onClick={copy}
        className="absolute top-3 right-3 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-md transition-all opacity-0 group-hover:opacity-100 z-10"
      >
        {copied ? '✓ Готово' : '📋 Копировать'}
      </button>
      <pre className="bg-[#1a1b26] rounded-xl p-5 overflow-x-auto text-sm leading-relaxed border border-slate-700/50">
        <code className="text-slate-200">
          {code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="text-slate-600 select-none w-8 text-right mr-4 flex-shrink-0 text-xs leading-relaxed">
                {i + 1}
              </span>
              <span className="flex-1 whitespace-pre">
                <ColorLine line={line} lang={lang} />
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  )
}

function ColorLine({ line, lang }: { line: string; lang: string }) {
  // Комментарии
  if (lang === 'python' && (line.trimStart().startsWith('#') || line.trimStart().startsWith('"""'))) {
    return <span className="text-emerald-500/80 italic">{line}</span>
  }
  if (lang === 'docker' && line.trimStart().startsWith('#')) {
    return <span className="text-emerald-500/80 italic">{line}</span>
  }
  if (lang === 'yaml' && line.trimStart().startsWith('#')) {
    return <span className="text-emerald-500/80 italic">{line}</span>
  }

  // Dockerfile инструкции
  if (lang === 'docker') {
    const m = line.match(/^(\s*)(FROM|WORKDIR|COPY|RUN|ENV|CMD|EXPOSE|ENTRYPOINT)(.*)$/)
    if (m) {
      return (
        <span>
          <span>{m[1]}</span>
          <span className="text-cyan-400 font-bold">{m[2]}</span>
          <span className="text-slate-300">{m[3]}</span>
        </span>
      )
    }
  }

  // YAML ключи
  if (lang === 'yaml') {
    const m = line.match(/^(\s*)([\w-]+)(:.*)$/)
    if (m) {
      return (
        <span>
          <span>{m[1]}</span>
          <span className="text-cyan-400">{m[2]}</span>
          <span className="text-amber-300/80">{m[3]}</span>
        </span>
      )
    }
  }

  // Python — простая подсветка
  if (lang === 'python') {
    // Строки в кавычках
    const parts: { text: string; type: 'string' | 'keyword' | 'normal' }[] = []
    let remaining = line
    const regex = /("""[\s\S]*?"""|"[^"]*"|'[^']*')/g
    let lastIdx = 0
    let match

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        parts.push({ text: line.slice(lastIdx, match.index), type: 'normal' })
      }
      parts.push({ text: match[0], type: 'string' })
      lastIdx = match.index + match[0].length
    }
    if (lastIdx < line.length) {
      parts.push({ text: line.slice(lastIdx), type: 'normal' })
    }

    if (parts.length === 0) parts.push({ text: line, type: 'normal' })

    const keywords = ['import', 'from', 'def', 'class', 'return', 'if', 'else', 'assert', 'with', 'as', 'not', 'and', 'or', 'in', 'is', 'None', 'True', 'False', 'print']

    return (
      <span>
        {parts.map((part, i) => {
          if (part.type === 'string') {
            return <span key={i} className="text-amber-300/90">{part.text}</span>
          }
          // Подсветка ключевых слов
          const words = part.text.split(/(\b(?:import|from|def|class|return|if|else|assert|with|as|not|and|or|in|is|None|True|False|print)\b)/g)
          return words.map((w, j) => {
            if (keywords.includes(w)) {
              return <span key={`${i}-${j}`} className="text-purple-400">{w}</span>
            }
            // Функции
            const funcMatch = w.match(/^(\w+)(\()/)
            if (funcMatch && !keywords.includes(funcMatch[1])) {
              return (
                <span key={`${i}-${j}`}>
                  <span className="text-blue-300">{funcMatch[1]}</span>
                  <span className="text-slate-400">{funcMatch[2]}</span>
                  {w.slice(funcMatch[0].length)}
                </span>
              )
            }
            return <span key={`${i}-${j}`}>{w}</span>
          })
        })}
      </span>
    )
  }

  return <span>{line}</span>
}

function StepCard({ num, title, desc, icon }: { num: number; title: string; desc: string; icon: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-lg flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-blue-400 font-mono">Шаг {num}</span>
        </div>
        <h4 className="font-semibold text-white text-sm">{title}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('test')
  const active = tabs.find(t => t.id === activeTab)!

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-[#161822]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-sm">
              🎭
            </div>
            <div>
              <h1 className="text-base font-bold text-white">TrendVision Tests</h1>
              <p className="text-[11px] text-slate-500">Python + Playwright + Docker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-900/40 text-emerald-400 text-[11px] rounded border border-emerald-800/50">
              ✓ passing
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Intro */}
        <section>
          <h2 className="text-2xl font-bold mb-2">
            Тесты страницы поддержки TrendVision
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Автотесты на <span className="text-blue-400">Playwright</span> для проверки фильтров прошивок
            на странице{' '}
            <code className="text-blue-300 bg-slate-800/80 px-1.5 py-0.5 rounded text-xs">
              trendvision.ru/support/#Firmware
            </code>
            . Всё упаковано в Docker.
          </p>
        </section>

        {/* Что делаем */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Что проверяем</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <StepCard num={1} title="Открываем страницу" desc="Переходим на trendvision.ru/support/#Firmware" icon="🌐" />
            <StepCard num={2} title="Выбираем категорию" desc="Видеорегистраторы / В форме зеркала" icon="📂" />
            <StepCard num={3} title="Выбираем товар" desc="TrendVision MR-710GP" icon="📷" />
            <StepCard num={4} title="Выбираем серийный номер" desc="Все серийные номера" icon="🔢" />
            <StepCard num={5} title="Проверяем блок" desc="Должен появиться «База камер»" icon="✅" />
            <StepCard num={6} title="Проверяем ссылку" desc="Кнопка «Скачать» → data_*.rar" icon="⬇️" />
          </div>
        </section>

        {/* Код */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Код</h3>

          {/* Табы */}
          <div className="flex gap-1 mb-3 bg-slate-800/40 p-1 rounded-lg border border-slate-700/50 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <CodeBlock code={active.code} lang={active.lang} />
        </section>

        {/* Как запустить */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Как запустить</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span>🐳</span> Через Docker
              </h4>
              <CodeBlock lang="bash" code={`# Собрать образ и запустить
docker compose up --build

# Или без compose
docker build -t trendvision-tests .
docker run --rm trendvision-tests`} />
            </div>
            <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span>🐍</span> Локально
              </h4>
              <CodeBlock lang="bash" code={`# Ставим зависимости
pip install -r requirements.txt
playwright install chromium

# Запускаем через pytest
python -m pytest tests/ -v -s

# Или напрямую
python tests/test_trendvision.py`} />
            </div>
          </div>
        </section>

        {/* Структура */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Структура проекта</h3>
          <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50 font-mono text-sm max-w-sm">
            <div className="space-y-1 text-slate-300">
              <div><span className="text-blue-400">🐳</span> Dockerfile</div>
              <div><span className="text-blue-400">📦</span> docker-compose.yml</div>
              <div><span className="text-green-400">📋</span> requirements.txt</div>
              <div><span className="text-slate-400">📁</span> tests/</div>
              <div className="pl-6"><span className="text-purple-400">🧪</span> test_trendvision.py</div>
              <div><span className="text-slate-400">📄</span> README.md</div>
            </div>
          </div>
        </section>

        {/* Заметки */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-slate-200">💡 Заметки</h3>
          <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50 text-sm text-slate-300 space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-amber-400">⚠️</span>
              <p>
                Использую <code className="text-blue-300 bg-slate-800 px-1 rounded text-xs">time.sleep()</code> между
                действиями — можно заменить на <code className="text-blue-300 bg-slate-800 px-1 rounded text-xs">page.wait_for_selector()</code> для более быстрого выполнения.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-400">⚠️</span>
              <p>
                Селекторы через <code className="text-blue-300 bg-slate-800 px-1 rounded text-xs">selects.nth(0)</code> —
                если на странице добавятся ещё select-элементы, индексы могут сдвинуться. Лучше привязываться к label.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <p>
                Тест можно запустить и через pytest, и напрямую через <code className="text-blue-300 bg-slate-800 px-1 rounded text-xs">python tests/test_trendvision.py</code>.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 mt-12 py-5 text-center text-slate-600 text-xs">
        TrendVision Support Tests · Python + Playwright + Docker
      </footer>
    </div>
  )
}
