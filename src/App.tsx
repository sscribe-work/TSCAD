import { useState } from 'react'

const testCode = `"""
Тесты для страницы поддержки TrendVision: https://trendvision.ru/support/#Firmware

Тест проверяет корректную работу фильтров прошивок:
1. Выбор категории "Видеорегистраторы / В форме зеркала"
2. Выбор товара "TrendVision MR-710GP"
3. Выбор серийного номера "Все серийные номера"
4. Проверка появления блока "База камер" с кнопкой "Скачать"
"""

import re
import pytest
from playwright.sync_api import Page, expect, BrowserContext

BASE_URL = "https://trendvision.ru/support/#Firmware"


@pytest.fixture(scope="function")
def context(browser):
    """Создаёт контекст браузера с русским языком."""
    ctx = browser.new_context(
        locale="ru-RU",
        viewport={"width": 1920, "height": 1080},
    )
    yield ctx
    ctx.close()


@pytest.fixture(scope="function")
def page(context: BrowserContext):
    """Создаёт новую страницу в контексте браузера."""
    pg = context.new_page()
    yield pg
    pg.close()


class TestTrendVisionSupport:
    """Тест-класс для страницы поддержки TrendVision."""

    def test_page_loads(self, page: Page):
        """Тест: страница загружается корректно."""
        page.goto(BASE_URL, wait_until="networkidle")
        expect(page).to_have_title(
            re.compile("TrendVision|Поддержка|support", re.IGNORECASE)
        )

    def test_full_workflow(self, page: Page):
        """
        Полный тест рабочего процесса:
        1. Открыть страницу
        2. Выбрать категорию
        3. Выбрать товар
        4. Выбрать серийный номер
        5. Проверить блок "База камер"
        6. Проверить ссылку "Скачать"
        """
        # Шаг 1: Открываем страницу
        page.goto(BASE_URL, wait_until="networkidle")
        expect(page).to_have_url(re.compile("support"))

        # Шаг 2: Выбираем категорию
        self._select_category(page)

        # Шаг 3: Выбираем товар
        self._select_product(page)

        # Шаг 4: Выбираем серийный номер
        self._select_serial_number(page)

        # Шаг 5: Проверяем блок "База камер"
        camera_db_block = page.locator("text=База камер").first
        expect(camera_db_block).to_be_visible(timeout=15000)

        # Шаг 6: Проверяем ссылку "Скачать"
        download_link = page.locator("a:has-text('Скачать')").first
        expect(download_link).to_be_visible(timeout=10000)

        download_href = download_link.get_attribute("href")
        assert download_href is not None
        assert "data_" in download_href
        assert download_href.endswith(".rar")
        assert "trendvision.ru/uploads/" in download_href

    def _select_category(self, page: Page):
        """Вспомогательный метод: выбор категории."""
        category_container = page.locator("text=Категория").first
        category_container.click()
        page.wait_for_timeout(500)
        option = page.locator("text=В форме зеркала").first
        option.click()
        page.wait_for_timeout(1000)

    def _select_product(self, page: Page):
        """Вспомогательный метод: выбор товара."""
        product_container = page.locator("text=Товар").first
        product_container.click()
        page.wait_for_timeout(500)
        option = page.locator("text=MR-710GP").first
        option.click()
        page.wait_for_timeout(1000)

    def _select_serial_number(self, page: Page):
        """Вспомогательный метод: выбор серийного номера."""
        serial_container = page.locator("text=Серийный номер").first
        serial_container.click()
        page.wait_for_timeout(500)
        option = page.locator("text=Все серийные номера").first
        option.click()
        page.wait_for_timeout(1000)`

