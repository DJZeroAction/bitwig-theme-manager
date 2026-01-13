import type { UpdateInfo } from "../api/bitwig";

interface UpdateNotificationProps {
  updateInfo: UpdateInfo;
  installing: boolean;
  onInstall: () => void;
  onDismiss: () => void;
  onSkipVersion: () => void;
}

export function UpdateNotification({
  updateInfo,
  installing,
  onInstall,
  onDismiss,
  onSkipVersion,
}: UpdateNotificationProps) {
  return (
    <div className="bg-purple-900/80 border-b border-purple-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
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
          <div>
            <span className="text-sm text-white">
              <strong>Update available:</strong> v{updateInfo.version}
              <span className="text-purple-300 ml-2">
                (current: v{updateInfo.current_version})
              </span>
            </span>
            {updateInfo.body && (
              <p className="text-xs text-purple-300 mt-0.5 line-clamp-1">
                {updateInfo.body.split("\n")[0]}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onInstall}
            disabled={installing}
            className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
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
                Installing...
              </span>
            ) : (
              "Update Now"
            )}
          </button>
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
        </div>
      </div>
    </div>
  );
}
