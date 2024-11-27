import asyncio
import os

from aiogram import Bot, Dispatcher

from dotenv import load_dotenv, find_dotenv

from app.bot.routes.webapp import webapp_router


async def main():
    load_dotenv(find_dotenv())

    bot = Bot(token=os.getenv('TELEGRAM_BOT_TOKEN'))
    dp = Dispatcher()
    dp.include_routers(
        webapp_router
    )

    await dp.start_polling(bot)


if __name__ == '__main__':
    asyncio.run(main())