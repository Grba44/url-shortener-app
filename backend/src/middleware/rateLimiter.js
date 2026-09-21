const limiterMap = new Map();

const cleanupExpiredEntries = () => {
  const now = Date.now();

  for (const [key, value] of limiterMap) {
    if (now > value.expiredAt) {
      limiterMap.delete(key);
    }
  }
};

setInterval(cleanupExpiredEntries, 30 * 60 * 1000);

const verifyCaptcha = async (token) => {
  const params = new URLSearchParams();
  params.append("secret", process.env.HCAPTCHA_SECRET);
  params.append("response", token);

  const res = await fetch("https://api.hcaptcha.com/siteverify", {
    method: "POST",
    body: params,
  });

  const { success } = await res.json();

  return success;
};

export const emailRateLimit = async (req, res, next) => {
  const { email } = req.body;
  const user = limiterMap.get(email);

  if (user && user.count > 3 && Date.now() < user.expiredAt) {
    try {
      const isHuman = await verifyCaptcha(req.body.captchaToken);
      if (isHuman === undefined) {
        console.warn(
          "Captcha service returned malformed response, failing open.",
        );
      }
      if (!isHuman) {
        return res
          .status(429)
          .json({ message: "Failed captcha verification." });
      }
      user.count = 0;
      user.expiredAt = Date.now() + 15 * 60 * 1000;
    } catch (error) {
      console.warn("Captcha service unreachable, failing open:", error.message);
    }
  }

  res.on("finish", () => {
    if (res.statusCode === 200) return;
    if (user) {
      if (Date.now() > user.expiredAt) {
        user.count = 1;
        user.expiredAt = Date.now() + 15 * 60 * 1000;
      } else {
        user.count += 1;
      }
    } else {
      limiterMap.set(email, {
        count: 1,
        expiredAt: Date.now() + 15 * 60 * 1000,
      });
    }
  });
  next();
};
