import { For } from "solid-js";
import { createQuery } from "../../convex-solid";
import { api } from "../../../convex/_generated/api";
import { getCurrentUser } from "../../convex";
import { Button } from "../../components/Button";
import { Icon } from "solid-heroicons";
import { clipboardDocumentCheck } from "solid-heroicons/outline";
import { Id } from "../../../convex/_generated/dataModel";

type WordData = {
  count: number;
  errors: number;
};

export function Analytics() {
  const { userID, token } = getCurrentUser();
  const typed = createQuery(api.analytics.getPlayerTypedWords, () => ({
    playerId: userID as Id<"players">,
    ...(token ? { token } : {}),
  }));

  function words() {
    const grouped: Record<string, WordData> = {};
    const typedWords = typed() || [];

    for (const { word, hadError } of typedWords) {
      const existing = grouped[word];
      grouped[word] = {
        count: (existing?.count || 0) + 1,
        errors: (existing?.errors || 0) + (hadError ? 1 : 0),
      };
    }

    return Object.entries(grouped).filter(([, data]) => data.errors > 1);
  }

  function sortedWords() {
    const sorted = words();
    sorted.sort((a, b) => b[1].count - a[1].count);
    sorted.sort((a, b) => b[1].errors - a[1].errors);
    return sorted;
  }

  return (
    <div class="border border-base-200 rounded p-4 mx-auto">
      <div class="text-secondary mb-4 max-w-2xl">
        <div class="mb-2">
          {`On your typed words, the ones with at least 2 errors.`}
        </div>
        <div class="mb-4">
          {`Words are sorted by total number of errors which is a good indicator of how much those words slow you down (since it combines frequency and error rate).`}
        </div>
        <Button
          onClick={() =>
            navigator.clipboard.writeText(
              sortedWords()
                .map(([w]) => w)
                .join(""),
            )
          }
        >
          <Icon path={clipboardDocumentCheck} class="size-5" />
          {`Copy those ${sortedWords().length} words`}
        </Button>
      </div>

      <table class="table">
        <thead>
          <tr />
          <tr>
            <th />
            <th>Word</th>
            <th>Errors</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          <For each={sortedWords()}>
            {([word, data]) => <Line word={word} {...data} />}
          </For>
        </tbody>
      </table>
    </div>
  );
}

function Line(props: WordData & { word: string }) {
  return (
    <tr>
      <th />
      <th>{props.word}</th>
      <th>{props.errors}</th>
      <th>{props.count}</th>
    </tr>
  );
}
