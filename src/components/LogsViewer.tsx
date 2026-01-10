import React, { useState, useEffect, useCallback } from "react";

interface Log {
  id: string;
  result: "WIN" | "LOSS";
  level_number: number;
  duration_seconds: number;
  created_at: string;
}

interface LogsViewerProps {
  apiBase: string;
  password: string;
}

export const LogsViewer: React.FC<LogsViewerProps> = ({
  apiBase,
  password,
}) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchLogs = useCallback(
    async (currentOffset: number) => {
      if (!password) return;
      setLoading(true);
      try {
        const url = new URL(`${apiBase}/api/logs`);
        url.searchParams.append("masterPassword", password);
        url.searchParams.append("limit", "5");
        url.searchParams.append("offset", currentOffset.toString());

        const res = await fetch(url.toString());
        const json = await res.json();

        if (json.success && json.data) {
          if (currentOffset === 0) {
            setLogs(json.data.logs);
          } else {
            setLogs((prev) => [...prev, ...json.data.logs]);
          }
          setTotal(json.data.total);
        }
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    },
    [apiBase, password]
  );

  // Initial load
  useEffect(() => {
    fetchLogs(0);
  }, [fetchLogs]);

  const handleLoadMore = () => {
    const nextOffset = offset + 5;
    setOffset(nextOffset);
    fetchLogs(nextOffset);
  };

  const formatDuration = (seconds: number) => {
    // If seconds is undefined/null, handle gracefully
    if (typeof seconds !== "number") return "-";
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(0).padStart(2, "0");
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (!hasFetched && loading) {
    return (
      <div className="p-8 text-center text-slate-400">Loading logs...</div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-8 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-slate-100 font-bold text-xl tracking-tight">
          Recent Attempts
        </h3>
        <button
          onClick={() => {
            setOffset(0);
            fetchLogs(0);
          }}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/50 uppercase tracking-wider text-xs font-semibold text-slate-400">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Time</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3 rounded-r-lg">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.result === "WIN"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {log.level_number}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono">
                    {formatDuration(log.duration_seconds)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {logs.length < total && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};
