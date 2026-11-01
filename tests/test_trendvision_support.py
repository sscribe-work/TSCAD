"""
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
        expect(page).to_have_title(re.compile("TrendVision|Поддержка|support", re.IGNORECASE))

    def test_category_dropdown_exists(self, page: Page):
        """Тест: dropdown 'Категория' существует на странице."""
        page.goto(BASE_URL, wait_until="networkidle")
        category_label = page.locator("text=Категория").first
        expect(category_label).to_be_visible(timeout=10000)

    def test_select_category(self, page: Page):
        """Тест: выбор категории 'Видеорегистраторы / В форме зеркала'."""
        page.goto(BASE_URL, wait_until="networkidle")

        # Находим первый dropdown с названием "Категория"
        category_select = page.locator("select").first
        # Если не select, пробуем найти через label
        if not category_select.is_visible():
            category_select = page.locator("[name*='categor'], [id*='categor'], .category-select").first

        # Пробуем различные способы выбора
        try:
            # Способ 1: через select element
            category_select.select_option(label="Видеорегистраторы / В форме зеркала")
        except Exception:
            try:
                # Способ 2: через value
                category_select.select_option(value="mirror")
            except Exception:
                # Способ 3: через клик по dropdown
                category_select.click()
                option = page.locator("text=Видеорегистраторы").first
                option.click()

        # Проверяем что выбор сделан
        expect(category_select).to_contain_text("Видеорегистраторы", timeout=5000)

    def test_select_product(self, page: Page):
        """Тест: выбор товара 'TrendVision MR-710GP'."""
        page.goto(BASE_URL, wait_until="networkidle")

        # Сначала выбираем категорию
        self._select_category(page)

        # Находим второй dropdown "Товар"
        product_dropdown = page.locator("select").nth(1)
        if not product_dropdown.is_visible():
            product_dropdown = page.locator("[name*='product'], [id*='product'], .product-select").first

        try:
            product_dropdown.select_option(label="TrendVision MR-710GP")
        except Exception:
            try:
                product_dropdown.select_option(value="mr-710gp")
            except Exception:
                product_dropdown.click()
                option = page.locator("text=MR-710GP").first
                option.click()

        # Проверяем что товар выбран
        expect(product_dropdown).to_contain_text("MR-710GP", timeout=5000)

    def test_select_serial_number(self, page: Page):
        """Тест: выбор серийного номера 'Все серийные номера'."""
        page.goto(BASE_URL, wait_until="networkidle")

        # Выбираем категорию и товар
        self._select_category(page)
        self._select_product(page)

        # Находим третий dropdown "Серийный номер"
        serial_dropdown = page.locator("select").nth(2)
        if not serial_dropdown.is_visible():
            serial_dropdown = page.locator("[name*='serial'], [id*='serial'], .serial-select").first

        try:
            serial_dropdown.select_option(label="Все серийные номера")
        except Exception:
            try:
                serial_dropdown.select_option(value="all")
            except Exception:
                serial_dropdown.click()
                option = page.locator("text=Все серийные номера").first
                option.click()

        # Проверяем что серийный номер выбран
        expect(serial_dropdown).to_contain_text("Все серийные номера", timeout=5000)

    def test_camera_database_block_appears(self, page: Page):
        """
        Тест: после выбора всех трёх dropdown появляется блок 'База камер'
        с кнопкой-ссылкой 'Скачать'.
        """
        page.goto(BASE_URL, wait_until="networkidle")

        # Выполняем все три выбора
        self._select_category(page)
        self._select_product(page)
        self._select_serial_number(page)

        # Проверяем появление блока "База камер"
        camera_db_block = page.locator("text=База камер").first
        expect(camera_db_block).to_be_visible(timeout=15000)

        # Проверяем наличие кнопки/ссылки "Скачать"
        download_button = page.locator("a:has-text('Скачать'), button:has-text('Скачать')").first
        expect(download_button).to_be_visible(timeout=10000)

        # Проверяем что ссылка ведёт на .rar файл
        download_url = download_button.get_attribute("href")
        assert download_url is not None, "Ссылка 'Скачать' не найдена"
        assert re.search(r"trendvision\.ru/uploads/data_.*\.rar", download_url), (
            f"Ссылка не соответствует паттерну data_*.rar: {download_url}"
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
        # Ищем dropdown по label "Категория"
        category_container = page.locator("text=Категория").first
        category_container.click()
        page.wait_for_timeout(500)

        # Выбираем опцию "Видеорегистраторы / В форме зеркала"
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
        page.wait_for_timeout(1000)


class TestTrendVisionSupportAlternative:
    """
    Альтернативный класс тестов с использованием CSS-селекторов
    и более надёжных локаторов.
    """

    def test_dropdowns_workflow_with_selectors(self, page: Page):
        """
        Тест с использованием более специфичных селекторов.
        Подходит если dropdown реализован через <select> элементы.
        """
        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_timeout(2000)

        # Находим все select элементы
        selects = page.locator("select")
        select_count = selects.count()

        if select_count >= 3:
            # Работаем с нативными select элементами
            category_select = selects.nth(0)
            product_select = selects.nth(1)
            serial_select = selects.nth(2)

            # Выбираем категорию
            category_select.select_option(label="Видеорегистраторы / В форме зеркала")
            page.wait_for_timeout(1000)

            # Выбираем товар
            product_select.select_option(label="TrendVision MR-710GP")
            page.wait_for_timeout(1000)

            # Выбираем серийный номер
            serial_select.select_option(label="Все серийные номера")
            page.wait_for_timeout(1000)

            # Проверяем результат
            camera_db = page.locator("text=База камер").first
            expect(camera_db).to_be_visible(timeout=15000)

            download_btn = page.locator("a:has-text('Скачать')").first
            expect(download_btn).to_be_visible(timeout=10000)

            href = download_btn.get_attribute("href")
            assert href and re.match(
                r"https?://trendvision\.ru/uploads/data_.*\.rar", href
            ), f"Неверная ссылка: {href}"
        else:
            pytest.skip("На странице не найдено 3 select элемента")

    def test_download_link_format(self, page: Page):
        """Тест: проверка формата ссылки для скачивания."""
        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_timeout(2000)

        # Выполняем выбор через все dropdown
        self._complete_all_selections(page)

        # Находим все ссылки с текстом "Скачать"
        download_links = page.locator("a:has-text('Скачать')")
        count = download_links.count()
        assert count > 0, "Не найдено ссылок 'Скачать'"

        # Проверяем формат первой ссылки
        first_link = download_links.first
        href = first_link.get_attribute("href")
        assert href is not None, "Атрибут href не найден"

        # Паттерн: https://trendvision.ru/uploads/data_*.rar
        pattern = r"https?://trendvision\.ru/uploads/data_\d+\.rar"
        assert re.match(pattern, href), (
            f"Ссылка не соответствует паттерну {pattern}. Получено: {href}"
        )

    def _complete_all_selections(self, page: Page):
        """Выполнить все три выбора в dropdown."""
        selects = page.locator("select")

        if selects.count() >= 3:
            selects.nth(0).select_option(label="Видеорегистраторы / В форме зеркала")
            page.wait_for_timeout(1000)
            selects.nth(1).select_option(label="TrendVision MR-710GP")
            page.wait_for_timeout(1000)
            selects.nth(2).select_option(label="Все серийные номера")
            page.wait_for_timeout(1000)
        else:
            # Fallback: ищем через текст
            page.locator("text=Категория").first.click()
            page.wait_for_timeout(500)
            page.locator("text=В форме зеркала").first.click()
            page.wait_for_timeout(1000)

            page.locator("text=Товар").first.click()
            page.wait_for_timeout(500)
            page.locator("text=MR-710GP").first.click()
            page.wait_for_timeout(1000)

            page.locator("text=Серийный номер").first.click()
            page.wait_for_timeout(500)
            page.locator("text=Все серийные номера").first.click()
            page.wait_for_timeout(1000)
