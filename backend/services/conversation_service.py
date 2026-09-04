"""
KelanaAI Conversational Memory Service
Sesi 10: Conversational Memory with Amazon Bedrock / LLMs

Because Large Language Models (LLMs) are inherently stateless, this service
demonstrates managing conversational state by:
1. Persisting conversation sessions and messages in database storage.
2. Reconstructing message history into the multi-turn format expected by Bedrock Converse API.
3. Injecting grounding knowledge and system instructions.
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

class BedrockConversationService:
    def __init__(self, model_id: Optional[str] = None):
        self.model_id = model_id or os.environ.get("MODEL_ID", "amazon.nova-lite-v1:0")
        self.region = os.environ.get("AWS_REGION", "ap-southeast-2")
        # In-memory session store simulating database persistence
        self._conversations: Dict[str, Dict[str, Any]] = {}

    def get_or_create_conversation(self, conversation_id: str, title: str = "New Trip Consultation") -> Dict[str, Any]:
        """Retrieves or creates a persistent conversation session."""
        if conversation_id not in self._conversations:
            now = datetime.utcnow().isoformat() + "Z"
            self._conversations[conversation_id] = {
                "id": conversation_id,
                "title": title,
                "created_at": now,
                "updated_at": now,
                "messages": []
            }
        return self._conversations[conversation_id]

    def add_message(self, conversation_id: str, role: str, content: str) -> Dict[str, Any]:
        """Appends a message with timestamp to conversational memory."""
        conv = self.get_or_create_conversation(conversation_id)
        now = datetime.utcnow().isoformat() + "Z"
        msg = {
            "id": f"msg-{len(conv['messages']) + 1}",
            "conversation_id": conversation_id,
            "role": role,  # 'user' or 'assistant'
            "content": content,
            "created_at": now
        }
        conv["messages"].append(msg)
        conv["updated_at"] = now
        return msg

    def build_bedrock_messages_payload(self, conversation_id: str) -> List[Dict[str, Any]]:
        """
        Reconstructs the full message history from the database into
        Amazon Bedrock Converse API multi-turn format:
        [
            {"role": "user", "content": [{"text": "..."}]},
            {"role": "assistant", "content": [{"text": "..."}]}
        ]
        """
        conv = self.get_or_create_conversation(conversation_id)
        bedrock_messages = []

        for msg in conv["messages"]:
            if msg["role"] in ["user", "assistant"]:
                bedrock_messages.append({
                    "role": msg["role"],
                    "content": [{"text": msg["content"]}]
                })

        return bedrock_messages

    def build_system_prompt(self, context_snippets: Optional[List[str]] = None) -> List[Dict[str, str]]:
        """Builds system prompt instructing the model on conversational memory and tone."""
        system_text = (
            "You are KelanaAI, an expert travel consultant with conversational memory. "
            "You remember previous user inputs in this session to provide coherent, "
            "contextual travel planning. Answer politely, accurately, and in well-structured Markdown."
        )
        if context_snippets:
            snippets_str = "\n---\n".join(context_snippets)
            system_text += f"\n\nVerified Knowledge Base Excerpts:\n{snippets_str}"

        return [{"text": system_text}]
