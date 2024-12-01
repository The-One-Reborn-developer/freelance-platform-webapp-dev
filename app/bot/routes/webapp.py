from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message, ReplyKeyboardRemove

from app.bot.keyboards.webapp import webapp_keyboard

from app.bot.views.webapp import welcome_webapp_button


webapp_router = Router()


@webapp_router.message(CommandStart())
async def start(message: Message):
    await message.answer(welcome_webapp_button(),
                         reply_markup=ReplyKeyboardRemove())