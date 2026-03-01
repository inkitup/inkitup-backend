// PayPal Configuration
// For testing and production environments

const paypalConfig = {
  mode: process.env.PAYPAL_MODE || "sandbox", // Use "live" for production
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,

  // Base URLs for API calls
  sandboxApiUrl: "https://api.sandbox.paypal.com",
  productionApiUrl: "https://api.paypal.com",

  // Get the appropriate API URL based on mode
  getApiUrl: function () {
    return this.mode === "sandbox" ? this.sandboxApiUrl : this.productionApiUrl;
  },

  // Currency code
  currency: process.env.PAYPAL_CURRENCY || "USD",
};

module.exports = paypalConfig;
