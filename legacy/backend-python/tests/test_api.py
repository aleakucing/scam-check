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

    def test_cases_endpoints(self):
        # 1. Analyze to auto-save a case
        payload = {
            "type": "url",
            "content": "https://bca-klik-secure-fake.xyz"
        }
        res_analyze = self.client.post("/api/analyze", json=payload)
        self.assertEqual(res_analyze.status_code, 200)
        case_id = res_analyze.json()["case_id"]

        # 2. List cases
        res_list = self.client.get("/api/cases")
        self.assertEqual(res_list.status_code, 200)
        cases = res_list.json()
        self.assertGreaterEqual(len(cases), 1)

        # 3. Get single case
        res_get = self.client.get(f"/api/cases/{case_id}")
        self.assertEqual(res_get.status_code, 200)
        single_case = res_get.json()
        self.assertEqual(single_case["case_id"], case_id)
        self.assertEqual(single_case["evidence_type"], "url")

    def test_telegram_webhook(self):
        payload = {
            "update_id": 1001,
            "message": {
                "message_id": 42,
                "chat": {"id": 998877},
                "text": "https://id-bca-verifikasi-keamanan.xyz/login"
            }
        }
        res = self.client.post("/api/webhook/telegram", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("case_id", data)
        self.assertIn("reply_text", data)
        self.assertIn("HaloBCA", data["reply_text"])

    def test_whatsapp_webhook(self):
        payload = {
            "from": "6281234567890",
            "text": "Selamat! Anda mendapat undian berhadiah klik https://bca-klaim-hadiah.xyz"
        }
        res = self.client.post("/api/webhook/whatsapp", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("case_id", data)
        self.assertIn("reply_text", data)

if __name__ == "__main__":
    unittest.main()

