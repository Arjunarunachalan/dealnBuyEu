import { SUPPORTED_COUNTRIES } from "../config/countryConfig.js";

export const countryGateway = (req, res, next) => {
  const countryCode = req.headers["x-country-code"] || (req.cookies && req.cookies.country_market);

  if (!countryCode) {
    return res.status(400).json({
      success: false,
      message: "Missing Country Context. 'x-country-code' header or 'country_market' cookie is required.",
    });
  }

  const code = countryCode.toUpperCase();

  // Validate that the country is supported by our system
  if (!SUPPORTED_COUNTRIES[code]) {
    return res.status(400).json({
      success: false,
      message: `Unsupported Country: '${code}'. Market not available.`,
    });
  }

  req.country = code;
  next();
};

