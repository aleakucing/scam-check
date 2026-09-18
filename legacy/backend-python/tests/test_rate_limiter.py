import unittest
import time
from app.services.rate_limiter import SlidingWindowRateLimiter

class TestRateLimiter(unittest.TestCase):
    def setUp(self):
        # 3 requests per 2 seconds for test speed
        self.limiter = SlidingWindowRateLimiter(requests_per_minute=3, window_seconds=2)

    def test_normal_requests_allowed(self):
        client_ip = "192.168.1.100"
        self.assertTrue(self.limiter.is_allowed(client_ip))
        self.assertTrue(self.limiter.is_allowed(client_ip))
        self.assertTrue(self.limiter.is_allowed(client_ip))

    def test_rate_limit_exceeded_blocks(self):
        client_ip = "10.0.0.5"
        self.assertTrue(self.limiter.is_allowed(client_ip))
        self.assertTrue(self.limiter.is_allowed(client_ip))
        self.assertTrue(self.limiter.is_allowed(client_ip))
        # 4th request must be rejected
        self.assertFalse(self.limiter.is_allowed(client_ip))

    def test_different_ips_isolated(self):
        ip_a = "1.1.1.1"
        ip_b = "2.2.2.2"
        self.assertTrue(self.limiter.is_allowed(ip_a))
        self.assertTrue(self.limiter.is_allowed(ip_a))
        self.assertTrue(self.limiter.is_allowed(ip_a))
        self.assertFalse(self.limiter.is_allowed(ip_a))

        # ip_b should still be allowed
        self.assertTrue(self.limiter.is_allowed(ip_b))

if __name__ == "__main__":
    unittest.main()
