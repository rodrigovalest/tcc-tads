import matchService from "../../services/match-service";
import api from "../../api";
import IMatchHistoryResponse from "../../models/responses/match-history-response";

jest.mock("../../api");

describe("matchService", () => {
  const mockedApi = api as jest.Mocked<typeof api>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getMatchHistory_withValidData_ReturnsMatchHistoryListSuccessfully", async () => {
    const mockData: IMatchHistoryResponse[] = [
      {
        id: "1",
        startTime: "2025-08-01T12:00:00Z",
        endTime: "2025-08-01T12:30:00Z",
        mode: 'just-chilling',
        format: "duo",
        language: "en",
        status: "COMPLETED",
        users: [
          { id: 1, username: "alice", nationality: "br", photoUri: null },
          { id: 2, username: "bob", nationality: "br", photoUri: "http://blablablableblebleblublublu.com" },
        ],
      },
    ];

    mockedApi.get.mockResolvedValueOnce({ data: mockData });

    const result = await matchService.getMatchHistory();

    expect(api.get).toHaveBeenCalledWith("/matches");
    expect(result).toEqual(mockData);
  });

  it("getMatchHistory_WithSomeError_ThrowsError", async () => {
    mockedApi.get.mockRejectedValueOnce(new Error("Network error"));

    await expect(matchService.getMatchHistory()).rejects.toThrow("Network error");
    expect(api.get).toHaveBeenCalledWith("/matches");
  });
});
