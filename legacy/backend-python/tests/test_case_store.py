import unittest
import time
from app.services.case_store import save_case, get_case, list_recent_cases

class TestCaseStore(unittest.TestCase):
    def test_save_and_retrieve_case(self):
        test_case_id = f"SG-TEST-{int(time.time() * 1000)}"
        case_payload = {
            "case_id": test_case_id,
            "evidence_type": "url",
            "evidence_content": "https://phishing-bca.xyz",
            "content_risk": 88,
            "confidence": 92,
            "initial_exposure": 10,
            "risk_level": "SANGAT TINGGI",
            "summary": "Tautan phising perbankan tiruan.",
            "indicators": [{"title": "Typosquatting", "impact": "KRITIS", "level": "red", "desc": "Domain palsu"}]
        }

        saved_id = save_case(case_payload)
        self.assertEqual(saved_id, test_case_id)

        # Retrieve and verify
        retrieved = get_case(test_case_id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved["case_id"], test_case_id)
        self.assertEqual(retrieved["content_risk"], 88)
        self.assertEqual(len(retrieved["indicators"]), 1)
        self.assertEqual(retrieved["indicators"][0]["title"], "Typosquatting")

    def test_update_case_exposure(self):
        test_case_id = f"SG-UPDATE-{int(time.time() * 1000)}"
        case_payload = {
            "case_id": test_case_id,
            "evidence_type": "text",
            "evidence_content": "Pesan tagihan tilang",
            "content_risk": 90,
            "confidence": 85,
            "initial_exposure": 10,
            "risk_level": "SANGAT TINGGI",
            "summary": "Pesan APK berbahaya."
        }
        save_case(case_payload)

        # Update with interview answers
        save_case({
            "case_id": test_case_id,
            "user_exposure": 95,
            "opened_link": True,
            "entered_credentials": True,
            "entered_otp": True,
            "is_emergency": True
        })

        updated = get_case(test_case_id)
        self.assertEqual(updated["user_exposure"], 95)
        self.assertTrue(updated["entered_otp"])
        self.assertTrue(updated["is_emergency"])

    def test_list_recent_cases(self):
        cases = list_recent_cases(limit=5)
        self.assertIsInstance(cases, list)

if __name__ == "__main__":
    unittest.main()
