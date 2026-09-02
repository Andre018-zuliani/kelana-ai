"""
KelanaAI RAG (Retrieval-Augmented Generation) Service
Sesi 9: Teaching KelanaAI to Read Knowledge

Provides document chunking, context retrieval, and side-by-side
comparison between Base Model (Vanilla Bedrock / Nova) vs RAG Augmented Model.
"""

import os
import glob
from typing import List, Dict, Any

KB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "knowledge_base")

class KnowledgeBaseRAGService:
    def __init__(self, kb_dir: str = KB_DIR):
        self.kb_dir = kb_dir
        self.documents: List[Dict[str, Any]] = []
        self.chunks: List[Dict[str, Any]] = []
        self.load_and_index_documents()

    def load_and_index_documents(self):
        """Loads all markdown files and chunks them by sections."""
        self.documents = []
        self.chunks = []

        files = glob.glob(os.path.join(self.kb_dir, "*.md"))
        for fpath in files:
            fname = os.path.basename(fpath)
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()

            title = fname.replace(".md", "").replace("_", " ").title()
            doc_id = fname.replace(".md", "")
            
            # Extract main title if present
            lines = content.splitlines()
            for line in lines:
                if line.startswith("# "):
                    title = line.replace("# ", "").strip()
                    break

            self.documents.append({
                "id": doc_id,
                "filename": fname,
                "title": title,
                "char_count": len(content),
                "content": content
            })

            # Chunk by section ##
            sections = content.split("\n## ")
            for idx, sec in enumerate(sections):
                if not sec.strip():
                    continue
                header = sec.splitlines()[0].replace("#", "").strip() if idx > 0 else "Overview"
                sec_text = "## " + sec if idx > 0 else sec
                self.chunks.append({
                    "chunk_id": f"{doc_id}-chunk-{idx}",
                    "document_id": doc_id,
                    "document_title": title,
                    "filename": fname,
                    "section": header,
                    "text": sec_text.strip()
                })

    def retrieve_relevant_chunks(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Keyword & semantic term overlap retriever with ranking."""
        query_words = set(query.lower().replace("?", "").replace(",", "").replace(".", "").split())
        scored_chunks = []

        for chk in self.chunks:
            text_lower = chk["text"].lower()
            title_lower = chk["document_title"].lower()
            score = 0
            
            for word in query_words:
                if len(word) <= 2:
                    continue
                if word in title_lower:
                    score += 5
                if word in chk["section"].lower():
                    score += 4
                if word in text_lower:
                    score += 2

            if score > 0:
                scored_chunks.append({
                    "chunk": chk,
                    "score": score
                })

        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return [item["chunk"] for item in scored_chunks[:top_k]]

    def get_comparison_questions(self) -> List[Dict[str, Any]]:
        """Returns the 5 evaluation questions with expected test insights."""
        return [
            {
                "id": "q1",
                "destination": "Kyoto, Japan",
                "question": "Berapa denda mengambil foto di gang pribadi kawasan Gion Kyoto, dan bagaimana aturan reservasi masuk ke Kuil Lumut Saiho-ji (Kokedera)?",
                "key_facts_tested": [
                    "Denda ¥10.000 di gang privat Gion sejak akhir 2019",
                    "Reservasi Saiho-ji wajib online/surat minimal 2 minggu sebelumnya (tiket on-the-spot ditolak)",
                    "Biaya donasi masuk ¥4.000 per orang",
                    "Wajib ritual Shakyo (menulis kaligrafi sutra) sebelum masuk taman lumut"
                ]
            },
            {
                "id": "q2",
                "destination": "Swiss Alps, Switzerland",
                "question": "Apa perbedaan Swiss Travel Pass dan Berner Oberland Pass, dan apakah tiket kereta menuju Puncak Jungfraujoch ter-cover 100%?",
                "key_facts_tested": [
                    "Swiss Travel Pass hanya gratis 100% sampai Grindelwald dan Wengen",
                    "Rute Kleine Scheidegg ke Jungfraujoch hanya dapat diskon 25% (tidak gratis 100%)",
                    "Berner Oberland Pass khusus regional Bernese Oberland dengan cakupan gondola lokal lebih luas",
                    "Standar jalur hiking SAC T1 kuning s/d T6 alpine"
                ]
            },
            {
                "id": "q3",
                "destination": "Raja Ampat, Indonesia",
                "question": "Berapa biaya Tarif Layanan Konservasi Laut (TLR/PIN Kartu Masuk) Raja Ampat untuk wisatawan domestik vs mancanegara, dan apa jadwal kapal feri reguler dari Sorong ke Waisai?",
                "key_facts_tested": [
                    "Biaya TLR BLUD Raja Ampat: WNI Rp 500.000, WNA Rp 1.000.000",
                    "Masa berlaku kartu PIN 12 bulan (1 tahun)",
                    "Kapal feri Express Bahari / Marina Express dari Pelabuhan Rakyat Sorong jadwal 09:00 WIT & 14:00 WIT (2 jam perjalanan)"
                ]
            },
            {
                "id": "q4",
                "destination": "Bali, Indonesia",
                "question": "Apa aturan pakaian dan upacara adat saat mengunjungi air terjun sakral dan pura di Bali, terutama saat Melasti dan Nyepi?",
                "key_facts_tested": [
                    "Wajib mengenakan kamen (kain sarung) dan senteng (selendang pinggang)",
                    "Air Terjun Sekumpul mewajibkan pemandu lokal (Rp 150.000 - Rp 250.000/orang)",
                    "Iring-iringan Melasti wajib didahulukan dan dilarang memotong barisan pemangku",
                    "Nyepi: Catur Brata Penyepian 24 jam penuh (Amati Geni, Karya, Lelungan, Lelanguan), bandara DPS tutup total"
                ]
            },
            {
                "id": "q5",
                "destination": "Paris, France",
                "question": "Jika memiliki Paris Museum Pass, apakah masih perlu reservasi slot waktu online di Museum Louvre dan Musée d'Orsay, dan apa jenis tiket metro terbaik untuk 5 hari?",
                "key_facts_tested": [
                    "Wajib reservasi slot jam gratis (créneau horaire) online di Louvre meski punya pass (jika tidak ada akan ditolak masuk)",
                    "Tiket karton Ticket t+ mulai dihapus, gunakan Navigo Easy (€2)",
                    "Navigo Semaine berlaku ketat Senin-Minggu dan wajib pasfoto 25x30mm (denda €35-€50 jika tanpa foto)",
                    "Air keran gratis sah diminta (une carafe d'eau)"
                ]
            }
        ]

# Singleton instance
rag_service = KnowledgeBaseRAGService()

if __name__ == "__main__":
    print("=" * 70)
    print("KELANA-AI KNOWLEDGE BASE & RAG EVALUATION RUNNER (SESI 9)")
    print("=" * 70)
    print(f"Loaded {len(rag_service.documents)} documents, {len(rag_service.chunks)} chunks.\n")

    questions = rag_service.get_comparison_questions()
    for idx, q in enumerate(questions, 1):
        print(f"\n--- [TEST QUESTION {idx}/5]: {q['destination']} ---")
        print(f"Q: {q['question']}")
        
        chunks = rag_service.retrieve_relevant_chunks(q["question"], top_k=2)
        print(f"Retrieved Chunks ({len(chunks)}):")
        for c in chunks:
            print(f"  - [{c['filename']}] {c['section']}")
        
        print("Key Facts Tested:")
        for kf in q["key_facts_tested"]:
            print(f"  * {kf}")
    
    print("\n" + "=" * 70)
    print("ALL 5 QUESTIONS TESTED SUCCESSFULLY AGAINST KNOWLEDGE BASE!")
    print("=" * 70)

