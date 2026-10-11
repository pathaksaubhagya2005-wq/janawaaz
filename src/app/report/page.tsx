"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Copy,
  ImagePlus,
  Loader2,
  LocateFixed,
  MapPin,
  Mic,
  ScanSearch,
  Send,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { CityMap } from "@/components/CityMap";
import { RoutingExplainer } from "@/components/ComplaintView";
import {
  Button,
  Card,
  CategoryChip,
  Container,
  Field,
  LinkButton,
  PageHeader,
  PageLoader,
  PriorityBadge,
  StatusBadge,
  deptName,
  inputClass,
} from "@/components/ui";
import { DUPLICATE_RADIUS_M, PRIORITY_RULES, analyzeComplaint, detectedLabel } from "@/lib/ai";
import { CATEGORIES, CATEGORY_MAP, DEMO_GPS, nearestArea } from "@/lib/data";
import { useRequireRole } from "@/lib/guard";
import { useApp } from "@/lib/store";
import type { Analysis, CategoryKey, Complaint } from "@/lib/types";
import { cn, fileToDataUrl } from "@/lib/utils";
import { demoImage } from "@/lib/art";

type Stage = "form" | "analyzing" | "duplicate" | "done";


function ReportInner() {
  const allowed = useRequireRole("citizen");
  const params = useSearchParams();
  const { tr, lang, complaints, user, addComplaint, supportComplaint, mark, toast } = useApp();
  const hi = lang === "hi";

  const initialCat = params.get("category") as CategoryKey | null;
  const [category, setCategory] = useState<CategoryKey | "">(
    initialCat && CATEGORIES.some((c) => c.key === initialCat) ? initialCat : ""
  );
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [imageBusy, setImageBusy] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [locating, setLocating] = useState(false);
  const [listening, setListening] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<Stage>("form");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [result, setResult] = useState<{ complaint: Complaint; merged: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (category) mark("report_started");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, image: tr("Please choose an image file (JPG or PNG).", "कृपया इमेज फ़ाइल (JPG या PNG) चुनें।") }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, image: tr("Image is larger than 10 MB.", "इमेज 10 MB से बड़ी है।") }));
      return;
    }
    setImageBusy(true);
    try {
      setImage(await fileToDataUrl(file));
      setErrors((e) => ({ ...e, image: "" }));
      mark("image");
    } catch {
      setErrors((e) => ({ ...e, image: tr("Could not read this image. Try another file.", "यह इमेज नहीं पढ़ी जा सकी। दूसरी फ़ाइल चुनें।") }));
    } finally {
      setImageBusy(false);
    }
  };

  const useSamplePhoto = () => {
    setImage(demoImage("before", (category || "pothole") as CategoryKey));
    setErrors((e) => ({ ...e, image: "" }));
    mark("image");
  };

  const setLocation = (lat: number, lng: number, addr?: string) => {
    setCoords({ lat, lng });
    const area = nearestArea(lat, lng).name;
    setAddress(addr ?? `Near ${area}, Noida (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    setErrors((e) => ({ ...e, location: "" }));
    mark("location");
  };

  const demoLocation = () => {
    // Fallback: fixed point next to the Sector 62 school so the duplicate-detection demo works.
    setLocation(DEMO_GPS.lat, DEMO_GPS.lng, "Near Govt. Inter College, Sector 62, Noida");
    toast("info", tr("Using demo location", "डेमो स्थान का उपयोग"), tr("Sector 62, Noida (sample GPS).", "सेक्टर 62, नोएडा (नमूना GPS)।"));
  };

  const useCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast("error", tr("GPS not supported", "GPS समर्थित नहीं"), tr("Tap the map or type the address.", "नक्शे पर टैप करें या पता लिखें।"));
      return;
    }
    setLocating(true);
    // Keep listening for up to 15 s and use the most accurate fix (laptops often give a rough Wi-Fi fix first).
    let best: GeolocationPosition | null = null;
    let finished = false;
    let watchId = 0;
    let timer: ReturnType<typeof setTimeout>;

    const finish = async () => {
      if (finished) return;
      finished = true;
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timer);
      if (!best) {
        setLocating(false);
        toast("error", tr("Location failed", "स्थान नहीं मिला"), tr("Could not get a position. Turn on device location or tap the map.", "स्थिति नहीं मिली। डिवाइस लोकेशन चालू करें या नक्शे पर टैप करें।"));
        return;
      }
      const { latitude: lat, longitude: lng, accuracy } = best.coords;
      let addr: string | undefined;
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&lat=${lat}&lon=${lng}`, { signal: ctrl.signal });
        clearTimeout(t);
        const j = await r.json();
        if (j?.display_name) addr = String(j.display_name);
      } catch {
        /* address lookup is optional */
      }
      setLocation(lat, lng, addr ?? `GPS location (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
      setLocating(false);
      const m = Math.round(accuracy);
      if (accuracy > 150) {
        toast("warning", tr("Location is rough", "स्थान मोटा-मोटा है"), tr(`Accuracy about ${m} m (laptop Wi-Fi location). Edit the address, or open this site on your phone for exact GPS.`, `सटीकता लगभग ${m} मीटर (लैपटॉप का Wi-Fi स्थान)। पता सुधारें, या सटीक GPS के लिए फ़ोन पर खोलें।`));
      } else {
        toast("success", tr("Location detected", "स्थान मिल गया"), tr(`Accuracy about ${m} m.`, `सटीकता लगभग ${m} मीटर।`));
      }
    };

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!best || pos.coords.accuracy < best.coords.accuracy) best = pos;
        if (pos.coords.accuracy <= 30) finish();
      },
      (err) => {
        if (best) return;
        finished = true;
        navigator.geolocation.clearWatch(watchId);
        clearTimeout(timer);
        setLocating(false);
        const msg =
          err.code === 1
            ? tr("Location permission denied. Click the lock icon in the address bar, set Location to Allow, then refresh.", "स्थान की अनुमति नहीं मिली। एड्रेस बार के लॉक आइकन से Location को Allow करें और पेज रिफ्रेश करें।")
            : err.code === 2
            ? tr("Could not determine position. Turn on Windows/phone location services.", "स्थिति नहीं मिली। Windows/फ़ोन की लोकेशन सेवा चालू करें।")
            : tr("Location request timed out. Try again.", "स्थान का अनुरोध समय पर पूरा नहीं हुआ। दोबारा कोशिश करें।");
        toast("error", tr("Location failed", "स्थान नहीं मिला"), msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    timer = setTimeout(finish, 15000);
  };

  const recogRef = useRef<any>(null);

  const startVoice = () => {
    if (listening) {
      recogRef.current?.stop();
      return;
    }
    const SR = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
    if (!SR) {
      toast("error", tr("Voice not supported", "वॉइस समर्थित नहीं"), tr("Use Google Chrome or Edge, or type the description.", "Google Chrome या Edge उपयोग करें, या विवरण टाइप करें।"));
      return;
    }
    const rec = new SR();
    recogRef.current = rec;
    rec.lang = hi ? "hi-IN" : "en-IN";
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;
    const base = description.trim();
    let finalText = "";
    rec.onstart = () => setListening(true);
    rec.onresult = (ev: any) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) finalText += t + " ";
        else interim += t;
      }
      setDescription([base, (finalText + interim).trim()].filter(Boolean).join(" "));
      setErrors((e) => ({ ...e, description: "" }));
    };
    rec.onerror = (ev: any) => {
      const code = ev.error as string;
      if (code === "aborted") return;
      const msg =
        code === "not-allowed" || code === "service-not-allowed"
          ? tr("Microphone permission denied. Allow it in the browser's address bar and try again.", "माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र के एड्रेस बार से अनुमति दें और दोबारा कोशिश करें।")
          : code === "no-speech"
          ? tr("No speech heard. Tap the mic and speak clearly.", "कोई आवाज़ नहीं सुनी। माइक दबाकर साफ़ बोलें।")
          : code === "audio-capture"
          ? tr("No microphone found.", "माइक्रोफ़ोन नहीं मिला।")
          : tr("Voice service error (needs internet). Try again.", "वॉइस सेवा में त्रुटि (इंटरनेट चाहिए)। दोबारा कोशिश करें।");
      toast("error", tr("Voice failed", "वॉइस विफल"), msg);
    };
    rec.onend = () => setListening(false);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  useEffect(() => () => recogRef.current?.abort?.(), []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!category) e.category = tr("Choose an issue category.", "समस्या की श्रेणी चुनें।");
    if (description.trim().length < 10) e.description = tr("Please describe the problem (at least 10 characters).", "कृपया समस्या बताएँ (कम से कम 10 अक्षर)।");
    if (!coords) e.location = tr("Select the location with GPS, or tap the map.", "GPS से या नक्शे पर टैप करके स्थान चुनें।");
    else if (address.trim().length < 3) e.location = tr("Enter an address or landmark.", "पता या लैंडमार्क लिखें।");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || !coords || !category) {
      toast("error", tr("Please fix the highlighted fields", "कृपया चिह्नित फ़ील्ड सुधारें"));
      return;
    }
    setStage("analyzing");
    window.scrollTo({ top: 0, behavior: "smooth" });
    later(() => {
      const a = analyzeComplaint({
        category,
        description,
        latitude: coords.lat,
        longitude: coords.lng,
        hasImage: !!image,
        existing: complaints,
        userId: user?.id,
      });
      setAnalysis(a);
      mark("ai");
      mark("priority");
      mark("routing");
      if (a.duplicate) {
        mark("duplicate");
        setStage("duplicate");
      } else {
        finish(a, false);
      }
    }, 3200);
  };

  const finish = (a: Analysis, merge: boolean) => {
    if (!coords) return;
    if (merge && a.duplicate) {
      const existing = supportComplaint(a.duplicate.complaint.id) ?? a.duplicate.complaint;
      setResult({ complaint: existing, merged: true });
    } else {
      const c = addComplaint({
        category: a.detected,
        description: description.trim(),
        imageUrl: image,
        latitude: coords.lat,
        longitude: coords.lng,
        address: address.trim(),
        priority: a.priority,
        department: a.department,
        aiConfidence: a.confidence,
      });
      setResult({ complaint: c, merged: false });
    }
    setStage("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!allowed) return <PageLoader />;

  /* ---------------- analyzing ---------------- */
  if (stage === "analyzing") return <AnalyzingView image={image} category={category as CategoryKey} />;

  /* ---------------- duplicate ---------------- */
  if (stage === "duplicate" && analysis?.duplicate) {
    const d = analysis.duplicate;
    return (
      <Container className="max-w-3xl py-8">
        <Card className="border-amber-300 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Copy className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{tr("Possible Duplicate Found", "संभावित डुप्लिकेट मिला")}</h1>
              <p className="text-sm text-slate-500">{tr("AI duplicate check", "AI डुप्लिकेट जाँच")}</p>
            </div>
          </div>
          <p className="mt-5 rounded-xl bg-amber-50 p-4 text-base font-semibold text-amber-900">
            {tr(
              `${d.complaint.reportCount} citizens have reported a similar ${detectedLabel(analysis.detected, false).toLowerCase()} within ${DUPLICATE_RADIUS_M}m.`,
              `${d.complaint.reportCount} नागरिकों ने ${DUPLICATE_RADIUS_M} मीटर के भीतर ऐसी ही समस्या (${detectedLabel(analysis.detected, true)}) दर्ज की है।`
            )}
          </p>
          <Card className="mt-4 bg-slate-50 p-4 shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-900">#{d.complaint.complaintNumber}</span>
              <StatusBadge status={d.complaint.status} />
            </div>
            <p className="mt-2 text-sm text-slate-700">{d.complaint.description}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              {d.complaint.address} · {Math.round(d.distance)} m {tr("from your location", "आपके स्थान से")}
            </p>
          </Card>
          <p className="mt-4 text-sm text-slate-600">
            <Users className="mr-1 inline h-4 w-4 text-brand-600" />
            {tr(
              "Multiple reports of the same problem become one verified civic case, so the department acts faster and nothing is counted twice.",
              "एक ही समस्या की कई रिपोर्ट एक सत्यापित नागरिक मामला बन जाती हैं, जिससे विभाग तेज़ी से काम करता है और कुछ दोहराया नहीं जाता।"
            )}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1" onClick={() => finish(analysis, true)}>
              <CheckCircle2 className="h-5 w-5" />
              {tr("Confirm Existing Issue", "मौजूदा समस्या की पुष्टि करें")}
            </Button>
            <Button size="lg" variant="secondary" className="flex-1" onClick={() => finish(analysis, false)}>
              <Send className="h-5 w-5" />
              {tr("Submit as New Issue", "नई समस्या के रूप में जमा करें")}
            </Button>
          </div>
          <div className="mt-6">
            <AiCard analysis={analysis} />
          </div>
        </Card>
      </Container>
    );
  }

  /* ---------------- success ---------------- */
  if (stage === "done" && result) {
    const c = result.complaint;
    const rows: Array<[string, React.ReactNode]> = [
      [tr("Complaint ID", "शिकायत आईडी"), <span key="i" className="font-mono font-bold">{c.complaintNumber}</span>],
      [tr("Category", "श्रेणी"), <CategoryChip key="c" category={c.category} />],
      [tr("Location", "स्थान"), c.address],
      [tr("Priority", "प्राथमिकता"), <PriorityBadge key="p" priority={c.priority} />],
      [tr("Assigned Department", "सौंपा गया विभाग"), deptName(c.department, hi)],
      [tr("Current Status", "वर्तमान स्थिति"), <StatusBadge key="s" status={c.status} />],
    ];
    return (
      <Container className="max-w-5xl py-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="border-emerald-200 p-6 sm:p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold text-slate-900">
              {result.merged
                ? tr("Added to the existing case", "मौजूदा मामले में जोड़ा गया")
                : tr("Your complaint has been submitted successfully.", "आपकी शिकायत सफलतापूर्वक दर्ज हो गई है।")}
            </h1>
            {result.merged && (
              <p className="mt-1 text-sm text-slate-600">
                {tr(`${c.reportCount} citizens are now linked to this case.`, `अब ${c.reportCount} नागरिक इस मामले से जुड़े हैं।`)}
              </p>
            )}
            <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-right font-medium text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <LinkButton href={`/track?id=${c.complaintNumber}`} size="lg" className="flex-1" onClick={() => mark("track")}>
                {tr("Track Complaint", "शिकायत ट्रैक करें")} <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="/dashboard" size="lg" variant="secondary" className="flex-1">
                {tr("My Complaints", "मेरी शिकायतें")}
              </LinkButton>
            </div>
          </Card>
          <div className="space-y-5">
            {analysis && <AiCard analysis={analysis} />}
            <RoutingExplainer complaint={c} />
            <PriorityRulesCard active={c.priority} />
          </div>
        </div>
      </Container>
    );
  }

  /* ---------------- form ---------------- */
  return (
    <Container className="max-w-5xl py-8">
      <PageHeader
        title={tr("Report an Issue", "समस्या दर्ज करें")}
        subtitle={tr("Tell us what is wrong. AI will verify, prioritise and route it.", "बताइए क्या समस्या है। AI इसे सत्यापित, प्राथमिकता तय और रूट करेगा।")}
      />
      <form onSubmit={submit} noValidate className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <Card className="p-5">
            <Field label={tr("Issue Category", "समस्या की श्रेणी")} required error={errors.category}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label={tr("Issue Category", "समस्या की श्रेणी")}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    role="radio"
                    aria-checked={category === c.key}
                    onClick={() => {
                      setCategory(c.key);
                      setErrors((e) => ({ ...e, category: "" }));
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition",
                      category === c.key
                        ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-200"
                        : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
                    )}
                  >
                    <span className="text-xl">{c.emoji}</span>
                    {hi ? c.hi : c.en}
                  </button>
                ))}
              </div>
            </Field>
          </Card>

          <Card className="p-5">
            <Field label={tr("Description", "विवरण")} htmlFor="desc" required error={errors.description}>
              <textarea
                id="desc"
                rows={5}
                className={inputClass}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={tr("Example: Large pothole near the school gate, vehicles are swerving…", "उदाहरण: स्कूल गेट के पास बड़ा गड्ढा, गाड़ियाँ बचकर निकल रही हैं…")}
              />
            </Field>
            <button
              type="button"
              onClick={startVoice}
              aria-label={tr("Describe the problem by voice", "आवाज़ से समस्या बताएँ")}
              className={cn(
                "mt-3 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-semibold transition",
                listening ? "border-red-400 bg-red-50 text-red-700" : "border-brand-300 bg-brand-50/50 text-brand-700 hover:bg-brand-50"
              )}
            >
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-full text-white", listening ? "animate-pulse bg-red-500" : "bg-brand-600")}>
                <Mic className="h-5 w-5" />
              </span>
              {listening ? tr("Listening… tap to stop", "सुन रहा है… रोकने के लिए टैप करें") : tr("Describe the problem by voice", "आवाज़ से समस्या बताएँ")}
            </button>
            <p className="mt-1 text-xs text-slate-400">{tr("Real speech-to-text (Chrome/Edge, needs mic permission and internet). Language follows the EN/हिं toggle.", "असली स्पीच-टू-टेक्स्ट (Chrome/Edge, माइक अनुमति और इंटरनेट चाहिए)। भाषा EN/हिं टॉगल के अनुसार।")}</p>
          </Card>

          <Card className="p-5">
            <Field label={tr("Upload Evidence", "सबूत अपलोड करें")} error={errors.image} hint={tr("JPG or PNG, up to 10 MB", "JPG या PNG, अधिकतम 10 MB")}>
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" id="photo" onChange={(e) => onFile(e.target.files?.[0])} />
              {image ? (
                <div className="relative overflow-hidden rounded-xl border border-slate-200">
                  <Preview src={image} />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(undefined);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-red-600 shadow"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {tr("Remove", "हटाएँ")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label
                    htmlFor="photo"
                    className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-600 hover:border-brand-400"
                  >
                    {imageBusy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6 text-brand-600" />}
                    {tr("Tap to choose a photo", "फोटो चुनने के लिए टैप करें")}
                  </label>
                  <Button type="button" variant="secondary" className="sm:self-stretch" onClick={useSamplePhoto}>
                    {tr("Use sample photo", "नमूना फोटो लगाएँ")}
                  </Button>
                </div>
              )}
            </Field>
          </Card>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <Card className="p-5">
            <Field label={tr("Location", "स्थान")} htmlFor="addr" required error={errors.location}>
              <Button type="button" variant="secondary" className="mb-3 w-full" onClick={useCurrentLocation} loading={locating}>
                {!locating && <LocateFixed className="h-4 w-4" />}
                {locating ? tr("Detecting…", "खोज रहे हैं…") : tr("Use Current Location", "वर्तमान स्थान का उपयोग करें")}
              </Button>
              <input
                id="addr"
                className={inputClass}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={tr("Address or landmark", "पता या लैंडमार्क")}
              />
            </Field>
            <button type="button" onClick={demoLocation} className="mt-2 text-xs font-semibold text-orange-700 hover:underline">
              {tr("Not in Noida? Use demo location (Sector 62)", "नोएडा में नहीं हैं? डेमो स्थान (सेक्टर 62) उपयोग करें")}
            </button>
            <div className="mt-3">
              <CityMap
                complaints={complaints.filter((c) => c.status !== "resolved")}
                picked={coords}
                focus={coords}
                onPick={(lat, lng) => setLocation(lat, lng)}
                className="h-60"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                {coords
                  ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                  : tr("Tap anywhere on the map to drop a pin.", "पिन लगाने के लिए नक्शे पर कहीं भी टैप करें।")}
              </p>
            </div>
          </Card>
          <Button type="submit" size="lg" className="w-full">
            <Send className="h-5 w-5" />
            {tr("Submit Complaint", "शिकायत जमा करें")}
          </Button>
          <p className="text-center text-xs text-slate-500">
            {tr("Your complaint is routed automatically. You will get notifications at every stage.", "आपकी शिकायत स्वतः रूट होगी। हर चरण पर सूचना मिलेगी।")}
          </p>
        </div>
      </form>
    </Container>
  );
}

function Preview({ src }: { src: string }) {
  const [url, setUrl] = useState<string | undefined>();
  useEffect(() => {
    let alive = true;
    import("@/lib/art").then((m) => alive && setUrl(m.resolveImage(src)));
    return () => {
      alive = false;
    };
  }, [src]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="Evidence preview" className="max-h-64 min-h-40 w-full object-cover" />;
}

/* ---------------- AI analysis animation ---------------- */

function AnalyzingView({ image, category }: { image?: string; category: CategoryKey }) {
  const { tr } = useApp();
  const [step, setStep] = useState(0);
  useEffect(() => {
    const ts = [700, 1400, 2100, 2800].map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  const steps = [
    tr("Reading your description", "आपका विवरण पढ़ा जा रहा है"),
    tr("Analysing the photo", "फोटो का विश्लेषण"),
    tr("Checking for duplicate reports nearby", "आसपास डुप्लिकेट रिपोर्ट की जाँच"),
    tr("Setting priority and routing to a department", "प्राथमिकता तय कर विभाग को भेजना"),
  ];
  return (
    <Container className="max-w-xl py-12">
      <Card className="overflow-hidden p-6 text-center sm:p-8" aria-live="polite">
        <div className="relative mx-auto h-44 w-full max-w-xs overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 to-brand-700">
          {image && <Preview src={image} />}
          {!image && (
            <div className="flex h-full items-center justify-center text-6xl">{CATEGORY_MAP[category]?.emoji ?? "📍"}</div>
          )}
          <div className="absolute inset-0 bg-brand-900/30" />
          <div className="absolute inset-x-0 h-1 animate-scan bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_18px_6px_rgba(103,232,249,.7)]" />
          <Sparkles className="absolute right-3 top-3 h-5 w-5 animate-pulse text-cyan-200" />
        </div>
        <h1 className="mt-6 flex items-center justify-center gap-2 text-xl font-extrabold text-slate-900">
          <ScanSearch className="h-6 w-6 text-brand-600" />
          {tr("AI Analysis in progress…", "AI विश्लेषण जारी है…")}
        </h1>
        <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm">
          {steps.map((s, i) => (
            <li key={s} className={cn("flex items-center gap-2 transition", i <= step ? "text-slate-900" : "text-slate-300")}>
              {i < step ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : i === step ? <Loader2 className="h-4 w-4 animate-spin text-brand-600" /> : <span className="h-4 w-4 rounded-full border border-slate-300" />}
              {s}
            </li>
          ))}
        </ul>
      </Card>
    </Container>
  );
}

/* ---------------- AI result cards ---------------- */

function AiCard({ analysis }: { analysis: Analysis }) {
  const { tr, lang } = useApp();
  const hi = lang === "hi";
  const rows: Array<[string, React.ReactNode]> = [
    [tr("Issue detected", "पहचानी गई समस्या"), <b key="a">{detectedLabel(analysis.detected, hi)}</b>],
    [
      tr("Confidence", "विश्वास स्तर"),
      <span key="b" className="flex items-center gap-2">
        <span className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
          <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${analysis.confidence}%` }} />
        </span>
        <b>{analysis.confidence}%</b>
      </span>,
    ],
    [
      tr("Duplicate check", "डुप्लिकेट जाँच"),
      analysis.duplicate ? (
        <b key="c" className="text-amber-700">{tr("Possible duplicate found", "संभावित डुप्लिकेट मिला")}</b>
      ) : (
        <b key="c" className="text-emerald-700">{tr("No duplicate found", "कोई डुप्लिकेट नहीं मिला")}</b>
      ),
    ],
    [tr("Severity", "गंभीरता"), <PriorityBadge key="d" priority={analysis.severity} />],
    [tr("Suggested Department", "सुझाया गया विभाग"), <b key="e">{deptName(analysis.department, hi)}</b>],
    [tr("Priority", "प्राथमिकता"), <PriorityBadge key="f" priority={analysis.priority} />],
  ];
  return (
    <Card className="border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5">
      <h2 className="flex items-center gap-2 font-extrabold text-brand-900">
        <Sparkles className="h-5 w-5 text-brand-600" />
        {tr("AI Verification", "AI सत्यापन")}
      </h2>
      <dl className="mt-3 divide-y divide-brand-100/70 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 py-2.5">
            <dt className="text-slate-500">{k}</dt>
            <dd className="text-right text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 flex items-start gap-2 rounded-lg bg-white p-2.5 text-xs text-slate-600 ring-1 ring-brand-100">
        <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
        {tr("Priority rule: ", "प्राथमिकता नियम: ")}
        {hi ? analysis.ruleHi : analysis.ruleEn}
      </p>
    </Card>
  );
}

function PriorityRulesCard({ active }: { active: string }) {
  const { tr, lang } = useApp();
  return (
    <Card className="p-5">
      <h2 className="font-extrabold text-slate-900">{tr("Smart Priority rules", "स्मार्ट प्राथमिकता नियम")}</h2>
      <ul className="mt-3 space-y-2">
        {PRIORITY_RULES.map((r) => (
          <li key={r.priority} className={cn("flex items-start gap-3 rounded-xl p-2.5 text-sm", r.priority === active && "bg-slate-50 ring-1 ring-slate-200")}>
            <PriorityBadge priority={r.priority} />
            <span className="text-slate-600">{lang === "hi" ? r.hi : r.en}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ReportInner />
    </Suspense>
  );
}
