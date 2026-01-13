import type { UpdateInfo } from "../api/bitwig";
import type { DownloadProgress } from "../hooks/useUpdater";

interface UpdateNotificationProps {
  updateInfo: UpdateInfo;
  downloading: boolean;
  downloadProgress: DownloadProgress | null;
  readyToInstall: boolean;
  installing: boolean;
  onDownload: () => void;
  onRestart: () => void;
  onDismiss: () => void;
  onSkipVersion: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UpdateNotification({
  updateInfo,
  downloading,
  downloadProgress,
  readyToInstall,
  installing,
  onDownload,
  onRestart,
  onDismiss,
  onSkipVersion,
}: UpdateNotificationProps) {
  const progressPercent = downloadProgress?.total
    ? Math.round((downloadProgress.downloaded / downloadProgress.total) * 100)
    : null;

  return (
    <div className="bg-purple-900/80 border-b border-purple-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-purple-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>
          <div className="flex-1">
            <span className="text-sm text-white">
              {readyToInstall ? (
                <strong>Update ready to install!</strong>
              ) : (
                <>
                  <strong>Update available:</strong> v{updateInfo.version}
                  <span className="text-purple-300 ml-2">
                    (current: v{updateInfo.current_version})
                  </span>
                </>
              )}
            </span>
            {downloading && downloadProgress && (
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs text-purple-300 mb-1">
                  <span>
                    Downloading... {formatBytes(downloadProgress.downloaded)}
                    {downloadProgress.total && ` / ${formatBytes(downloadProgress.total)}`}
                  </span>
                  {progressPercent !== null && <span>({progressPercent}%)</span>}
                </div>
                <div className="w-full bg-purple-950 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: progressPercent !== null ? `${progressPercent}%` : '0%' }}
                  />
                </div>
              </div>
            )}
            {!downloading && !readyToInstall && updateInfo.body && (
              <p className="text-xs text-purple-300 mt-0.5 line-clamp-1">
                {updateInfo.body.split("\n")[0]}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {readyToInstall ? (
            <button
              onClick={onRestart}
              disabled={installing}
              className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {installing ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Restarting...
                </span>
              ) : (
                "Install Now"
              )}
            </button>
          ) : (
            <button
              onClick={onDownload}
              disabled={downloading}
              className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {downloading ? "Downloading..." : "Update Now"}
            </button>
          )}
          {!downloading && !readyToInstall && (
            <>
              <button
                onClick={onDismiss}
                className="px-3 py-1.5 text-sm bg-purple-800 hover:bg-purple-700 rounded-lg text-purple-200 transition-colors"
                title="Remind me later"
              >
                Later
              </button>
              <button
                onClick={onSkipVersion}
                className="p-1.5 text-purple-400 hover:text-purple-200 transition-colors"
                title="Skip this version"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
