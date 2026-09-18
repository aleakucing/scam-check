import unittest
from app.services.privacy import mask_sensitive_data
from app.services.url_security import validate_url_safety

class TestPrivacyAndSecurity(unittest.TestCase):

    def test_mask_phone_number(self):
        text = "Hubungi pelaku di nomor 081234567890 atau +6281987654321 sekarang."
        masked = mask_sensitive_data(text)
        self.assertNotIn("081234567890", masked)
        self.assertNotIn("+6281987654321", masked)
        self.assertIn("0812", masked)
        self.assertIn("****", masked)

    def test_mask_credit_card(self):
        text = "Pelaku meminta kartu kredit: 4111 2222 3333 4444 untuk verifikasi."
        masked = mask_sensitive_data(text)
        self.assertNotIn("2222", masked)
        self.assertNotIn("3333", masked)
        self.assertIn("4111", masked)
        self.assertIn("4444", masked)

    def test_mask_otp_code(self):
        text = "Jangan berikan kode OTP: 839201 kepada siapa pun."
        masked = mask_sensitive_data(text)
        self.assertNotIn("839201", masked)
        self.assertIn("OTP: ******", masked)

    def test_ssrf_blocking_localhost(self):
        safe, msg = validate_url_safety("http://localhost:8000/api/secret")
        self.assertFalse(safe)
        self.assertIn("localhost", msg.lower())

        safe_ip, msg_ip = validate_url_safety("http://127.0.0.1:5000")
        self.assertFalse(safe_ip)

    def test_ssrf_blocking_cloud_metadata(self):
        safe, msg = validate_url_safety("http://169.254.169.254/latest/meta-data/")
        self.assertFalse(safe)
        self.assertIn("metadata", msg.lower())

    def test_ssrf_blocking_private_ip(self):
        safe, msg = validate_url_safety("http://192.168.1.100/admin")
        self.assertFalse(safe)
        self.assertIn("privat", msg.lower())

    def test_legit_url_allowed(self):
        safe, msg = validate_url_safety("https://idwebhost.com/domain-murah")
        self.assertTrue(safe)

        safe_bca, _ = validate_url_safety("https://www.bca.co.id/id/individu")
        self.assertTrue(safe_bca)

if __name__ == "__main__":
    unittest.main()
