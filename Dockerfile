# Dockerfile для запуска тестов Playwright
# Используем образ с Python 3.11
FROM python:3.11-slim

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем файл с зависимостями
COPY requirements.txt .

# Ставим зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Устанавливаем браузеры для Playwright и системные библиотеки
RUN playwright install --with-deps chromium

# Копируем тесты
COPY tests/ tests/

# Запускаем тесты
CMD ["python", "-m", "pytest", "tests/", "-v", "-s"]
