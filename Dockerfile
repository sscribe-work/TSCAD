# Dockerfile для запуска Playwright тестов
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
CMD ["pytest", "tests/", "-v", "--tb=short", "--browser=chromium"]
