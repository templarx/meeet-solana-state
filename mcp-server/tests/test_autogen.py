"""Tests for MEEET AutoGen Integration"""
import pytest
from meeet_autogen import (
    MEEETTrustLayer,
    MEEETAgent,
    MEEETGroupChat,
    MEEETAutoGenAdapter,
    create_meeet_autogen
)


@pytest.fixture
def trust_layer():
    return MEEETTrustLayer(api_key="test_key", base_url="http://localhost:8000/api")


@pytest.fixture
def adapter():
    return create_meeet_autogen(api_key="test_key", base_url="http://localhost:8000/api")


class TestMEEETTrustLayer:
    def test_init(self, trust_layer):
        assert trust_layer.api_key == "test_key"
        assert trust_layer.base_url == "http://localhost:8000/api"


class TestMEEETAgent:
    def test_create_agent(self, adapter):
        agent = adapter.create_agent("test_agent")
        assert agent.name == "test_agent"
        assert agent.agent_did == "did:meeet:test_agent"
        assert len(agent._action_log) == 0

    def test_agent_status(self, adapter):
        adapter.create_agent("status_agent")
        status = adapter.get_agent_status("status_agent")
        assert status["name"] == "status_agent"
        assert status["actions_count"] == 0

    def test_list_agents(self, adapter):
        adapter.create_agent("agent1")
        adapter.create_agent("agent2")
        agents = adapter.list_agents()
        assert len(agents) >= 2


class TestMEEETGroupChat:
    def test_create_group_chat(self, adapter):
        adapter.create_agent("chat_agent_1")
        adapter.create_agent("chat_agent_2")
        chat = adapter.create_group_chat("test_chat", ["chat_agent_1", "chat_agent_2"])
        assert chat is not None
        assert len(chat.agents) == 2

    def test_list_chats(self, adapter):
        adapter.create_agent("list_agent_1")
        adapter.create_agent("list_agent_2")
        adapter.create_group_chat("chat1", ["list_agent_1", "list_agent_2"])
        chats = adapter.list_group_chats()
        assert len(chats) >= 1


class TestMEEETAutoGenAdapter:
    def test_factory(self):
        adapter = create_meeet_autogen(api_key="test_key")
        assert isinstance(adapter, MEEETAutoGenAdapter)

    def test_create_multiple_agents(self, adapter):
        a1 = adapter.create_agent("multi_1")
        a2 = adapter.create_agent("multi_2")
        assert a1.name != a2.name
        assert len(adapter.list_agents()) >= 2

    def test_agent_not_found(self, adapter):
        status = adapter.get_agent_status("nonexistent")
        assert "error" in status
