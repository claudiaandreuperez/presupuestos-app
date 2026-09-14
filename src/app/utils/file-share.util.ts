export type ShareResult = 'shared' | 'downloaded';

export function canShareFiles(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    'canShare' in navigator
  );
}

export async function downloadOrShare(
  content: string,
  filename: string,
  mimeType: string,
): Promise<ShareResult> {
  const blob = new Blob([content], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });

  if (canShareFiles()) {
    const shareData: ShareData = { files: [file], title: filename };

    if (navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return 'shared';
    }
  }

  downloadBlob(blob, filename);
  return 'downloaded';
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
