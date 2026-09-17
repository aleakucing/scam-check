import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestAPIEndpoints(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_root(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")

    def test_health(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["ssrf_protection"], "active")
        self.assertEqual(data["pii_masking"], "active")

    def test_analyze_url(self):
        payload = {
            "type": "url",
            "content": "https://id-bca-verifikasi-keamanan.xyz/login"
        }
        response = self.client.post("/api/analyze", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(data["content_risk"], 75)
        self.assertIn("case_id", data)

    def test_analyze_empty_error(self):
        payload = {
            "type": "url",
            "content": "   "
        }
        response = self.client.post("/api/analyze", json=payload)
        self.assertEqual(response.status_code, 400)

    def test_interview(self):
        payload = {
            "case_id": "SC-2026-TEST",
            "opened_link": True,
            "entered_credentials": True,
            "entered_otp": True
        }
        response = self.client.post("/api/interview", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user_exposure"], 90)
        self.assertTrue(data["is_emergency"])

    def test_report_with_pii_masking(self):
        payload = {
            "case_id": "SC-2026-TEST",
            "content_risk": 90,
            "confidence": 95,
            "user_exposure": 95,
            "evidence_type": "text",
            "evidence_content": "Pesan dari 081234567890 meminta kartu 4111 2222 3333 4444 dan OTP 999888",
            "opened_link": True,
            "entered_credentials": True,
            "entered_otp": True,
            "indicators": [
                {
                    "title": "Pencurian Kredensial",
                    "impact": "KRITIS",
                    "level": "red",
                    "desc": "Pelaku dari nomor 081234567890 meminta data perbankan."
                }
            ]
        }
        response = self.client.post("/api/report", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        formatted = data["formatted_text"]
        self.assertNotIn("081234567890", formatted)
        self.assertNotIn("4111 2222 3333 4444", formatted)
        self.assertNotIn("OTP 999888", formatted)
        self.assertIn("0812", formatted)
        self.assertIn("****", formatted)

if __name__ == "__main__":
    unittest.main()
