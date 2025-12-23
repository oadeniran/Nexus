import motor.motor_asyncio
from init_env import MONGO_URI

# 1. Configuration
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client.nexus_db