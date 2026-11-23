
class Retriever:
    def __init__(self, knowledge_base, top_k: int, max_distance: float = 0.5):
        self.knowledge_base = knowledge_base
        self.top_k = top_k
        self.max_distance = max_distance

    def retrieve(self, query: str) -> list[dict]:
        results = self.knowledge_base.search(query, self.top_k)

        return [
            result
            for result in results
            if result["score"] <= self.max_distance
        ]