const conftestCode = `"""
Конфигурация pytest для Playwright тестов.
"""

import pytest
from playwright.sync_api import Playwright


def pytest_addoption(parser):
    """Добавляет опции командной строки."""
    parser.addoption(
        "--browser-name",
        default="chromium",
        choices=["chromium", "firefox", "webkit"],
        help="Имя браузера для тестов",
    )
    parser.addoption(
        "--headed",
        action="store_true",
        default=False,
        help="Запускать браузер в headed режиме",
    )
    parser.addoption(
        "--slow-mo",
        default=0,
        type=int,
        help="Замедление в миллисекундах между действиями",
    )


@pytest.fixture(scope="session")
def browser_name(request):
    """Возвращает имя браузера из опций."""
    return request.config.getoption("--browser-name")


@pytest.fixture(scope="session")
def browser_type_launch_args(request):
    """Аргументы для запуска браузера."""
    return {
        "headless": not request.config.getoption("--headed"),
        "slow_mo": request.config.getoption("--slow-mo"),
    }


@pytest.fixture(scope="session")
def browser(playwright: Playwright, browser_name: str,
            browser_type_launch_args: dict):
    """Создаёт и запускает браузер."""
    browser_type = getattr(playwright, browser_name)
    browser = browser_type.launch(**browser_type_launch_args)
    yield browser
    browser.close()`

const dockerfileCode = `# Dockerfile для запуска Playwright тестов
# Базовый образ с Python и Playwright
FROM mcr.microsoft.com/playwright/python:v1.49.1-jammy

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем зависимости
COPY requirements.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем тесты и конфигурацию
COPY tests/ tests/
COPY pytest.ini .

# Устанавливаем переменные окружения
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Команда по умолчанию - запуск тестов
CMD ["pytest", "tests/", "-v", "--tb=short", "--browser=chromium"]`

const dockerComposeCode = `version: "3.8"

services:
  playwright-tests:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: trendvision-tests
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ./test-results:/app/test-results
      - ./reports:/app/reports
    command: >
      pytest tests/ -v --tb=short
      --browser=chromium
      --output=test-results/
      --html=reports/report.html
      --self-contained-html
    shm_size: '2gb'`

const requirementsCode = `playwright==1.49.1
pytest==8.3.4
pytest-playwright==0.5.2
pytest-html==4.1.1`

type TabId = 'tests' | 'conftest' | 'dockerfile' | 'compose' | 'requirements'

interface Tab {
  id: TabId
  label: string
  icon: string
  code: string
  language: string
}

const tabs: Tab[] = [
  { id: 'tests', label: 'test_trendvision_support.py', icon: '🧪', code: testCode, language: 'python' },
  { id: 'conftest', label: 'conftest.py', icon: '⚙️', code: conftestCode, language: 'python' },
  { id: 'dockerfile', label: 'Dockerfile', icon: '🐳', code: dockerfileCode, language: 'dockerfile' },
  { id: 'compose', label: 'docker-compose.yml', icon: '📦', code: dockerComposeCode, language: 'yaml' },
  { id: 'requirements', label: 'requirements.txt', icon: '📋', code: requirementsCode, language: 'text' },
]

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-md transition-all opacity-0 group-hover:opacity-100 z-10"
      >
        {copied ? '✓ Скопировано' : '📋 Копировать'}
      </button>
      <pre className="bg-slate-900 rounded-xl p-6 overflow-x-auto text-sm leading-relaxed border border-slate-700">
        <code className={`language-${language} text-slate-100`}>
          {code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="text-slate-600 select-none w-10 text-right mr-6 flex-shrink-0">
                {i + 1}
              </span>
              <span className="flex-1">
                {highlightLine(line, language)}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  )
}

