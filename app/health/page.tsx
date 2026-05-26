import { headers } from "next/headers";

export const dynamic = "force-dynamic";

interface Row {
  label: string;
  value: string;
  href?: string;
  ok?: boolean;
}

export default async function HealthPage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3002";
  const proto =
    headersList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.match(/^[\d.]+:/) ? "http" : "https");
  const origin = `${proto}://${host}`;

  const manifestUrl = `${origin}/manifest.webmanifest`;
  const icon192Url = `${origin}/icons/icon-192.png`;
  const icon512Url = `${origin}/icons/icon-512.png`;
  const appleIconUrl = `${origin}/icons/apple-touch-icon.png`;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseOk = Boolean(supabaseUrl && supabaseKey);

  const rows: Row[] = [
    { label: "Origin", value: origin },
    { label: "Manifest", value: manifestUrl, href: manifestUrl },
    { label: "icon-192.png", value: icon192Url, href: icon192Url },
    { label: "icon-512.png", value: icon512Url, href: icon512Url },
    { label: "apple-touch-icon.png", value: appleIconUrl, href: appleIconUrl },
    {
      label: "Supabase",
      value: supabaseOk ? "configured" : "missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)",
      ok: supabaseOk,
    },
    { label: "NODE_ENV", value: process.env.NODE_ENV ?? "unknown" },
  ];

  return (
    <div className="mx-auto max-w-md px-4 pt-8 pb-24">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1f7a72]">
        TOPIK Memorize
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Health Check</h1>
      <p className="mt-2 text-sm text-slate-500">PWA 资源与环境诊断。不显示任何 secret。</p>

      <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {rows.map(({ label, value, href, ok }) => (
          <div key={label} className="flex flex-col gap-0.5 px-4 py-3">
            <span className="text-xs font-medium text-slate-500">{label}</span>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-sm text-blue-600 underline underline-offset-2"
              >
                {value}
              </a>
            ) : (
              <span
                className={`break-all text-sm font-mono ${
                  ok === false
                    ? "text-red-600"
                    : ok === true
                      ? "text-emerald-600"
                      : "text-slate-800"
                }`}
              >
                {value}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        提示：点击上方链接可在浏览器中直接验证资源是否可访问。
      </p>
    </div>
  );
}
