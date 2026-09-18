import unittest
from app.models.schemas import AnalyzeRequest
from app.services.heuristic_analyzer import analyze_heuristic

class TestHeuristicAnalyzer(unittest.TestCase):

    def test_phishing_bca_xyz(self):
        req = AnalyzeRequest(
            type="url",
            content="https://id-bca-verifikasi-keamanan.xyz/login"
        )
        res = analyze_heuristic(req)
        self.assertGreaterEqual(res.content_risk, 75)
        self.assertEqual(res.risk_level, "VERY HIGH RISK")
        titles = [i.title for i in res.indicators]
        self.assertTrue(any("Domain Meniru" in t for t in titles))
        self.assertTrue(any("TLD" in t for t in titles))

    def test_shortener_with_apk(self):
        req = AnalyzeRequest(
            type="url",
            content="https://bit.ly/Surat-Undangan-Pernikahan-Digital.apk"
        )
        res = analyze_heuristic(req)
        self.assertGreaterEqual(res.content_risk, 80)
        titles = [i.title for i in res.indicators]
        self.assertTrue(any("Pemendek Tautan" in t for t in titles))
        self.assertTrue(any(".APK" in t for t in titles))

    def test_text_etle_apk(self):
        req = AnalyzeRequest(
            type="text",
            content="Pemberitahuan ETLE: Kendaraan Anda tertangkap kamera melanggar marka jalan. Silakan pasang Surat_Tilang_ETLE.apk berikut."
        )
        res = analyze_heuristic(req)
        self.assertGreaterEqual(res.content_risk, 75)
        titles = [i.title for i in res.indicators]
        self.assertTrue(any(".APK" in t for t in titles))

    def test_legit_idwebhost(self):
        req = AnalyzeRequest(
            type="url",
            content="https://member.idwebhost.com/clientarea.php"
        )
        res = analyze_heuristic(req)
        self.assertLessEqual(res.content_risk, 20)
        self.assertEqual(res.risk_level, "LOW RISK / SAFE")
        titles = [i.title for i in res.indicators]
        self.assertTrue(any("Resmi" in t for t in titles))

    def test_ssrf_protection_blocked(self):
        req = AnalyzeRequest(
            type="url",
            content="http://169.254.169.254/latest/meta-data/"
        )
        res = analyze_heuristic(req)
        self.assertEqual(res.content_risk, 98)
        self.assertEqual(res.risk_level, "VERY HIGH RISK")
        self.assertTrue(any("SSRF" in i.title for i in res.indicators))

if __name__ == "__main__":
    unittest.main()
