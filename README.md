# TrendVision Support Page - Playwright Tests

## Описание

Автоматизированные тесты для страницы поддержки TrendVision (https://trendvision.ru/support/#Firmware).

Тесты проверяют корректную работу фильтров прошивок:
1. Выбор категории "Видеорегистраторы / В форме зеркала"
2. Выбор товара "TrendVision MR-710GP"
3. Выбор серийного номера "Все серийные номера"
4. Проверка появления блока "База камер" с кнопкой "Скачать"

## Структура проекта

```
├── Dockerfile              # Docker образ для запуска тестов
├── docker-compose.yml      # Docker Compose конфигурация
├── requirements.txt        # Python зависимости
├── pytest.ini              # Конфигурация pytest
├── tests/
│   ├── conftest.py         # Фикстуры и конфигурация pytest
│   └── test_trendvision_support.py  # Тесты
└── README.md               # Документация
```

## Быстрый старт

### Запуск через Docker (рекомендуется)

```bash
# Собрать и запустить тесты
docker compose up --build

# Запустить в headed режиме (для отладки, нужен X11)
docker compose --profile headed up --build
```

### Локальный запуск

```bash
# Установить зависимости
pip install -r requirements.txt

# Установить браузеры Playwright
playwright install chromium

# Запустить тесты
pytest tests/ -v

# Запустить конкретный тест
pytest tests/test_trendvision_support.py::TestTrendVisionSupport::test_full_workflow -v
```

### Опции запуска

```bash
# Headed режим
pytest tests/ --headed

# Замедление для отладки
pytest tests/ --headed --slow-mo=500

# Выбор браузера
pytest tests/ --browser-name=firefox
pytest tests/ --browser-name=webkit

# Генерация HTML отчёта
pytest tests/ --html=reports/report.html --self-contained-html
```

## Тесты

| Тест | Описание |
|------|----------|
| `test_page_loads` | Проверка загрузки страницы |
| `test_category_dropdown_exists` | Проверка наличия dropdown "Категория" |
| `test_select_category` | Выбор категории |
| `test_select_product` | Выбор товара |
| `test_select_serial_number` | Выбор серийного номера |
| `test_camera_database_block_appears` | Проверка блока "База камер" |
| `test_full_workflow` | Полный рабочий процесс |
| `test_dropdowns_workflow_with_selectors` | Альтернативный тест с CSS-селекторами |
| `test_download_link_format` | Проверка формата ссылки скачивания |
