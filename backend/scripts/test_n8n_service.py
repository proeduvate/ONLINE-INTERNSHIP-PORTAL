import asyncio
import logging
from services.n8n_service import trigger_n8n_webhook

logging.basicConfig(level=logging.INFO)

async def test_trigger():
    await trigger_n8n_webhook("APPLICATION_SUBMITTED", {"test": "data"})
    print("Test passed without exceptions")

if __name__ == "__main__":
    asyncio.run(test_trigger())
