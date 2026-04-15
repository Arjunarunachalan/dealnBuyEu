export const countryGateway = (req, res, next) => {
  const countryCode = req.headers["x-country-code"];

  if (!countryCode) {
    return res.status(400).json({
      success: false,
      message: "Missing Country Context. 'x-country-code' header is profoundly required.",
    });
  }

  // Ensure uppercase two-letter standard (e.g. 'FR', 'DE')
  req.country = countryCode.toUpperCase();
  next();
};
