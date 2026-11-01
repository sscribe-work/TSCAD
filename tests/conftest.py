"""
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
def browser(playwright: Playwright, browser_name: str, browser_type_launch_args: dict):
    """Создаёт и запускает браузер."""
    browser_type = getattr(playwright, browser_name)
    browser = browser_type.launch(**browser_type_launch_args)
    yield browser
    browser.close()
