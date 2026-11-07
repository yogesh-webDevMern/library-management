import { useRef, useState } from "react";
import { uploadImage } from "../api";

// A button that opens the file picker, uploads the picture to Cloudinary and gives the url to onUrl(url).
export default function PhotoButton({ onUrl, children, className = "lb-btn lb-btn-outline lb-btn-sm", style, title = "Change picture" }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
  if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
  return setErr("Choose a JPG, PNG or WEBP picture.");
}
    if (f.size > 5 * 1024 * 1024) return setErr("Picture must be under 5 MB.");
    setBusy(true); setErr("");
try {
  const url = await uploadImage(f);

  console.log("Uploaded image URL:", url);

  await onUrl(url);

  console.log("Photo update callback completed");
} catch (x) {
  console.error("Photo upload error:", x);
  setErr(x.message || "Photo upload failed");
} finally {
  setBusy(false);
}
    setBusy(false);
  };

  return (
    <span className="inline-flex flex-col items-start">
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pick} />
      <button type="button" disabled={busy} onClick={() => ref.current.click()} className={className} style={style} title={title}>{busy ? "…" : children}</button>
      {err && <span className="text-xs lb-err mt-1 max-w-[200px]">{err}</span>}
    </span>
  );
}
