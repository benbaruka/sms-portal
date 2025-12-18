import React from "react";
import { getMessageStatusBadge, getMessageStatusLabel } from "../../src/utils/messageStatus";

describe("utils/messageStatus.tsx", () => {
  describe("getMessageStatusBadge", () => {
    it("module loads", () => {
      expect(getMessageStatusBadge).toBeDefined();
      expect(typeof getMessageStatusBadge).toBe("function");
    });

    // Tests pour les statuts numériques
    it("renders badge for status 2 (Delivered)", () => {
      const badge = getMessageStatusBadge(2);
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for status 1 (Pending)", () => {
      const badge = getMessageStatusBadge(1);
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for status 0 (Queued)", () => {
      const badge = getMessageStatusBadge(0);
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for status -1 (Failed)", () => {
      const badge = getMessageStatusBadge(-1);
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for status 3 (Failed)", () => {
      const badge = getMessageStatusBadge(3);
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for status 401 (Insufficient Balance)", () => {
      const badge = getMessageStatusBadge(401);
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for unknown numeric status", () => {
      const badge = getMessageStatusBadge(999);
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    // Tests pour les statuts string
    it("renders badge for 'delivered' status", () => {
      const badge = getMessageStatusBadge("delivered");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for 'success' status", () => {
      const badge = getMessageStatusBadge("success");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for 'successful' status", () => {
      const badge = getMessageStatusBadge("successful");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for 'send' status", () => {
      const badge = getMessageStatusBadge("send");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for 'pending' status", () => {
      const badge = getMessageStatusBadge("pending");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for 'processing' status", () => {
      const badge = getMessageStatusBadge("processing");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for 'queued' status", () => {
      const badge = getMessageStatusBadge("queued");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for 'failed' status", () => {
      const badge = getMessageStatusBadge("failed");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for 'error' status", () => {
      const badge = getMessageStatusBadge("error");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for 'sending_failed' status", () => {
      const badge = getMessageStatusBadge("sending_failed");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for 'insufficient_balance' status", () => {
      const badge = getMessageStatusBadge("insufficient_balance");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for 'insufficient_credits' status", () => {
      const badge = getMessageStatusBadge("insufficient_credits");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("renders badge for unknown string status", () => {
      const badge = getMessageStatusBadge("unknown_status");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    // Tests pour les cas limites
    it("handles null status", () => {
      const badge = getMessageStatusBadge(null);
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("handles undefined status", () => {
      const badge = getMessageStatusBadge(undefined);
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("handles empty string status", () => {
      const badge = getMessageStatusBadge("");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("handles numeric string that parses to number", () => {
      const badge = getMessageStatusBadge("2");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("handles string with whitespace that parses to number", () => {
      const badge = getMessageStatusBadge(" 1 ");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
    });

    it("applies custom className", () => {
      const badge = getMessageStatusBadge(2, "custom-class");
      expect(React.isValidElement(badge)).toBe(true);
      expect(badge.type).toBeDefined();
      expect(badge.props.className).toContain("custom-class");
    });
  });

  describe("getMessageStatusLabel", () => {
    it("exports getMessageStatusLabel function", () => {
      expect(getMessageStatusLabel).toBeDefined();
      expect(typeof getMessageStatusLabel).toBe("function");
    });

    // Tests pour les statuts numériques
    it("returns 'Delivered' for status 2", () => {
      expect(getMessageStatusLabel(2)).toBe("Delivered");
    });

    it("returns 'Pending' for status 1", () => {
      expect(getMessageStatusLabel(1)).toBe("Pending");
    });

    it("returns 'Queued' for status 0", () => {
      expect(getMessageStatusLabel(0)).toBe("Queued");
    });

    it("returns 'Failed' for status -1", () => {
      expect(getMessageStatusLabel(-1)).toBe("Failed");
    });

    it("returns 'Insufficient Balance' for status 401", () => {
      expect(getMessageStatusLabel(401)).toBe("Insufficient Balance");
    });

    it("returns formatted status for unknown numeric status", () => {
      expect(getMessageStatusLabel(999)).toBe("Status: 999");
    });

    // Tests pour les statuts string
    it("returns 'Delivered' for 'delivered'", () => {
      expect(getMessageStatusLabel("delivered")).toBe("Delivered");
    });

    it("returns 'Delivered' for 'success'", () => {
      expect(getMessageStatusLabel("success")).toBe("Delivered");
    });

    it("returns 'Delivered' for 'successful'", () => {
      expect(getMessageStatusLabel("successful")).toBe("Delivered");
    });

    it("returns 'Delivered' for 'send'", () => {
      expect(getMessageStatusLabel("send")).toBe("Delivered");
    });

    it("returns 'Pending' for 'pending'", () => {
      expect(getMessageStatusLabel("pending")).toBe("Pending");
    });

    it("returns 'Pending' for 'processing'", () => {
      expect(getMessageStatusLabel("processing")).toBe("Pending");
    });

    it("returns 'Queued' for 'queued'", () => {
      expect(getMessageStatusLabel("queued")).toBe("Queued");
    });

    it("returns 'Failed' for 'failed'", () => {
      expect(getMessageStatusLabel("failed")).toBe("Failed");
    });

    it("returns 'Failed' for 'error'", () => {
      expect(getMessageStatusLabel("error")).toBe("Failed");
    });

    it("returns 'Failed' for 'sending_failed'", () => {
      expect(getMessageStatusLabel("sending_failed")).toBe("Failed");
    });

    it("returns 'Insufficient Balance' for 'insufficient_balance'", () => {
      expect(getMessageStatusLabel("insufficient_balance")).toBe("Insufficient Balance");
    });

    it("returns 'Insufficient Balance' for 'insufficient_credits'", () => {
      expect(getMessageStatusLabel("insufficient_credits")).toBe("Insufficient Balance");
    });

    it("returns the status string for unknown string status", () => {
      expect(getMessageStatusLabel("unknown_status")).toBe("unknown_status");
    });

    // Tests pour les cas limites
    it("returns 'Unknown' for null status", () => {
      expect(getMessageStatusLabel(null)).toBe("Unknown");
    });

    it("returns 'Unknown' for undefined status", () => {
      expect(getMessageStatusLabel(undefined)).toBe("Unknown");
    });

    it("returns 'Unknown' for empty string status", () => {
      expect(getMessageStatusLabel("")).toBe("Unknown");
    });

    it("handles numeric string that parses to number", () => {
      expect(getMessageStatusLabel("2")).toBe("Delivered");
    });

    it("handles string with whitespace that parses to number", () => {
      // String " 1 " trims to "1" which parses to 1, so returns "Pending"
      expect(getMessageStatusLabel(" 1 ")).toBe("Pending");
    });
  });
});
