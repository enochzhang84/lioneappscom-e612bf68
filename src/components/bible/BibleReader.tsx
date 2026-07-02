import * as React from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type Book = { bookid: number; name: string; chapters: number };
type Verse = { pk: number; verse: number; text: string };

export type BibleReaderProps = {
  translation: string; // bolls.life code, e.g. "CUV", "CUNP"
  title: string;
  subtitle: string;
  fallbackBooks: Book[];
  stripSpaces?: boolean;
  sourceNote?: string;
};

export function BibleReader({
  translation,
  title,
  subtitle,
  fallbackBooks,
  stripSpaces = true,
  sourceNote,
}: BibleReaderProps) {
  const [books, setBooks] = React.useState<Book[]>(fallbackBooks);
  const [book, setBook] = React.useState<Book | null>(null);
  const [chapter, setChapter] = React.useState<number | null>(null);
  const [verses, setVerses] = React.useState<Verse[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`https://bolls.life/get-books/${translation}/`)
      .then((r) => r.json())
      .then((data: Book[]) => {
        if (Array.isArray(data) && data.length >= 66) {
          setBooks(data.slice(0, 66).sort((a, b) => a.bookid - b.bookid));
        }
      })
      .catch(() => {});
  }, [translation]);

  React.useEffect(() => {
    if (!book || !chapter) return;
    setLoading(true);
    setError(null);
    setVerses(null);
    fetch(`https://bolls.life/get-chapter/${translation}/${book.bookid}/${chapter}/`)
      .then((r) => r.json())
      .then((data: Verse[]) => setVerses(data))
      .catch(() => setError("加載章節失敗，請檢查網絡後重試。"))
      .finally(() => setLoading(false));
  }, [book, chapter, translation]);

  React.useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [book, chapter]);

  if (book && chapter) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-6 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => { setChapter(null); setVerses(null); }}>
            <ArrowLeft size={14} className="mr-1" /> 返回 {book.name} 章節
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setBook(null); setChapter(null); setVerses(null); }}>
            返回目錄
          </Button>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {book.name} 第 {chapter} 章
        </h1>
        <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>

        {loading && (
          <div className="mt-10 flex items-center justify-center text-muted-foreground">
            <Loader2 className="animate-spin mr-2" size={18} /> 加載中…
          </div>
        )}
        {error && <div className="mt-6 text-sm text-destructive">{error}</div>}

        {verses && (
          <article className="mt-6 space-y-3 text-[17px] md:text-lg leading-[2.1] text-foreground">
            {verses.map((v) => {
              let text = v.text.replace(/<[^>]+>/g, "");
              if (stripSpaces) text = text.replace(/\s+/g, "");
              return (
                <p key={v.pk} className="scroll-mt-24" id={`v${v.verse}`}>
                  <sup className="mr-1.5 text-primary font-semibold text-xs align-super">{v.verse}</sup>
                  {text}
                </p>
              );
            })}
          </article>
        )}

        <div className="mt-10 flex items-center justify-between border-t border-border pt-4">
          <Button variant="outline" size="sm" disabled={chapter <= 1} onClick={() => setChapter(chapter - 1)}>
            <ChevronLeft size={14} className="mr-1" /> 上一章
          </Button>
          <div className="text-sm text-muted-foreground">{chapter} / {book.chapters}</div>
          <Button variant="outline" size="sm" disabled={chapter >= book.chapters} onClick={() => setChapter(chapter + 1)}>
            下一章 <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  if (book) {
    return (
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-6 md:py-10">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => setBook(null)}>
          <ArrowLeft size={14} className="mr-1" /> 返回目錄
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{book.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">共 {book.chapters} 章 · 請選擇章節</p>
        <div className="mt-6 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
            <button
              key={c}
              onClick={() => setChapter(c)}
              className="h-10 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 hover:text-primary text-sm font-medium transition"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const ot = books.filter((b) => b.bookid <= 39);
  const nt = books.filter((b) => b.bookid >= 40);
  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
          <BookOpen size={22} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <Section title="舊約全書 — Old Testament" books={ot} onPick={setBook} />
      <Section title="新約全書 — New Testament" books={nt} onPick={setBook} />

      {sourceNote && <p className="mt-8 text-xs text-muted-foreground">{sourceNote}</p>}
    </div>
  );
}

function Section({ title, books, onPick }: { title: string; books: Book[]; onPick: (b: Book) => void }) {
  return (
    <section className="mt-6">
      <h2 className="text-base font-semibold text-foreground/80 mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {books.map((b) => (
          <button
            key={b.bookid}
            onClick={() => onPick(b)}
            className="text-left px-3 py-2.5 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 hover:text-primary text-sm font-medium transition flex items-center justify-between gap-2"
          >
            <span className="truncate">{b.name}</span>
            <span className="text-[10px] text-muted-foreground">{b.chapters}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
