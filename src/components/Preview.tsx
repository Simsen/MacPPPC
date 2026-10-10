import { useState } from 'react';
import JSZip from 'jszip';
import {
  Copy,
  Download,
  Check,
  FileCode2,
  CheckCircle2,
  CircleDashed,
  Upload as UploadIcon,
  ChevronRight,
  ChevronDown,
  WrapText,
  AlignLeft,
} from 'lucide-react';
import type { GeneratedProfile } from '@/lib/types';
import { cn } from '@/lib/cn';
import { XmlHighlight } from './XmlHighlight';

interface Props {
  profiles: GeneratedProfile[];
  onDeploy?: () => void;
  deployEnabled?: boolean;
}

export function Preview({ profiles, onDeploy, deployEnabled }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [wrap, setWrap] = useState(false);

  const hasProfiles = profiles.length > 0;
  const totalBytes = profiles.reduce((s, p) => s + p.content.length, 0);
  const format = profiles[0]?.format ?? 'classic';
  const isJson = format === 'settingsCatalog';
  // macOS 27 can emit PPPC + DDM policies even in bundle mode.
  const multi = profiles.length > 1;

  function showCopied(key: string) {
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyContent(p: GeneratedProfile, key: string) {
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = p.content;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showCopied(key);
      } catch {
        // ignore
      }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(p.content)
        .then(() => showCopied(key))
        .catch(fallback);
    } else {
      fallback();
    }
  }

  async function download() {
    if (!hasProfiles) return;
    if (!multi) {
      const p = profiles[0];
      const mime =
        p.format === 'settingsCatalog' ? 'application/json' : 'application/x-apple-aspen-config';
      triggerDownload(new Blob([p.content], { type: mime }), p.filename);
      return;
    }
    const zip = new JSZip();
    for (const p of profiles) zip.file(p.filename, p.content);
    const blob = await zip.generateAsync({ type: 'blob' });
    const zipName = isJson ? 'pppc-policies.zip' : 'pppc-profiles.zip';
    triggerDownload(blob, zipName);
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const fallbackFilename = isJson ? 'policy.json' : 'profile.mobileconfig';
  const headerFilename = hasProfiles
    ? multi
      ? `${profiles.length} policies`
      : profiles[0]?.filename ?? fallbackFilename
    : fallbackFilename;

  const downloadLabel =
    multi
      ? `Download .zip (${profiles.length})`
      : 'Download';

  return (
    <div className="rounded-lg border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden flex flex-col max-h-[calc(100vh-5.5rem)]">
      {/* Title bar */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/60 bg-card-elevated/40">
        <FileCode2 className="w-4 h-4 text-primary" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{headerFilename}</div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            {hasProfiles ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-primary" />
                <span>
                  Valid · {totalBytes.toLocaleString()} bytes
                  {multi
                    ? ` · ${profiles.length} files`
                    : ''}
                </span>
              </>
            ) : (
              <>
                <CircleDashed className="w-3 h-3" />
                <span>Awaiting input…</span>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setWrap((w) => !w)}
          title={wrap ? 'Disable word wrap' : 'Wrap long lines'}
          aria-pressed={wrap}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition',
            wrap
              ? 'border-primary/40 bg-primary/15 text-primary'
              : 'border-border/60 text-muted-foreground hover:text-foreground hover:bg-card-elevated',
          )}
        >
          {wrap ? (
            <AlignLeft className="w-3.5 h-3.5" />
          ) : (
            <WrapText className="w-3.5 h-3.5" />
          )}
          {wrap ? 'No wrap' : 'Wrap'}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        {!hasProfiles && (
          <pre className="text-[11px] font-mono leading-relaxed p-4 whitespace-pre text-muted-foreground">
            {isJson
              ? '// Select an app and enable permissions to preview'
              : '<!-- Select an app and enable permissions to preview -->'}
          </pre>
        )}

        {hasProfiles && (
          <div className="divide-y divide-border/60">
            {profiles.map((p) => {
              const key = p.bundleId ?? p.filename;
              const open = !!openMap[key];
              const permTags = p.labels;
              return (
                <div key={key}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMap((m) => ({ ...m, [key]: !m[key] }))
                    }
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-card-elevated/40 transition"
                  >
                    {open ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">
                        {p.filename}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {p.policyName} · {p.content.length.toLocaleString()} bytes
                      </div>
                    </div>
                  </button>
                  {open && (
                    <div className="bg-background/60 border-t border-border/60">
                      {permTags.length > 0 && (
                        <div className="px-4 py-2.5 border-b border-border/60">
                          <div className="section-label mb-1.5">Permissions</div>
                          <div className="flex flex-wrap gap-1.5">
                            {permTags.map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-end px-2 py-1.5 border-b border-border/60">
                        <button
                          type="button"
                          onClick={() => copyContent(p, key)}
                          className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-card-elevated/60 transition"
                        >
                          {copied === key ? (
                            <>
                              <Check className="w-3 h-3 text-primary" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              {p.format === 'settingsCatalog' ? 'Copy JSON' : 'Copy XML'}
                            </>
                          )}
                        </button>
                      </div>
                      <div className="max-h-[60vh] overflow-auto">
                        {p.format === 'classic' ? (
                          <XmlHighlight xml={p.content} wrap={wrap} />
                        ) : (
                          <pre
                            className={cn(
                              'text-[11px] font-mono leading-relaxed p-4',
                              wrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre',
                            )}
                          >
                            {p.content}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 p-3 border-t border-border/60 bg-card-elevated/40">
        {!multi && (
          <button
            type="button"
            onClick={() => hasProfiles && copyContent(profiles[0], 'bundle')}
            disabled={!hasProfiles}
            className={cn(
              'inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md border border-border/60 transition',
              hasProfiles ? 'hover:bg-card-elevated' : 'opacity-50 cursor-not-allowed',
            )}
          >
            {copied === 'bundle' ? (
              <>
                <Check className="w-4 h-4 text-primary" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        )}
        {multi && (
          <div className="text-[11px] text-muted-foreground self-center px-2">
            Use Copy inside each policy, or Download for all.
          </div>
        )}
        <button
          type="button"
          onClick={() => void download()}
          disabled={!hasProfiles}
          className={cn(
            'inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium transition shadow-sm',
            hasProfiles ? 'hover:bg-primary-strong' : 'opacity-50 cursor-not-allowed',
          )}
        >
          <Download className="w-4 h-4" />
          {downloadLabel}
        </button>
        <button
          type="button"
          onClick={onDeploy}
          disabled={!deployEnabled || !hasProfiles}
          className={cn(
            'col-span-2 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md border transition',
            deployEnabled && hasProfiles
              ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/15'
              : 'border-border/60 bg-card-elevated/40 text-muted-foreground cursor-not-allowed',
          )}
          title={deployEnabled ? 'Continue to deploy' : 'Generate profiles first'}
        >
          <UploadIcon className="w-4 h-4" />
          {multi
            ? `Deploy ${profiles.length} policies to Intune`
            : 'Deploy to Intune'}
        </button>
      </div>
    </div>
  );
}
