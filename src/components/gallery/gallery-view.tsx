"use client";

import { useCallback, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ImageGrid } from "@/components/gallery/image-grid";
import { useToast } from "@/components/providers/toast-provider";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import type { GalleryPage, GenerationView } from "@/server/services/generation.service";

/**
 * Paginated gallery.
 *
 * The first page is server-rendered and handed in, so the grid paints with
 * content instead of a skeleton; subsequent pages load on demand by cursor.
 */
export function GalleryView({
  initialPage,
  /** "mine" adds management controls; "explore" is the read-only public feed. */
  mode,
}: {
  initialPage: GalleryPage;
  mode: "mine" | "explore";
}) {
  const { toast } = useToast();
  const [items, setItems] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const owned = mode === "mine";
  const endpoint = owned ? "/api/generations" : "/api/explore";

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await apiRequest<GalleryPage>(
        `${endpoint}?cursor=${encodeURIComponent(cursor)}`,
      );
      setItems((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
    } catch (error) {
      toast({
        tone: "error",
        title: "Could not load more",
        description: error instanceof ApiClientError ? error.message : undefined,
      });
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, endpoint, toast]);

  const togglePublic = useCallback(
    async (item: GenerationView) => {
      setBusyId(item.id);
      const nextValue = !item.isPublic;

      // Optimistic - the toggle is cheap to undo if the request fails.
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, isPublic: nextValue } : entry,
        ),
      );

      try {
        await apiRequest(`/api/generations/${item.id}`, {
          method: "PATCH",
          body: { isPublic: nextValue },
        });
        toast({
          tone: "success",
          title: nextValue ? "Published to the showcase" : "Made private",
        });
      } catch (error) {
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, isPublic: !nextValue } : entry,
          ),
        );
        toast({
          tone: "error",
          title: "Could not update visibility",
          description: error instanceof ApiClientError ? error.message : undefined,
        });
      } finally {
        setBusyId(null);
      }
    },
    [toast],
  );

  const remove = useCallback(
    async (item: GenerationView) => {
      const snapshot = items;
      setItems((current) => current.filter((entry) => entry.id !== item.id));

      try {
        await apiRequest(`/api/generations/${item.id}`, { method: "DELETE" });
        toast({ tone: "success", title: "Image deleted" });
      } catch (error) {
        setItems(snapshot);
        toast({
          tone: "error",
          title: "Could not delete that image",
          description: error instanceof ApiClientError ? error.message : undefined,
        });
      }
    },
    [items, toast],
  );

  if (items.length === 0) {
    return (
      <div className="panel hairline-top flex flex-col items-center px-6 py-20 text-center">
        <span className="grid size-14 place-items-center rounded-2xl border border-[var(--line)] bg-surface-2/60">
          <ImagePlus className="size-6 text-faint" aria-hidden />
        </span>
        <p className="mt-5 text-lg text-bright">
          {owned ? "Nothing here yet" : "No public images yet"}
        </p>
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
          {owned
            ? "Every image you generate is saved here automatically, at full resolution."
            : "When people publish their work to the showcase, it will appear here."}
        </p>
        <ButtonLink href="/studio" className="mt-7">
          {owned ? "Make your first image" : "Create something"}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <ImageGrid
        items={items}
        owned={owned}
        busyId={busyId}
        onTogglePublic={owned ? (item) => void togglePublic(item) : undefined}
        onDelete={owned ? (item) => void remove(item) : undefined}
      />

      {cursor ? (
        <div className="flex justify-center">
          <Button variant="secondary" loading={loadingMore} onClick={() => void loadMore()}>
            {loadingMore ? "Loading" : "Load more"}
          </Button>
        </div>
      ) : (
        <p className="text-center text-[13px] text-faint">
          That is everything.
        </p>
      )}
    </div>
  );
}
