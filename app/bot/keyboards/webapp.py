import os

from dotenv import load_dotenv, find_dotenv

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.types.web_app_info import WebAppInfo


def webapp_keyboard():
    load_dotenv(find_dotenv())

    app_instance = os.getenv('APP_INSTANCE')
    print(app_instance)

    if app_instance == 'demo':
        print(f"Returning demo keyboard")
        return InlineKeyboardMarkup(
            inline_keyboard = [
                [
                    InlineKeyboardButton(text='Открыть приложение 📱',
                                        web_app=WebAppInfo(url='https://servisplus.publicvm.com/'))
                ]
            ]
        )
    elif app_instance == 'dev':
        print(f"Returning dev keyboard")
        return InlineKeyboardMarkup(
            inline_keyboard = [
                [
                    InlineKeyboardButton(text='Открыть приложение 📱',
                                        web_app=WebAppInfo(url='https://servisplus-development.publicvm.com/'))
                ]
            ]
        )