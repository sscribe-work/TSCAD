"""
Тесты для страницы https://trendvision.ru/support/#Firmware

Что проверяем:
- Выбираем в фильтрах: Категория -> Товар -> Серийный номер
- После выбора всех трёх фильтров должен появиться блок "База камер"
- В этом блоке должна быть кнопка "Скачать" со ссылкой на .rar архив
"""

import re
from playwright.sync_api import sync_playwright, expect


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

        # Открываем страницу и ждём пока загрузится
        page.goto(URL)
        page.wait_for_load_state("networkidle")

        # Ждём пока на странице появится хотя бы один select (dropdown)
        page.wait_for_selector("select", timeout=15000)

        # ==========================================
        # ШАГ 1: Выбираем категорию
        # ==========================================
        # На сайте это обычные select элементы, берём первый
        selects = page.locator("select")
        category_select = selects.nth(0)

        # Проверяем что первый select вообще виден
        expect(category_select).to_be_visible(timeout=5000)

        # Выбираем нужную опцию по тексту
        category_select.select_option(
            label="Видеорегистраторы / В форме зеркала"
        )

        # Ждём пока обновится второй dropdown (товар) —
        # он должен стать видимым/доступным после выбора категории
        product_select = selects.nth(1)
        expect(product_select).to_be_enabled(timeout=5000)

        # ==========================================
        # ШАГ 2: Выбираем товар
        # ==========================================
        product_select.select_option(label="TrendVision MR-710GP")

        # Ждём пока обновится третий dropdown (серийный номер)
        serial_select = selects.nth(2)
        expect(serial_select).to_be_enabled(timeout=5000)

        # ==========================================
        # ШАГ 3: Выбираем серийный номер
        # ==========================================
        serial_select.select_option(label="Все серийные номера")

        # ==========================================
        # ШАГ 4: Проверяем блок "База камер"
        # ==========================================
        # После выбора всех трёх dropdown должен появиться блок "База камер"
        camera_block = page.locator("text=База камер").first
        expect(camera_block).to_be_visible(timeout=10000)

        # ==========================================
        # ШАГ 5: Проверяем кнопку "Скачать"
        # ==========================================
        # Ищем ссылку "Скачать" — она должна вести на .rar файл
        download_link = page.locator("a", has_text="Скачать").first
        expect(download_link).to_be_visible(timeout=5000)

        # Проверяем что у ссылки есть href
        href = download_link.get_attribute("href")
        assert href is not None, "У ссылки 'Скачать' нет атрибута href!"

        # Ссылка должна быть вида https://trendvision.ru/uploads/data_*.rar
        pattern = r"https?://trendvision\.ru/uploads/data_.*\.rar"
        assert re.match(pattern, href), \
            f"Ссылка не соответствует паттерну data_*.rar: {href}"

        print(f"✓ Тест пройден! Ссылка для скачивания: {href}")

        browser.close()


def test_page_opens():
    """Простой тест — проверяем что страница вообще открывается."""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(URL)
        page.wait_for_load_state("networkidle")

        # Проверяем что title не пустой
        expect(page).to_have_title(re.compile(r".+"), timeout=10000)

        print(f"✓ Страница открылась, title: {page.title()}")
        browser.close()


if __name__ == "__main__":
    # Можно запустить напрямую: python tests/test_trendvision.py
    print("Запуск тестов...")
    print("-" * 50)

    print("\nТест 1: Открытие страницы")
    test_page_opens()

    print("\nТест 2: Фильтры и блок 'База камер'")
    test_firmware_filters()

    print("\n" + "-" * 50)
    print("Все тесты пройдены!")
