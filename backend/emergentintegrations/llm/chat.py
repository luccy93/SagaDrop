"""Stub for emergentintegrations.llm.chat — real package unavailable in this environment."""


class UserMessage:
    def __init__(self, text: str = "", **kwargs):
        self.text = text


class _ModelChain:
    def with_params(self, **kwargs):
        return self

    async def send_message(self, msg):
        raise RuntimeError(
            "emergentintegrations is not available in this environment. "
            "AI features require the EMERGENT_LLM_KEY and the real package."
        )

    async def send_message_multimodal_response(self, msg):
        raise RuntimeError(
            "emergentintegrations is not available in this environment. "
            "AI features require the EMERGENT_LLM_KEY and the real package."
        )


class LlmChat:
    def __init__(self, api_key: str = "", session_id: str = "", system_message: str = "", **kwargs):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message

    def with_model(self, provider: str, model: str):
        return _ModelChain()
