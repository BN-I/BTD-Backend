// Central directory of all transactional email templates. Add new emails
// here first, then reference them by key via sendEmail({ template: "..." })
// instead of hardcoding a filename at the call site.
export const EmailTemplates = {
  forgotPasswordOTP: "forgotPasswordOTP.html",
  accountApproved: "accountApproved.html",
  vendorSignupPending: "vendorSignupPending.html",
  orderReceived: "orderReceived.html",
  productReviewedVendor: "productReviewedVendor.html",
  productReviewedAdmin: "productReviewedAdmin.html",
  reviewReported: "reviewReported.html",
  reviewStatusUpdated: "reviewStatusUpdated.html",
  payoutRequestedVendor: "payoutRequestedVendor.html",
  payoutRequestedAdmin: "payoutRequestedAdmin.html",
  payoutDispatchedVendor: "payoutDispatchedVendor.html",
  payoutDispatchedAdmin: "payoutDispatchedAdmin.html",
} as const;

export type EmailTemplateKey = keyof typeof EmailTemplates;
