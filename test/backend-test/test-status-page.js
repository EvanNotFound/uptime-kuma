const { describe, test, mock } = require("node:test");
const assert = require("node:assert");
const StatusPage = require("../../server/model/status_page");
const { statusPageSocketHandler } = require("../../server/socket-handlers/status-page-socket-handler");
const { R } = require("redbean-node");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const {
    STATUS_PAGE_ALL_UP,
    STATUS_PAGE_ALL_DOWN,
    STATUS_PAGE_PARTIAL_DOWN,
    STATUS_PAGE_MAINTENANCE,
    UP,
    DOWN,
    PENDING,
    MAINTENANCE,
} = require("../../src/util");

dayjs.extend(utc);

describe("StatusPage", () => {
    describe("getStatusDescription()", () => {
        test("returns 'No Services' when status is -1", () => {
            const description = StatusPage.getStatusDescription(-1);
            assert.strictEqual(description, "No Services");
        });

        test("returns 'All Systems Operational' when all services are up", () => {
            const description = StatusPage.getStatusDescription(STATUS_PAGE_ALL_UP);
            assert.strictEqual(description, "All Systems Operational");
        });

        test("returns 'Partially Degraded Service' when some services are down", () => {
            const description = StatusPage.getStatusDescription(STATUS_PAGE_PARTIAL_DOWN);
            assert.strictEqual(description, "Partially Degraded Service");
        });

        test("returns 'Degraded Service' when all services are down", () => {
            const description = StatusPage.getStatusDescription(STATUS_PAGE_ALL_DOWN);
            assert.strictEqual(description, "Degraded Service");
        });

        test("returns 'Under maintenance' when status page is in maintenance", () => {
            const description = StatusPage.getStatusDescription(STATUS_PAGE_MAINTENANCE);
            assert.strictEqual(description, "Under maintenance");
        });

        test("returns '?' for unknown status values", () => {
            const description = StatusPage.getStatusDescription(999);
            assert.strictEqual(description, "?");
        });
    });

    describe("getSummaryStatusIndicator()", () => {
        test("maps overall statuses to Statuspage-style indicators", () => {
            assert.strictEqual(StatusPage.getSummaryStatusIndicator(STATUS_PAGE_ALL_UP), "none");
            assert.strictEqual(StatusPage.getSummaryStatusIndicator(STATUS_PAGE_PARTIAL_DOWN), "minor");
            assert.strictEqual(StatusPage.getSummaryStatusIndicator(STATUS_PAGE_ALL_DOWN), "critical");
            assert.strictEqual(StatusPage.getSummaryStatusIndicator(STATUS_PAGE_MAINTENANCE), "maintenance");
            assert.strictEqual(StatusPage.getSummaryStatusIndicator(-1), "none");
        });
    });

    describe("getSummaryComponentStatus()", () => {
        test("maps monitor statuses to Statuspage-style component statuses", () => {
            assert.strictEqual(StatusPage.getSummaryComponentStatus(UP), "operational");
            assert.strictEqual(StatusPage.getSummaryComponentStatus(DOWN), "major_outage");
            assert.strictEqual(StatusPage.getSummaryComponentStatus(PENDING), "degraded_performance");
            assert.strictEqual(StatusPage.getSummaryComponentStatus(MAINTENANCE), "under_maintenance");
            assert.strictEqual(StatusPage.getSummaryComponentStatus(undefined), "major_outage");
        });
    });

    describe("getStatusPageSummary()", () => {
        test("returns public display names and omits private monitor names", async () => {
            const statusPage = {
                id: 10,
                slug: "example",
                title: "Example Status",
                show_tags: false,
                toPublicJSON: async () => ({
                    showCertificateExpiry: false,
                }),
            };
            const group = {
                id: 20,
                getMonitorList: async () => [
                    {
                        id: 30,
                        name: "Private Origin",
                        created_date: "2026-05-01 10:00:00",
                        toPublicJSON: async () => ({
                            id: 30,
                            name: "Public Service",
                        }),
                    },
                ],
            };

            mock.method(R, "find", async (model) => {
                if (model === "incident") {
                    return [
                        {
                            toPublicJSON: () => ({
                                id: 1,
                                title: "Incident",
                            }),
                        },
                    ];
                }

                if (model === "group") {
                    return [group];
                }

                return [];
            });
            mock.method(R, "findOne", async () => ({
                status: UP,
                time: "2026-05-01 10:05:00",
                ping: 42,
                toPublicJSON: () => ({
                    status: UP,
                    time: "2026-05-01 10:05:00",
                    ping: 42,
                }),
            }));
            mock.method(StatusPage, "getMaintenanceList", async () => [
                {
                    id: 2,
                    title: "Maintenance",
                },
            ]);

            try {
                const summary = await StatusPage.getStatusPageSummary(statusPage);
                const serialized = JSON.stringify(summary);

                assert.deepStrictEqual(Object.keys(summary), [
                    "page",
                    "components",
                    "incidents",
                    "scheduled_maintenances",
                    "status",
                ]);
                assert.strictEqual(summary.page.id, "example");
                assert.strictEqual(summary.page.name, "Example Status");
                assert.strictEqual(summary.page.url, "/status/example");
                assert.strictEqual(summary.components[0].id, "30");
                assert.strictEqual(summary.components[0].name, "Public Service");
                assert.strictEqual(summary.components[0].status, "operational");
                assert.strictEqual(summary.components[0].group_id, "20");
                assert.strictEqual(summary.components[0].page_id, "example");
                assert.strictEqual(summary.status.indicator, "none");
                assert.strictEqual(summary.status.description, "All Systems Operational");
                assert.ok(serialized.includes("Public Service"));
                assert.strictEqual(serialized.includes("Private Origin"), false);
            } finally {
                mock.restoreAll();
            }
        });
    });

    describe("renderRSS()", () => {
        const MOCK_FEED_URL = "http://localhost:3001/status/test";

        test("pubDate uses UTC timezone for heartbeat.time without timezone info", async () => {
            const mockStatusPage = {
                title: "Test Status Page",
            };

            const mockHeartbeats = [
                {
                    name: "Test Monitor",
                    monitorID: 1,
                    time: "2026-01-24 13:16:25.400",
                },
            ];

            mock.method(StatusPage, "getRSSPageData", async () => ({
                heartbeats: mockHeartbeats,
                statusDescription: "All Systems Operational",
            }));

            try {
                const rss = await StatusPage.renderRSS(mockStatusPage, MOCK_FEED_URL);

                assert.ok(rss.includes("<pubDate>Sat, 24 Jan 2026 13:16:25 GMT</pubDate>"));
            } finally {
                mock.restoreAll();
            }
        });
    });

    describe("saveStatusPage", () => {
        test("rejects missing domainNameList before updating domain mappings", async () => {
            const updateDomainNameList = mock.fn(async () => {});
            const socket = {
                userID: 1,
                handlers: {},
                on(event, handler) {
                    this.handlers[event] = handler;
                },
            };

            statusPageSocketHandler(socket);
            const loadDomainMappingList = mock.method(StatusPage, "loadDomainMappingList", async () => {});

            mock.method(R, "findOne", async () => ({
                id: 1,
                slug: "default",
                updateDomainNameList,
            }));

            const store = mock.method(R, "store", async () => {});

            try {
                const res = await new Promise((resolve) => {
                    socket.handlers.saveStatusPage(
                        "default",
                        {
                            slug: "default",
                            title: "Default",
                            analyticsType: null,
                        },
                        "/icon.svg",
                        [],
                        resolve
                    );
                });

                assert.strictEqual(res.ok, false);
                assert.strictEqual(res.msg, "Status page domain list is not loaded.");
                assert.strictEqual(updateDomainNameList.mock.calls.length, 0);
                assert.strictEqual(loadDomainMappingList.mock.calls.length, 0);
                assert.strictEqual(store.mock.calls.length, 0);
            } finally {
                mock.restoreAll();
            }
        });

        test("passes loaded domainNameList through for mapping updates", async () => {
            const updateDomainNameList = mock.fn(async () => {});
            const socket = {
                userID: 1,
                handlers: {},
                on(event, handler) {
                    this.handlers[event] = handler;
                },
            };

            statusPageSocketHandler(socket);

            mock.method(R, "findOne", async () => ({
                id: 1,
                slug: "default",
                updateDomainNameList,
            }));
            mock.method(R, "store", async () => {});
            mock.method(R, "exec", async () => {});
            mock.method(StatusPage, "loadDomainMappingList", async () => {});

            try {
                const res = await new Promise((resolve) => {
                    socket.handlers.saveStatusPage(
                        "default",
                        {
                            slug: "default",
                            title: "Default",
                            analyticsType: null,
                            domainNameList: [],
                        },
                        "/icon.svg",
                        [],
                        resolve
                    );
                });

                assert.strictEqual(res.ok, true);
                assert.strictEqual(updateDomainNameList.mock.calls.length, 1);
                assert.deepStrictEqual(updateDomainNameList.mock.calls[0].arguments[0], []);
            } finally {
                mock.restoreAll();
            }
        });
    });
});
