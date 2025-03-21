import { For } from "solid-js";
import { Zero } from "@rocicorp/zero";
import { Schema } from "../../schema";
import { useQuery } from "@rocicorp/zero/solid";
import { Button } from "../../components/Button";
import { Icon } from "solid-heroicons";
import { clipboardDocumentCheck } from "solid-heroicons/outline";

const LIMIT = 3000;

type WordData = {
  count: number;
  errors: number;
};

export function Profile(props: { z: Zero<Schema> }) {
  const [typed] = useQuery(() =>
    props.z.query.typed_word
      .where("playerID", "=", props.z.userID)
      .orderBy("timestamp", "desc")
      .limit(LIMIT),
  );

  function words() {
    const grouped: Record<string, WordData> = {};

    for (const { word, hadError } of typed()) {
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
          {`On the last ${LIMIT} words typed, the ones with at least 2 errors.`}
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
