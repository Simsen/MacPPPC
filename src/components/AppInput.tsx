import { useRef, useState, type DragEvent } from 'react';
import { Upload, ChevronDown, AlertCircle, Package } from 'lucide-react';
import { Card, CardHeader, CardBody } from './Card';
import { processFile } from '@/lib/files';
import type { AppInfo, KnownApp } from '@/lib/types';
import { cn } from '@/lib/cn';

interface Props {
  knownApps: KnownApp[];
  onAppDetected: (info: AppInfo, fromKnownList: boolean) => void;
  onError: (message: string) => void;
  error: string | null;
  onClearError: () => void;
  alreadySelectedBundleIds: string[];
}

export function AppInput({
  knownApps,
  onAppDetected,
  onError,
  error,
  onClearError,
  alreadySelectedBundleIds,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    onClearError();
    for (const file of Array.from(files)) {
      try {
        const info = await processFile(file, knownApps);
        onAppDetected(info, false);
      } catch (e) {
        onError(e instanceof Error ? e.message : String(e));
      }
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    void handleFiles(e.dataTransfer.files);
  }

  function pickKnown(bundleId: string) {
    const known = knownApps.find((a) => a.bundleId === bundleId);
    if (!known) return;
    setMenuOpen(false);
    onClearError();
    onAppDetected(
      {
        bundleId: known.bundleId,
        displayName: known.displayName,
        codeRequirement: known.codeRequirement,
      },
      true,
    );
  }

  return (
    <Card>
      <CardHeader
        icon={<Upload className="w-4 h-4" />}
        title="Select Application"
        subtitle="Upload a .zip / Info.plist or pick a known app"
      />
      <CardBody>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <label
          className={cn(
            'group relative flex flex-col items-center justify-center text-center p-8 rounded-xl border-2 border-dashed border-border-strong/70 bg-card-elevated/40 cursor-pointer transition hover:border-primary/50 hover:bg-primary/[0.03]',
            dragOver && 'border-primary bg-primary/[0.06]',
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,.plist"
            multiple
            className="sr-only"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="w-12 h-12 mb-3 rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 flex items-center justify-center transition group-hover:scale-105">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium">
            Drag & drop a <span className="text-primary font-medium">.zip</span>{' '}
            file
          </p>
          <p className="text-xs text-muted-foreground">
            containing your .app bundle
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or upload an{' '}
            <span className="text-primary font-medium">Info.plist</span>{' '}
            directly
          </p>
        </label>

        <div>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg border border-border bg-card-elevated/40 hover:bg-background/60 transition"
          >
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Or select a known application…</span>
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 transition',
                menuOpen && 'rotate-180',
              )}
            />
          </button>
          {menuOpen && (
            <div className="mt-2 rounded-lg border border-border bg-card shadow-[var(--shadow-lift)] overflow-y-auto max-h-[300px]">
              {knownApps.length === 0 && (
                <div className="px-4 py-3 text-xs text-muted-foreground">
                  No known apps in the library yet.
                </div>
              )}
              {knownApps.map((app) => {
                const already = alreadySelectedBundleIds.includes(app.bundleId);
                return (
                  <button
                    key={app.bundleId}
                    type="button"
                    disabled={already}
                    onClick={() => pickKnown(app.bundleId)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm hover:bg-primary/[0.06] transition border-b border-border/60 last:border-0',
                      already && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <div className="font-medium">{app.displayName}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      {app.bundleId}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg border border-destructive/25 bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      </CardBody>
    </Card>
  );
}
