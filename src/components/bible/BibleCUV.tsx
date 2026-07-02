import * as React from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type Book = { bookid: number; name: string; chapters: number };
type Verse = { pk: number; verse: number; text: string };

const BOOKS_URL = "https://bolls.life/get-books/CUV/";
const CHAPTER_URL = (b: number, c: number) => `https://bolls.life/get-chapter/CUV/${b}/${c}/`;

/** Fallback book list (bolls.life CUV order, matches 和合本 66 books). */
const FALLBACK_BOOKS: Book[] = [
  ["创世记",50],["出埃及记",40],["利未记",27],["民数记",36],["申命记",34],
  ["约书亚记",24],["士师记",21],["路得记",4],["撒母耳记上",31],["撒母耳记下",24],
  ["列王纪上",22],["列王纪下",25],["历代志上",29],["历代志下",36],["以斯拉记",10],
  ["尼希米记",13],["以斯帖记",10],["约伯记",42],["诗篇",150],["箴言",31],
  ["传道书",12],["雅歌",8],["以赛亚书",66],["耶利米书",52],["耶利米哀歌",5],
  ["以西结书",48],["但以理书",12],["何西阿书",14],["约珥书",3],["阿摩司书",9],
  ["俄巴底亚书",1],["约拿书",4],["弥迦书",7],["那鸿书",3],["哈巴谷书",3],
  ["西番雅书",3],["哈该书",2],["撒迦利亚书",14],["玛拉基书",4],
  ["马太福音",28],["马可福音",16],["路加福音",24],["约翰福音",21],["使徒行传",28],
  ["罗马书",16],["哥林多前书",16],["哥林多后书",13],["加拉太书",6],["以弗所书",6],
  ["腓立比书",4],["歌罗西书",4],["帖撒罗尼迦前书",5],["帖撒罗尼迦后书",3],
  ["提摩太前书",6],["提摩太后书",4],["提多书",3],["腓利门书",1],["希伯来书",13],
  ["雅各书",5],["彼得前书",5],["彼得后书",3],["约翰一书",5],["约翰二书",1],
  ["约翰三书",1],["犹大书",1],["启示录",22],
].map(([name, chapters], i) => ({ bookid: i + 1, name: name as string, chapters: chapters as number }));

export function BibleCUV() {
  const [books, setBooks] = React.useState<Book[]>(FALLBACK_BOOKS);
  const [book, setBook] = React.useState<Book | null>(null);
  const [chapter, setChapter] = React.useState<number | null>(null);
  const [verses, setVerses] = React.useState<Verse[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(BOOKS_URL)
      .then((r) => r.json())
      .then((data: Book[]) => {
        if (Array.isArray(data) && data.length >= 66) {
          setBooks(data.slice(0, 66).sort((a, b) => a.bookid - b.bookid));
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!book || !chapter) return;
    setLoading(true);
    setError(null);
    setVerses(null);
    fetch(CHAPTER_URL(book.bookid, chapter))
      .then((r) => r.json())
      .then((data: Verse[]) => setVerses(data))
      .catch(() => setError("加载章节失败，请检查网络后重试。"))
      .finally(() => setLoading(false));
  }, [book, chapter]);

  React.useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [book, chapter]);

  // === Reader view ===
  if (book && chapter) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-6 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => { setChapter(null); setVerses(null); }}>
            <ArrowLeft size={14} className="mr-1" /> 返回 {book.name} 章节
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setBook(null); setChapter(null); setVerses(null); }}>
            返回目录
          </Button>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {book.name} 第 {chapter} 章
        </h1>
        <div className="mt-1 text-xs text-muted-foreground">和合本 CUV · Chinese Union Version</div>

        {loading && (
          <div className="mt-10 flex items-center justify-center text-muted-foreground">
            <Loader2 className="animate-spin mr-2" size={18} /> 加载中…
          </div>
        )}
        {error && <div className="mt-6 text-sm text-destructive">{error}</div>}

        {verses && (
          <article className="mt-6 space-y-3 text-[17px] md:text-lg leading-[2.1] text-foreground">
            {verses.map((v) => (
              <p key={v.pk} className="scroll-mt-24" id={`v${v.verse}`}>
                <sup className="mr-1.5 text-primary font-semibold text-xs align-super">{v.verse}</sup>
                {v.text.replace(/\s+/g, "")}
              </p>
            ))}
          </article>
        )}

        <div className="mt-10 flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={chapter <= 1}
            onClick={() => setChapter(chapter - 1)}
          >
            <ChevronLeft size={14} className="mr-1" /> 上一章
          </Button>
          <div className="text-sm text-muted-foreground">{chapter} / {book.chapters}</div>
          <Button
            variant="outline"
            size="sm"
            disabled={chapter >= book.chapters}
            onClick={() => setChapter(chapter + 1)}
          >
            下一章 <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // === Chapter picker ===
  if (book) {
    return (
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-6 md:py-10">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => setBook(null)}>
          <ArrowLeft size={14} className="mr-1" /> 返回目录
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{book.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">共 {book.chapters} 章 · 请选择章节</p>
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

  // === Book index (like wordproject.org) ===
  const ot = books.filter((b) => b.bookid <= 39);
  const nt = books.filter((b) => b.bookid >= 40);
  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
          <BookOpen size={22} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">圣经 · 和合本</h1>
          <p className="text-sm text-muted-foreground">The Holy Bible in Chinese — Simplified [CUV]</p>
        </div>
      </div>

      <Section title="旧约全书 — Old Testament" books={ot} onPick={setBook} />
      <Section title="新约全书 — New Testament" books={nt} onPick={setBook} />

      <p className="mt-8 text-xs text-muted-foreground">
        经文数据来源：bolls.life（CUV 和合本公有领域）。
      </p>
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
