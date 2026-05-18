import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { apiClient, ApiError, type NewsItem } from "../api/client";

type LoadState = "idle" | "loading" | "success" | "empty" | "error";

export const TopNews = () => {
  const [state, setState] = useState<LoadState>("idle");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState("loading");
      setErrorMessage(null);
      try {
        const res = await apiClient.getTopNews({ query: "technology", pageSize: 5 });
        if (cancelled) return;
        if (!res.items.length) {
          setItems([]);
          setState("empty");
          return;
        }
        setItems(res.items);
        setState("success");
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError) {
          setErrorMessage(e.message);
        } else {
          setErrorMessage("News temporarily unavailable.");
        }
        setItems([]);
        setState("error");
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading" || state === "idle") {
    return (
      <Card className="mb-6 border border-border bg-card" aria-busy="true" aria-live="polite">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Top news</CardTitle>
          <CardDescription>Loading headlines…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (state === "error") {
    return (
      <Card className="mb-6 border border-border bg-card" role="status" aria-live="polite">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Top news</CardTitle>
          <CardDescription className="text-muted-foreground">
            {errorMessage ?? "Could not load news. Feed below still works."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (state === "empty") {
    return (
      <Card className="mb-6 border border-border bg-card" role="status">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Top news</CardTitle>
          <CardDescription>No headlines returned.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Top news</CardTitle>
        <CardDescription>Headlines from NewsAPI (via backend)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="list-none space-y-2 p-0 m-0">
          {items.map((item, idx) => (
            <li key={`${item.url}-${idx}`}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {item.title}
              </a>
              {item.source ? (
                <p className="text-xs text-muted-foreground mt-0.5">{item.source}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
