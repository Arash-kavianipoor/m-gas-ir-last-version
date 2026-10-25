/**
 * Utility for robust cross-browser and iframe-safe file downloads.
 * Uses direct static asset URLs as primary with fallback to API endpoints.
 */

export function triggerFileDownload(url: string, filename: string, e?: React.MouseEvent) {
  if (e) {
    e.preventDefault();
  }

  // Create temporary link and click it
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', filename);
  anchor.setAttribute('rel', 'noopener noreferrer');
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup after click
  setTimeout(() => {
    if (document.body.contains(anchor)) {
      document.body.removeChild(anchor);
    }
  }, 200);
}
