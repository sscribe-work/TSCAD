# Тесты TrendVision Support

Тесты для страницы https://trendvision.ru/support/#Firmware

## Что тестируем

1. Открываем страницу поддержки
2. Выбираем в dropdown "Категория" → "Видеорегистраторы / В форме зеркала"
3. Выбираем в dropdown "Товар" → "TrendVision MR-710GP"
4. Выбираем в dropdown "Серийный номер" → "Все серийные номера"
5. Проверяем что появился блок "База камер"
6. Проверяем что есть кнопка "Скачать" со ссылкой на data_*.rar

## Как запустить

### Через Docker

```bash
docker compose up --build
```

### Локально

```bash
pip install -r requirements.txt
playwright install chromium
python -m pytest tests/ -v -s
```

Или просто:

```bash
python tests/test_trendvision.py
```

## Структура

```
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── tests/
│   └── test_trendvision.py
└── README.md
```
