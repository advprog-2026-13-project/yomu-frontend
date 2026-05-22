import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as socialApi from "./api";

vi.mock("@/src/modules/auth/api", () => ({
  getToken: vi.fn(() => "fake-token"),
}));

const mockFetch = vi.fn();
const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = mockFetch;
  vi.mocked(mockFetch).mockReset();
  vi.resetModules();
});

afterEach(() => {
  global.fetch = originalFetch;
});

function mockResponse(status: number, body?: unknown) {
  mockFetch.mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body || {}),
  });
}

describe("social API", () => {
  it("createClan sends POST", async () => {
    mockResponse(201, { id: "1" });
    await socialApi.createClan({ name: "Test Clan" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/social/clans"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("getMyClan calls correct endpoint", async () => {
    mockResponse(200, { id: "1" });
    await socialApi.getMyClan();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/social/clans/me"),
      expect.any(Object)
    );
  });

  it("leaveClan sends DELETE", async () => {
    mockResponse(204);
    await socialApi.leaveClan();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/social/clans/leave"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("deleteClan sends DELETE", async () => {
    mockResponse(204);
    await socialApi.deleteClan("c-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/social/clans/c-1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("getClanById calls correct endpoint", async () => {
    mockResponse(200, { id: "1" });
    await socialApi.getClanById("c-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/social/clans/c-1"),
      expect.any(Object)
    );
  });

  it("requestToJoinClan sends POST", async () => {
    mockResponse(201, { id: "1" });
    await socialApi.requestToJoinClan("c-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/social/clans/c-1/join-requests"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("getClanJoinRequests calls correct endpoint", async () => {
    mockResponse(200, []);
    await socialApi.getClanJoinRequests("c-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/social/clans/c-1/join-requests"),
      expect.any(Object)
    );
  });

  it("approveJoinRequest sends POST", async () => {
    mockResponse(200);
    await socialApi.approveJoinRequest("c-1", "r-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/social/clans/c-1/join-requests/r-1/approve"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("rejectJoinRequest sends POST", async () => {
    mockResponse(200);
    await socialApi.rejectJoinRequest("c-1", "r-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/social/clans/c-1/join-requests/r-1/reject"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("getLeaderboard calls correct endpoint", async () => {
    mockResponse(200, []);
    await socialApi.getLeaderboard("GOLD");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/social/leaderboard?tier=GOLD"),
      expect.any(Object)
    );
  });

  it("adminGetClans calls correct endpoint", async () => {
    mockResponse(200, []);
    await socialApi.adminGetClans();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/social/clans"),
      expect.any(Object)
    );
  });

  it("adminGetClanMembers calls correct endpoint", async () => {
    mockResponse(200, []);
    await socialApi.adminGetClanMembers("c-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/social/clans/c-1/members"),
      expect.any(Object)
    );
  });

  it("adminRemoveMember sends DELETE", async () => {
    mockResponse(204);
    await socialApi.adminRemoveMember("c-1", "u-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/social/clans/c-1/members/u-1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("adminDeleteClan sends DELETE", async () => {
    mockResponse(204);
    await socialApi.adminDeleteClan("c-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/social/clans/c-1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("adminGetJoinRequests calls correct endpoint", async () => {
    mockResponse(200, []);
    await socialApi.adminGetJoinRequests();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/social/join-requests"),
      expect.any(Object)
    );
  });

  it("endSeason sends POST", async () => {
    mockResponse(200);
    await socialApi.endSeason();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/social/seasons/end"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("throws on error response", async () => {
    mockResponse(403, { message: "Forbidden" });
    await expect(socialApi.getMyClan()).rejects.toThrow("Forbidden");
  });
});
