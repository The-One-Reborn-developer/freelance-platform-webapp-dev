from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.types.web_app_info import WebAppInfo


def webapp_keyboard():
    return InlineKeyboardMarkup(
        inline_keyboard = [
            [
                InlineKeyboardButton(text='Открыть приложение 📱',
                                     web_app=WebAppInfo(url='https://servisplus.publicvm.com/'))
            ]
        ]
    )
