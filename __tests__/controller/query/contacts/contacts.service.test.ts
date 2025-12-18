import axios from "axios";

import {
  createContact,
  getContactGroupList,
} from "../../../../src/controller/query/contacts/contacts.service";

jest.mock("@/controller/api/config/smsApiConfig", () => ({
  smsBaseURL: "https://api.test.com",
}));

jest.mock("axios");
jest.mock("@/controller/api/constant/apiLink", () => ({
  contacts: {
    create: "/contacts/create",
    list: "/contacts/groups",
  },
}));

describe("controller/query/contacts/contacts.service.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("module loads", () => {
    expect(createContact).toBeDefined();
    expect(getContactGroupList).toBeDefined();
  });

  it("exports expected functions", async () => {
    const module = await import("../../../../src/controller/query/contacts/contacts.service");
    const exports = Object.keys(module);
    expect(exports.length).toBeGreaterThan(0);
  });

  it("createContact - makes API call", async () => {
    const mockData = { message: { status: "success" } };
    jest.mocked(axios.post).mockResolvedValue({ data: mockData });

    const result = await createContact(
      { contact_group_id: 1, msisdn: "+1234567890", first_name: "Test" },
      "test-api-key"
    );

    expect(axios.post).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("getContactGroupList - makes API call", async () => {
    const mockData = { message: { data: [] } };
    jest.mocked(axios.post).mockResolvedValue({ data: mockData });

    const result = await getContactGroupList({ page: 1, limit: 10 }, "test-api-key");

    expect(axios.post).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
