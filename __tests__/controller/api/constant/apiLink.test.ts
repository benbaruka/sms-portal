import * as apiLink from "../../../../src/controller/api/constant/apiLink";

describe("controller/api/constant/apiLink.ts", () => {
  it("module loads", () => {
    expect(apiLink).toBeTruthy();
  });

  it("exports auth endpoints", () => {
    expect(apiLink.auth).toBeDefined();
    expect(apiLink.auth.login).toBeDefined();
    expect(apiLink.auth.signup).toBeDefined();
  });

  it("exports admin endpoints", () => {
    expect(apiLink.admin).toBeDefined();
    expect(apiLink.admin.clients).toBeDefined();
  });

  it("exports client endpoints", () => {
    expect(apiLink.client).toBeDefined();
  });

  it("exports connectors endpoints", () => {
    expect(apiLink.connectors).toBeDefined();
    expect(typeof apiLink.connectors.getAll).toBe("string");
  });

  it("connectors.getById returns correct path", () => {
    const path = apiLink.connectors.getById(123);
    expect(path).toBe("/connector/123/view");
  });

  it("connectors.delete returns correct path", () => {
    const path = apiLink.connectors.delete(456);
    expect(path).toBe("/connector/456/delete");
  });

  it("exports all auth endpoints", () => {
    expect(apiLink.auth.login).toBe("/auth/user/login");
    expect(apiLink.auth.signup).toBe("/auth/signup");
    expect(apiLink.auth.gen).toBe("/auth/api-key");
    expect(apiLink.auth.forgotPassword).toBe("/auth/user/password/forgot");
    expect(apiLink.auth.resetPassword).toBe("/auth/user/password/reset");
    expect(apiLink.auth.verifyOtp).toBe("/auth/verify-otp");
    expect(apiLink.auth.resendOtp).toBe("/auth/resend-otp");
    expect(apiLink.auth.changePassword).toBe("/auth/user/password/change");
  });

  it("exports dashboard endpoints with functions", () => {
    expect(apiLink.dashboard.summary).toBe("/dashboard/summary");
    expect(apiLink.dashboard.messageSent("transactional")).toBe(
      "/dashboard/message/sent/transactional"
    );
    expect(apiLink.dashboard.messageGraph("promotional")).toBe(
      "/dashboard/message/sent/promotional/graph"
    );
    expect(apiLink.dashboard.messageNetworkGraph("bulk")).toBe(
      "/dashboard/message/sent/bulk/network/graph"
    );
    expect(apiLink.dashboard.scheduledMessages).toBe("/dashboard/message/scheduled");
    expect(apiLink.dashboard.billingStats).toBe("/dashboard/billing-stats");
    expect(apiLink.dashboard.clients).toBe("/admin/dashboard/api-billing/clients");
    expect(apiLink.dashboard.clientReports("transactional")).toBe(
      "/client/reports/sms/transactional"
    );
  });

  it("exports messages endpoints", () => {
    expect(apiLink.messages.sendTransactional).toBe("/message/send/transactional");
    expect(apiLink.messages.sendPromotional).toBe("/message/send/promotional");
    expect(apiLink.messages.sendBulkMsisdn).toBe("/message/send/bulk-msisdn");
    expect(apiLink.messages.sendContactGroup).toBe("/message/send/contact-group");
    expect(apiLink.messages.sendUploadFile).toBe("/message/send/upload-file");
    expect(apiLink.messages.bulkDetails("123")).toBe("/message/bulk/123/view");
  });

  it("exports senders endpoints with functions", () => {
    expect(apiLink.senders.getClientSenderIdsList).toBe("/client/senderid/view/table");
    expect(apiLink.senders.updateSender(123)).toBe("/configuration/sender/123/update");
    expect(apiLink.senders.deleteSender(456)).toBe("/configuration/sender/456/delete");
    expect(apiLink.senders.addConnector(789)).toBe("/configuration/sender/789/add-connector");
    expect(apiLink.senders.removeConnector(101)).toBe("/configuration/sender/101/remove-connector");
  });

  it("exports admin clients endpoints", () => {
    expect(apiLink.adminClients.list).toBe("/client/all");
    expect(apiLink.adminClients.create).toBe("/client/create");
    expect(apiLink.adminClients.update).toBe("/client/update");
    expect(apiLink.adminClients.changeStatus).toBe("/client/status");
    expect(apiLink.adminClients.table).toBe("/client/table");
  });

  it("exports admin roles endpoints", () => {
    expect(apiLink.adminRoles.list).toBe("/admin/role/all");
    expect(apiLink.adminRoles.create).toBe("/admin/role/create");
    expect(apiLink.adminRoles.update).toBe("/admin/role/update");
    expect(apiLink.adminRoles.assignPermission).toBe("/admin/role/assign");
    expect(apiLink.adminRoles.revokePermission).toBe("/admin/role/revoke");
  });

  it("exports contacts endpoints", () => {
    expect(apiLink.contacts.create).toBe("/contact/create");
    expect(apiLink.contacts.upload).toBe("/contact/upload");
    expect(apiLink.contacts.groupList).toBe("/contact/group/list");
    expect(apiLink.contacts.group).toBe("/contact/group");
  });

  it("exports topup endpoints", () => {
    expect(apiLink.topup.mnoProviders).toBe("/mno/providers");
    expect(apiLink.topup.mnoSelfTopup).toBe("/client/self/topup");
    expect(apiLink.topup.clientBalance).toBe("/client/balance");
    expect(apiLink.topup.createManualTopup).toBe("/admin/topup/request");
  });

  it("exports notifications endpoints", () => {
    expect(apiLink.notifications.list).toBe("/notifications/list");
    expect(apiLink.notifications.markAsRead).toBe("/notifications/mark-read");
    expect(apiLink.notifications.markAllAsRead).toBe("/notifications/mark-all-read");
    expect(apiLink.notifications.delete).toBe("/notifications/delete");
  });

  it("exports documents endpoints", () => {
    expect(apiLink.documents.getActiveTypes).toBe("/document-types/active");
    expect(apiLink.documents.generateUploadUrl).toBe("/documents/upload-url");
    expect(apiLink.documents.create).toBe("/client/documents/create");
    expect(apiLink.documents.myDocuments).toBe("/client/documents/my-documents");
  });

  it("exports admin documents endpoints", () => {
    expect(apiLink.adminDocuments.list).toBe("/admin/client/documents/by-client");
    expect(apiLink.adminDocuments.types).toBe("/admin/document-types/all");
    expect(apiLink.adminDocuments.createType).toBe("/admin/document-types/create");
    expect(apiLink.adminDocuments.getType).toBe("/admin/document-types/view");
  });

  it("exports admin kyb endpoints", () => {
    expect(apiLink.adminKyb.pending).toBe("/admin/kyb/clients");
    expect(apiLink.adminKyb.history).toBe("/admin/kyb/history");
    expect(apiLink.adminKyb.approve).toBe("/admin/kyb/approve");
    expect(apiLink.adminKyb.reject).toBe("/admin/kyb/reject");
  });

  it("exports client users endpoints", () => {
    expect(apiLink.clientUsers.list).toBe("/client/user");
    expect(apiLink.clientUsers.create).toBe("/client/user/create");
    expect(apiLink.clientUsers.update).toBe("/client/user/update");
    expect(apiLink.clientUsers.table).toBe("/client/user/table");
  });

  it("exports client tokens endpoints", () => {
    expect(apiLink.clientTokens.createLive).toBe("/client/tokens/create-live");
    expect(apiLink.clientTokens.delete).toBe("/client/tokens/delete");
    expect(apiLink.clientTokens.list).toBe("/client/tokens/list");
    expect(apiLink.clientTokens.kybStatus).toBe("/client/kyb/status");
  });

  it("exports admin pricing endpoints", () => {
    expect(apiLink.adminPricing.configActive).toBe("/admin/pricing/config/active");
    expect(apiLink.adminPricing.configUpdate).toBe("/admin/pricing/config/update");
    expect(apiLink.adminPricing.tiersList).toBe("/admin/pricing/tiers/list");
    expect(apiLink.adminPricing.tiersCreate).toBe("/admin/pricing/tiers/create");
  });

  it("exports admin benefit endpoints", () => {
    expect(apiLink.adminBenefit.graph).toBe("/admin/benefit/graph");
    expect(apiLink.adminBenefit.byTier).toBe("/admin/benefit/by-tier");
    expect(apiLink.adminBenefit.byClient).toBe("/admin/benefit/by-client");
    expect(apiLink.adminBenefit.details).toBe("/admin/benefit/details");
  });

  it("exports apiLink object with all main categories", () => {
    expect(apiLink.apiLink).toBeDefined();
    expect(apiLink.apiLink.auth).toBeDefined();
    expect(apiLink.apiLink.admin).toBeDefined();
    expect(apiLink.apiLink.client).toBeDefined();
    expect(apiLink.apiLink.connectors).toBeDefined();
  });
});
