/** Transformations sit right after `/upload/` in Cloudinary delivery URLs. */
const UPLOAD_MARKER = "/upload/";

function isCloudinaryAssetUrl(url: string): boolean {
  try {
    return new URL(url).hostname.toLowerCase().endsWith("cloudinary.com");
  } catch {
    return false;
  }
}

/** Safe filename ending in `.pdf` for downloads. */
export function cvPdfFilename(displayNameHint: string | undefined | null): string {
  const base = (displayNameHint ?? "").trim().toLowerCase().replace(/[^\w\s.-]+/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72);
  const slug = base || "portfolio-cv";
  return /\.pdf$/i.test(slug) ? slug : `${slug}.pdf`;
}

type UploadParts = { head: string; tail: string };

function splitAfterUpload(pathname: string): UploadParts | null {
  const idx = pathname.indexOf(UPLOAD_MARKER);
  if (idx === -1) return null;
  return {
    head: pathname.slice(0, idx + UPLOAD_MARKER.length),
    tail: pathname.slice(idx + UPLOAD_MARKER.length),
  };
}

/** Remove leading `fl_*` segments so we can apply a single delivery mode. */
function stripLeadingFlSegments(tail: string): string {
  return tail.replace(/^(?:fl_[^/]+\/)+/, "");
}

function buildCloudinaryWithTransform(trimmedUrl: string, transformPiece: string): string | null {
  if (!isCloudinaryAssetUrl(trimmedUrl)) {
    return null;
  }

  let u: URL;
  try {
    u = new URL(trimmedUrl);
  } catch {
    return null;
  }

  const parts = splitAfterUpload(u.pathname);
  if (!parts) return null;

  const tail = stripLeadingFlSegments(parts.tail);
  if (tail.startsWith(`${transformPiece}/`)) {
    return trimmedUrl;
  }

  const pathname = `${parts.head}${transformPiece}/${tail}`;
  return `${u.origin}${pathname}${u.search}${u.hash}`;
}

/**
 * Inline PDF for iframe / “Preview”. Cloudinary raw PDFs default to attachment;
 * **`fl_inline`** serves them for viewing in the browser.
 */
export function resumePdfViewerUrl(assetUrl: string): string {
  const trimmed = assetUrl.trim();
  return buildCloudinaryWithTransform(trimmed, "fl_inline") ?? trimmed;
}

/**
 * Download as a real PDF file (`fl_attachment` sets Content-Disposition + filename).
 */
export function resumePdfForcedDownloadUrl(assetUrl: string, displayNameHint?: string | null): string {
  const trimmed = assetUrl.trim();
  const fname = cvPdfFilename(displayNameHint).replace(/[^a-zA-Z0-9._-]+/g, "-");
  const shortFile = fname.length > 128 ? `${fname.slice(0, 100)}.pdf` : fname;
  return buildCloudinaryWithTransform(trimmed, `fl_attachment:${shortFile}`) ?? trimmed;
}