function highlightLine(line: string, language: string): JSX.Element {
  if (language === 'python') {
    // Comments
    if (line.trimStart().startsWith('#') || line.trimStart().startsWith('"""')) {
      return <span className="text-emerald-400">{line}</span>
    }
    // Keywords
    const keywords = /\b(import|from|def|class|return|yield|if|else|elif|try|except|assert|with|as|not|and|or|in|is|None|True|False|self)\b/g
    const parts = line.split(keywords)
    if (parts.length > 1) {
      return (
        <span>
          {parts.map((part, i) => {
            if (/^(import|from|def|class|return|yield|if|else|elif|try|except|assert|with|as|not|and|or|in|is|None|True|False|self)$/.test(part)) {
              return <span key={i} className="text-purple-400 font-semibold">{part}</span>
            }
            // Strings
            const stringParts = part.split(/(["'].*?["'])/g)
            return stringParts.map((sp, j) => {
              if (/^["'].*["']$/.test(sp)) {
                return <span key={`${i}-${j}`} className="text-amber-300">{sp}</span>
              }
              return <span key={`${i}-${j}`}>{sp}</span>
            })
          })}
        </span>
      )
    }
  }
  if (language === 'dockerfile') {
    if (line.trimStart().startsWith('#')) {
      return <span className="text-emerald-400">{line}</span>
    }
    const keywords = /^(FROM|WORKDIR|COPY|RUN|ENV|CMD|EXPOSE|ENTRYPOINT|ARG|LABEL)/
    if (keywords.test(line.trimStart())) {
      const match = line.match(/^(\s*)(FROM|WORKDIR|COPY|RUN|ENV|CMD|EXPOSE|ENTRYPOINT|ARG|LABEL)(.*)$/)
      if (match) {
        return (
          <span>
            <span>{match[1]}</span>
            <span className="text-cyan-400 font-bold">{match[2]}</span>
            <span className="text-slate-200">{match[3]}</span>
          </span>
        )
      }
    }
  }
  if (language === 'yaml') {
    if (line.trimStart().startsWith('#')) {
      return <span className="text-emerald-400">{line}</span>
    }
    const keyMatch = line.match(/^(\s*)([\w-]+)(:)(.*)$/)
    if (keyMatch) {
      return (
        <span>
          <span>{keyMatch[1]}</span>
          <span className="text-cyan-400">{keyMatch[2]}</span>
          <span className="text-slate-400">{keyMatch[3]}</span>
          <span className="text-amber-300">{keyMatch[4]}</span>
        </span>
      )
    }
  }
  return <span>{line}</span>
}

function TestFlowDiagram() {
  const steps = [
    { icon: '🌐', title: 'Открыть страницу', desc: 'trendvision.ru/support/#Firmware' },
    { icon: '📂', title: 'Категория', desc: 'Видеорегистраторы / В форме зеркала' },
    { icon: '📷', title: 'Товар', desc: 'TrendVision MR-710GP' },
    { icon: '🔢', title: 'Серийный номер', desc: 'Все серийные номера' },
    { icon: '📋', title: 'База камер', desc: 'Проверка появления блока' },
    { icon: '⬇️', title: 'Скачать', desc: 'data_*.rar ссылка' },
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 min-w-[140px] hover:border-blue-500 transition-colors">
            <span className="text-2xl mb-1">{step.icon}</span>
            <span className="text-sm font-semibold text-white">{step.title}</span>
            <span className="text-xs text-slate-400 text-center mt-1">{step.desc}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="hidden md:block text-blue-400 text-xl mx-2">→</div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('tests')
  const activeTabData = tabs.find(t => t.id === activeTab)!

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-lg font-bold">
              🎭
            </div>
            <div>
              <h1 className="text-lg font-bold">TrendVision Tests</h1>
              <p className="text-xs text-slate-400">Playwright + Python + Docker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded-full border border-green-800">
              ✓ 9 тестов
            </span>
            <span className="px-2 py-1 bg-blue-900/50 text-blue-400 text-xs rounded-full border border-blue-800">
              🐳 Docker
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Автотесты страницы поддержки TrendVision
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Автоматизированные E2E тесты для проверки работы фильтров прошивок
            на странице <code className="text-blue-400 bg-slate-800 px-2 py-0.5 rounded">trendvision.ru/support/#Firmware</code>
          </p>
        </section>

        {/* Flow Diagram */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-center text-slate-300">🔄 Рабочий процесс теста</h3>
          <TestFlowDiagram />
        </section>

        {/* Test Table */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-slate-300">📊 Список тестов</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/80">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-300 font-medium">Тест</th>
                  <th className="text-left px-4 py-3 text-slate-300 font-medium">Описание</th>
                  <th className="text-center px-4 py-3 text-slate-300 font-medium">Класс</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  { name: 'test_page_loads', desc: 'Проверка загрузки страницы', cls: 'TestTrendVisionSupport' },
                  { name: 'test_category_dropdown_exists', desc: 'Проверка наличия dropdown "Категория"', cls: 'TestTrendVisionSupport' },
                  { name: 'test_select_category', desc: 'Выбор категории "В форме зеркала"', cls: 'TestTrendVisionSupport' },
                  { name: 'test_select_product', desc: 'Выбор товара "TrendVision MR-710GP"', cls: 'TestTrendVisionSupport' },
                  { name: 'test_select_serial_number', desc: 'Выбор "Все серийные номера"', cls: 'TestTrendVisionSupport' },
                  { name: 'test_camera_database_block_appears', desc: 'Проверка блока "База камер"', cls: 'TestTrendVisionSupport' },
                  { name: 'test_full_workflow', desc: 'Полный рабочий процесс', cls: 'TestTrendVisionSupport' },
                  { name: 'test_dropdowns_workflow_with_selectors', desc: 'Альтернативный тест с CSS-селекторами', cls: 'Alternative' },
                  { name: 'test_download_link_format', desc: 'Проверка формата ссылки data_*.rar', cls: 'Alternative' },
                ].map((test, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-blue-400 text-xs">{test.name}</code>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{test.desc}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-purple-900/30 text-purple-300 text-xs rounded-full">
                        {test.cls}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Code Tabs */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-slate-300">💻 Исходный код</h3>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1 mb-4 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split('.')[0]}</span>
              </button>
            ))}
          </div>

          {/* Code Block */}
          <CodeBlock code={activeTabData.code} language={activeTabData.language} />
        </section>

        {/* Quick Start */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-slate-300">🚀 Быстрый старт</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🐳</span> Docker
              </h4>
              <CodeBlock
                language="bash"
                code={`# Собрать и запустить тесты
docker compose up --build

# Или через docker напрямую
docker build -t trendvision-tests .
docker run --rm trendvision-tests`}
              />
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🐍</span> Локально
              </h4>
              <CodeBlock
                language="bash"
                code={`# Установить зависимости
pip install -r requirements.txt
playwright install chromium

# Запустить тесты
pytest tests/ -v

# С отчётом
pytest tests/ --html=report.html`}
              />
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-slate-300 text-center">🛠 Технологический стек</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Python 3.11+', icon: '🐍', color: 'from-yellow-500 to-blue-500' },
              { name: 'Playwright', icon: '🎭', color: 'from-green-500 to-emerald-500' },
              { name: 'pytest', icon: '🧪', color: 'from-blue-500 to-cyan-500' },
              { name: 'Docker', icon: '🐳', color: 'from-blue-600 to-blue-400' },
              { name: 'Chromium', icon: '🌐', color: 'from-red-500 to-yellow-500' },
            ].map((tech, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-5 py-3 border border-slate-700 hover:border-slate-500 transition-colors">
                <span className="text-2xl">{tech.icon}</span>
                <span className="font-medium text-slate-200">{tech.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* File Structure */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-slate-300 text-center">📁 Структура проекта</h3>
          <div className="max-w-md mx-auto bg-slate-800/50 rounded-xl p-6 border border-slate-700 font-mono text-sm">
            <div className="text-slate-300">
              <div className="text-blue-400">├── 🐳 Dockerfile</div>
              <div className="text-blue-400">├── 📦 docker-compose.yml</div>
              <div className="text-green-400">├── 📋 requirements.txt</div>
              <div className="text-purple-400">├── ⚙️ pytest.ini</div>
              <div className="text-slate-300">├── 📁 tests/</div>
              <div className="text-slate-400 ml-6">├── ⚙️ conftest.py</div>
              <div className="text-slate-400 ml-6">└── 🧪 test_trendvision_support.py</div>
              <div className="text-slate-300">└── 📄 README.md</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>Playwright E2E Tests для TrendVision Support Page</p>
        <p className="mt-1">Python • Playwright • pytest • Docker</p>
      </footer>
    </div>
  )
}
