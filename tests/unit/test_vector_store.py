import pytest
from app.rag.vector_store import split_text
def test_split_text_keeps_overlap():
    assert split_text(
        "abcdefghij",
        chunk_size=6,
        overlap=2
    ) == ["abcdef", "efghij", "ij"]

def test_split_text_rejects_invalid_sizes():
    with pytest.raises(ValueError):
        split_text("test", chunk_size=10, overlap=10)
